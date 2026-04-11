import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt } from '../prompts/biodiversity.js'

export const claudeRouter = Router()

claudeRouter.post('/', async (req, res) => {
  const { address, zoneRadiusM = 500, selectedSpecies } = req.body

  if (!selectedSpecies || selectedSpecies.length === 0) {
    return res.status(400).json({ error: 'Ingen arter valgt' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY mangler. Sjekk at .env-filen er lagret og restart serveren med npm run dev:all.' })
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const userMessage = buildUserPrompt(address, zoneRadiusM, selectedSpecies)

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
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
      userMessage = 'API-nøkkelen er ugyldig. Gå til console.anthropic.com, generer en ny nøkkel, og oppdater .env-filen. Start deretter serveren på nytt med npm run dev:all.'
    } else if (err.status === 429) {
      userMessage = 'For mange forespørsler. Vent litt og prøv igjen.'
    }
    res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`)
    res.end()
  }
})
