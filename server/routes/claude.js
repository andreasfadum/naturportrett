import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import * as biodiversity from '../prompts/biodiversity.js'
import * as naturportrett from '../prompts/naturportrett.js'
import * as artsportrett from '../prompts/artsportrett.js'
import * as planteportrett from '../prompts/planteportrett.js'
import * as naturtypeportrett from '../prompts/naturtypeportrett.js'
import * as planportrett from '../prompts/planportrett.js'
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
  planportrett,
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

// Portretter — SSE-strømmet respons.
//
// Vi strømmer rå tekst-chunks som "progress"-events for å holde Railway-
// proxyens forbindelse aktiv (uten kontinuerlig output stopper proxyen
// etter ~60 sek og returnerer 502, selv om Claude jobber videre). Når
// Claude er ferdig, parser vi JSON, beriker med lov-sitater og sender
// det ferdige portrettet som ett "portrait"-event.
claudeRouter.post('/portrait', async (req, res) => {
  const { portraitType, payload } = req.body

  const promptModule = PORTRAIT_MODULES[portraitType]
  if (!promptModule) {
    return res.status(400).json({ error: `Ukjent portrettype: ${portraitType}` })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY mangler i Railway-variabler eller .env.' })
  }

  // K1 (lett) — input-validering FØR vi starter SSE/KI-kallet. Repoet og API-et
  // er offentlig: frontend-slideren stopper på 2000 m, men et direkte API-kall
  // kan ellers sette vilkårlig radius og mangedoble token-bruken per kall.
  // 400-svar må returneres her, før SSE-headerne settes nedenfor.
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Mangler eller ugyldig payload.' })
  }
  // Clamp influensradius til [100, 2000] m (UI bruker 200–2000, litt slingring
  // ned). Clamping framfor 400 garanterer kostnadstak uten å avvise legitime
  // kall. payload muteres slik at både prompt og usage-logg bruker trygg verdi.
  if (payload.zoneRadiusM != null) {
    const r = Number(payload.zoneRadiusM)
    if (!Number.isFinite(r)) {
      return res.status(400).json({ error: 'zoneRadiusM må være et tall.' })
    }
    const clamped = Math.min(2000, Math.max(100, Math.round(r)))
    if (clamped !== r) {
      console.warn(`zoneRadiusM ${r} utenfor [100, 2000] — clampet til ${clamped}`)
    }
    payload.zoneRadiusM = clamped
  }
  // Begrens artslistene som sendes til KI (reell maks er ~400). Hindrer at en
  // oppblåst payload presser prompt-/token-størrelsen i taket.
  for (const felt of ['topSpecies', 'observedSpecies', 'selectedSpecies']) {
    if (Array.isArray(payload[felt]) && payload[felt].length > 400) {
      console.warn(`${felt} hadde ${payload[felt].length} arter — kuttet til 400`)
      payload[felt] = payload[felt].slice(0, 400)
    }
  }

  // Sett SSE-headers og start strømming umiddelbart
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')  // Railway/nginx skal ikke buffre
  res.flushHeaders()

  function sendEvent(eventName, data) {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // M7 (DEAKTIVERT 2026-06-26 etter prod-feil): `req.on('close')` fyrer av
  // svært tidlig på Railway — sannsynligvis ved proxy-handshake, ikke ved
  // ekte klient-disconnect. Resultatet var at HVER portrett-generering
  // ble abortert i de første millisekundene og klienten satt igjen med
  // «Mangler portrait-respons fra serveren». Vi beholder
  // abortController-stubben slik at signaturen til streamWithRetry er
  // uendret, men fyrer den aldri av. Token-besparelser ved ekte
  // client-disconnect er en kvalitets-fiks — kommer tilbake til den etter
  // GBIF-innlevering med en mer presis trigger (f.eks. socket.destroyed).
  const abortController = new AbortController()
  let klientForlot = false
  let portraitFerdig = false

  try {
    const userMessage = promptModule.buildUserPrompt(payload)
    const lang = payload?.lang === 'en' ? 'en' : 'no'
    // Språk-instruksen plasseres FØRST i system-prompten — ellers drukner
    // den i den norske basis-prompten og KI fortsetter å skrive norsk.
    const systemPrompt = lang === 'en'
      ? `# CRITICAL — OUTPUT LANGUAGE: ENGLISH

The user has selected English as the interface language. EVERY single free-text field in the JSON response MUST be written in fluent, professional English suitable for case officers, architects and planners. This includes (but is not limited to):

- prosjektnavn, lokasjon, eiendomsKontekst, beskrivelse, tema, kortBegrunnelse, kategori, status, rad, begrunnelse, kommentarer
- All tiltak-tekster, forvaltningsråd-tekster, datakvalitets-vurderinger, andreKilder, trusler, lokalForekomst, handlingPaaEiendommen
- All symbioser-felter (partnerart-navn aside): forklaring, lokalRelevans, evidensgrunnlag
- All naturtyper-felter: navn, beskrivelse, avhengigeArter
- All hierarchical text (avlOgOppvekst, atferdsprofil, habitatkrav, etc.)
- rodlisteStatus.label (e.g. "Critically Endangered" / "Severely invasive – very high ecological risk")
- All array-elements that contain prose

THE FOLLOWING ARE THE ONLY EXCEPTIONS — everything else is English:

1. **JSON field NAMES (keys)** stay Norwegian — never translate the keys. Only translate VALUES.
2. **Verbatim quoted Norwegian legal text** (the \`sitat\` field under relevanteLover) — the server enricher inserts these verbatim from Lovdata; you do not need to handle them.
3. **Norwegian place names** (Tøyenparken, Akerselva, Vahls gate, Birkelunden, Oslo etc.) stay Norwegian — they are official toponyms.
4. **Scientific names** are always Latin.
5. **Species common names** — write the ENGLISH common name as PRIMARY, then the Norwegian name in parentheses. Example: \`"folkenavn": "Canada Goose (Kanadagås)"\`. Never write only the Norwegian name. If no established English common name exists, use the Latin name with a brief English descriptor.

Do NOT begin sentences with Norwegian phrasing translated word-for-word — write idiomatic English from scratch.

---

${promptModule.SYSTEM_PROMPT}

---

# REMINDER: LANGUAGE
Re-read the OUTPUT LANGUAGE rules above before finalizing the JSON. The default is English for every free-text field. Norwegian is only allowed for: JSON keys, verbatim legal quotes, place names, and Norwegian common names appended in parentheses after their English equivalents.`
      : promptModule.SYSTEM_PROMPT

    const result = await streamWithRetry(client, {
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }, (lengde) => sendEvent('progress', { lengde }), { signal: abortController.signal })

    const rawText = result.fullText
    const stopReason = result.finalMessage?.stop_reason
    const modelUsed = result.modelUsed
    const usage = result.finalMessage?.usage

    const jsonText = extractBalancedJson(rawText)

    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      try {
        parsed = JSON.parse(autoFixJson(jsonText))
      } catch (parseErr2) {
        console.warn('JSON parse-feil:', parseErr2.message, '| stop_reason:', stopReason)
        const truncated = stopReason === 'max_tokens'
        sendEvent('error', {
          error: truncated
            ? 'KI-svaret ble for langt og avkortet før det var ferdig. Prøv igjen — i de fleste tilfeller fungerer det andre forsøk.'
            : 'Kunne ikke tolke svaret fra Claude som strukturert data. Prøv igjen.',
          stopReason,
          rawText: rawText.slice(0, 2000),
        })
        res.end()
        return
      }
    }

    if (Array.isArray(parsed.relevanteLover)) {
      parsed.relevanteLoverEnriched = enrichRelevanteLover(parsed.relevanteLover)
    }

    logUsage({
      ip: klientIp(req),
      kontekst: `portrait:${portraitType}`,
      modell: modelUsed,
      usage,
      zoneRadiusM: typeof payload?.zoneRadiusM === 'number' ? payload.zoneRadiusM : null,
    })

    // Portrett er ferdig parsert. Marker dette FØR vi prøver å skrive til
    // responsen — så hvis req.on('close') fyrer av før sendEvent('portrait')
    // når frem, kommer vi ikke til å logge det som «klient forlot» og
    // svelge feilen.
    portraitFerdig = true
    sendEvent('portrait', { portrait: parsed, model: modelUsed, stopReason })
    sendEvent('done', { ok: true })
    res.end()
  } catch (err) {
    // M7 — klienten koblet fra: KI-streamen ble abortert med vilje. Ikke logg
    // som feil, ikke prøv å sende events på en lukket forbindelse.
    // VIKTIG: hvis portrettet er ferdig parsert, må vi forsøke å skrive det
    // ut likevel. Railway-proxyens close-event kan ellers svelge et ferdig
    // svar og gi klienten "Mangler portrait-respons fra serveren".
    if (!portraitFerdig && (klientForlot || abortController.signal.aborted || err.name === 'AbortError' || err.name === 'APIUserAbortError')) {
      console.warn('Klient koblet fra under portrett-generering — KI-stream avbrutt')
      try { res.end() } catch { /* allerede lukket */ }
      return
    }
    console.error('Claude portrait-feil:', err.message)
    let brukerMelding = err.message
    if (err.status === 401) {
      brukerMelding = 'API-nøkkelen er ugyldig.'
    } else if (err.status === 429) {
      brukerMelding = 'For mange forespørsler. Vent litt og prøv igjen.'
    } else if (err.status >= 500) {
      brukerMelding = 'Midlertidig feil hos KI-leverandøren. Prøv igjen om litt.'
    }
    try {
      sendEvent('error', { error: brukerMelding })
    } catch { /* connection kan være lukket */ }
    res.end()
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
/**
 * SSE-variant av createWithRetry. Strømmer tekst-chunks via Anthropic
 * SDK sin `messages.stream()`, samler full tekst, og kaller onProgress
 * hver gang vi mottar nye chunks slik at serveren kan signalisere til
 * klient (og Railway-proxy) at forbindelsen er aktiv.
 *
 * Returnerer { fullText, finalMessage, modelUsed }. Følger samme
 * fallback-/retry-logikk som createWithRetry — 404 → bytt modell uten
 * venting, transient 5xx/429 → backoff.
 */
async function streamWithRetry(client, params, onProgress, { maxRetries = 2, signal } = {}) {
  let lastErr
  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const stream = client.messages.stream({ ...params, model }, { signal })
        let fullText = ''
        let lastFlush = Date.now()
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text
            // Heartbeat ~hver 500ms for å holde Railway-proxy våken uten å
            // oversvømme klienten med events.
            const naa = Date.now()
            if (naa - lastFlush > 500) {
              try { onProgress(fullText.length) } catch { /* noop */ }
              lastFlush = naa
            }
          }
        }
        const finalMessage = await stream.finalMessage()
        if (model !== MODEL_CHAIN[0]) {
          console.warn(`KI-fallback: brukte ${model} i stedet for ${MODEL_CHAIN[0]} (sannsynligvis deprecated/retired)`)
        }
        return { fullText, finalMessage, modelUsed: model }
      } catch (err) {
        lastErr = err
        // Klienten koblet fra: ikke gjenforsøk og ikke fallback — bare kast
        // videre slik at rute-handleren kan avslutte stille.
        if (signal?.aborted || err.name === 'AbortError' || err.name === 'APIUserAbortError') {
          throw err
        }
        if (isModelNotFoundError(err)) {
          console.warn(`Modell ${model} ikke funnet (deprecated/retired) — prøver neste i kjeden`)
          break
        }
        const transient = err.status >= 500 || err.status === 429
        if (transient && attempt < maxRetries) {
          const waitMs = 1500 * (attempt + 1)
          console.warn(`Forbigående KI-feil (status ${err.status}) på ${model} (stream) — gjenforsøk ${attempt + 1}/${maxRetries} om ${waitMs} ms`)
          await new Promise(r => setTimeout(r, waitMs))
          continue
        }
        throw err
      }
    }
  }
  throw lastErr
}

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
