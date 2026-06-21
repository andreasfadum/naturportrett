import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import * as biodiversity from '../prompts/biodiversity.js'
import * as naturportrett from '../prompts/naturportrett.js'
import * as artsportrett from '../prompts/artsportrett.js'
import * as planteportrett from '../prompts/planteportrett.js'
import * as naturtypeportrett from '../prompts/naturtypeportrett.js'
import { enrichRelevanteLover } from '../lover/index.js'
import { CLAUDE_MODEL, MODEL_CHAIN, isModelNotFoundError } from '../config/model.js'
import { logUsage } from '../usage/index.js'

function klientIp(req) {
  return req.ip || req.socket?.remoteAddress || null
}

export const claudeRouter = Router()

const PORTRAIT_MODULES = {
  naturportrett,
  artsportrett,
  planteportrett,
  naturtypeportrett,
}

// Eldre endepunkt — beholdt for kompatibilitet med tidligere "vurdering"-flyt
claudeRouter.post('/', async (req, res) => {
  const { address, zoneRadiusM = 500, selectedSpecies } = req.body

  if (!selectedSpecies || selectedSpecies.length === 0) {
    return res.status(400).json({ error: 'Ingen arter valgt' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY mangler. Sjekk at .env-filen er lagret og restart serveren med npm run dev:all.' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const userMessage = biodiversity.buildUserPrompt(address, zoneRadiusM, selectedSpecies)
    const stream = client.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      system: biodiversity.SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }

    // Hent usage etter at streamen er ferdig (Anthropic SDK gir finalMessage)
    try {
      const finalMessage = await stream.finalMessage()
      logUsage({
        ip: klientIp(req),
        kontekst: 'vurdering',
        modell: finalMessage?.model || CLAUDE_MODEL,
        usage: finalMessage?.usage,
      })
    } catch (logErr) {
      console.warn('[usage] Kunne ikke hente finalMessage for vurdering:', logErr.message)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Claude API-feil:', err.message)
    let userMessage = err.message
    if (err.status === 401) {
      userMessage = 'API-nøkkelen er ugyldig. Gå til console.anthropic.com, generer en ny nøkkel, og oppdater .env-filen.'
    } else if (err.status === 429) {
      userMessage = 'For mange forespørsler. Vent litt og prøv igjen.'
    }
    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`)
    res.end()
  }
})

// Nytt endepunkt for portretter: JSON-respons
claudeRouter.post('/portrait', async (req, res) => {
  const { portraitType, payload } = req.body

  const promptModule = PORTRAIT_MODULES[portraitType]
  if (!promptModule) {
    return res.status(400).json({ error: `Ukjent portrettype: ${portraitType}` })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY mangler i Railway-variabler eller .env.' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let modelUsed = CLAUDE_MODEL
  try {
    const userMessage = promptModule.buildUserPrompt(payload)
    const result = await createWithRetry(client, {
      max_tokens: 8000,
      system: promptModule.SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    const response = result.response
    modelUsed = result.modelUsed

    const rawText = response.content?.[0]?.text || ''
    const stopReason = response.stop_reason

    const jsonText = extractBalancedJson(rawText)

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      // Forsøk å autofikse vanlige feil og parse på nytt
      try {
        parsed = JSON.parse(autoFixJson(jsonText))
      } catch (parseErr2) {
        console.warn('JSON parse-feil:', parseErr2.message, '| stop_reason:', stopReason)
        const truncated = stopReason === 'max_tokens'
        return res.status(502).json({
          error: truncated
            ? 'KI-svaret ble for langt og avkortet før det var ferdig. Prøv igjen — i de fleste tilfeller fungerer det andre forsøk.'
            : 'Kunne ikke tolke svaret fra Claude som strukturert data. Prøv igjen.',
          stopReason,
          rawText: rawText.slice(0, 2000),
        })
      }
    }

    if (Array.isArray(parsed.relevanteLover)) {
      parsed.relevanteLoverEnriched = enrichRelevanteLover(parsed.relevanteLover)
    }

    logUsage({
      ip: klientIp(req),
      kontekst: `portrait:${portraitType}`,
      modell: modelUsed,
      usage: response.usage,
    })

    return res.json({ portrait: parsed, model: modelUsed, stopReason })
  } catch (err) {
    console.error('Claude portrait-feil:', err.message)
    let userMessage = err.message
    if (err.status === 401) {
      userMessage = 'API-nøkkelen er ugyldig.'
    } else if (err.status === 429) {
      userMessage = 'For mange forespørsler. Vent litt og prøv igjen.'
    } else if (err.status >= 500) {
      userMessage = 'Midlertidig feil hos KI-leverandøren. Prøv igjen om litt.'
    }
    return res.status(500).json({ error: userMessage })
  }
})

/**
 * Kaller Anthropic med automatisk gjenforsøk på forbigående feil (5xx + 429)
 * OG automatisk fallback til neste modell i MODEL_CHAIN ved 404 (modellen
 * er deprecated/retired). Returnerer { response, modelUsed } slik at kalleren
 * kan logge hvilken modell som faktisk svarte.
 *
 * Forbigående feil (529/503/429): inntil 2 gjenforsøk med backoff per modell.
 * Permanent 404: gå videre til neste modell i kjeden uten å vente.
 * Andre feil (401, 400 osv.): kastes umiddelbart.
 */
async function createWithRetry(client, params, maxRetries = 2) {
  let lastErr
  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await client.messages.create({ ...params, model })
        if (model !== MODEL_CHAIN[0]) {
          console.warn(`KI-fallback: brukte ${model} i stedet for ${MODEL_CHAIN[0]} (sannsynligvis deprecated/retired)`)
        }
        return { response, modelUsed: model }
      } catch (err) {
        lastErr = err
        if (isModelNotFoundError(err)) {
          console.warn(`Modell ${model} ikke funnet (deprecated/retired) — prøver neste i kjeden`)
          break // hopp til neste modell uten å vente
        }
        const transient = err.status >= 500 || err.status === 429
        if (transient && attempt < maxRetries) {
          const waitMs = 1500 * (attempt + 1)
          console.warn(`Forbigående KI-feil (status ${err.status}) på ${model} — gjenforsøk ${attempt + 1}/${maxRetries} om ${waitMs} ms`)
          await new Promise(r => setTimeout(r, waitMs))
          continue
        }
        throw err
      }
    }
  }
  throw lastErr
}

/**
 * Ekstraher JSON ved å telle balanserte braces.
 * Håndterer markdown codefences, foran-/etter-tekst, og avkortet JSON.
 */
function extractBalancedJson(text) {
  if (!text) return ''

  // Fjern markdown codefences hvis de finnes
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) text = fenceMatch[1]

  const start = text.indexOf('{')
  if (start < 0) return text.trim()

  let depth = 0
  let inString = false
  let escape = false
  let end = -1

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }

  if (end > 0) return text.slice(start, end + 1)

  // Hvis vi ikke fant balanse: forsøk å lukke uavsluttede strukturer
  let salvaged = text.slice(start)
  if (inString) salvaged += '"'
  salvaged += '}'.repeat(Math.max(depth, 0))
  return salvaged
}

/**
 * Vanlige fikser for ugyldig JSON som Claude av og til produserer.
 */
function autoFixJson(text) {
  let s = text
  // Fjern trailing commas: ", }" og ", ]"
  s = s.replace(/,\s*([}\]])/g, '$1')
  // Fjern eventuelle linjebrytinger inni strengverdier som ikke er escaped
  // (forsiktig: bare innenfor "..." par)
  return s
}
