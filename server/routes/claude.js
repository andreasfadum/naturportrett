import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import * as biodiversity from '../prompts/biodiversity.js'
import * as naturportrett from '../prompts/naturportrett.js'
import * as artsportrett from '../prompts/artsportrett.js'
import * as planteportrett from '../prompts/planteportrett.js'
import * as naturtypeportrett from '../prompts/naturtypeportrett.js'

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
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: biodiversity.SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
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

  try {
    const userMessage = promptModule.buildUserPrompt(payload)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: promptModule.SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const rawText = response.content?.[0]?.text || ''
    // Trekk ut JSON: noen ganger pakkes svaret i markdown-codefences
    const jsonText = extractJson(rawText)

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      console.warn('JSON parse-feil, returnerer rå tekst som fallback:', parseErr.message)
      return res.status(502).json({
        error: 'Kunne ikke tolke svaret fra Claude som JSON.',
        rawText: rawText.slice(0, 2000),
      })
    }

    return res.json({ portrait: parsed, model: 'claude-sonnet-4-6' })
  } catch (err) {
    console.error('Claude portrait-feil:', err.message)
    let userMessage = err.message
    if (err.status === 401) {
      userMessage = 'API-nøkkelen er ugyldig.'
    } else if (err.status === 429) {
      userMessage = 'For mange forespørsler. Vent litt og prøv igjen.'
    }
    return res.status(500).json({ error: userMessage })
  }
})

function extractJson(text) {
  if (!text) return ''
  // Fjern markdown codefences hvis de finnes
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  // Plukk ut første '{' til siste '}'
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) return text.slice(start, end + 1)
  return text.trim()
}
