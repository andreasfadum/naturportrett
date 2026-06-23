import { useState, useCallback } from 'react'

/**
 * Genererer portretter via SSE-strømmet endepunkt. Server sender chunks
 * underveis (for å holde Railway-proxyen levende ved kall som tar over
 * 60 sek), og et endelig 'portrait'-event med det parsete portrett-
 * objektet. Vi viser ikke chunks i UI — bare brukes som heartbeat.
 *
 * Events fra server:
 *   event: progress  → { lengde }          (lengden av rå tekst så langt)
 *   event: portrait  → { portrait, model } (siste, ferdig parsete data)
 *   event: error     → { error, ... }      (feilmelding)
 *   event: done      → { ok: true }        (server lukker streamen)
 */
export function usePortraitGeneration() {
  const [portrait, setPortrait] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = useCallback(async (portraitType, payload) => {
    setIsLoading(true)
    setError(null)
    setPortrait(null)
    try {
      const res = await fetch('/api/claude/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ portraitType, payload }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      if (!res.body) {
        throw new Error('Server støtter ikke streaming.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let portraitData = null
      let serverError = null

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE-frames er separert med blank linje (\n\n)
        let sep
        while ((sep = buffer.indexOf('\n\n')) >= 0) {
          const frame = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          if (!frame.trim()) continue

          let eventName = 'message'
          let dataLinjer = []
          for (const linje of frame.split('\n')) {
            if (linje.startsWith('event: ')) eventName = linje.slice(7).trim()
            else if (linje.startsWith('data: ')) dataLinjer.push(linje.slice(6))
          }
          const dataStr = dataLinjer.join('\n')
          let data = null
          try { data = JSON.parse(dataStr) } catch { /* tom eller ikke-JSON event */ }

          if (eventName === 'portrait' && data?.portrait) {
            portraitData = data
          } else if (eventName === 'error' && data?.error) {
            serverError = data.error
          }
          // 'progress' og 'done' ignoreres — heartbeat-events
        }
      }

      if (serverError) throw new Error(serverError)
      if (!portraitData) throw new Error('Mangler portrait-respons fra serveren.')
      setPortrait(portraitData.portrait)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setPortrait(null)
    setError(null)
  }, [])

  return { portrait, isLoading, error, generate, reset }
}
