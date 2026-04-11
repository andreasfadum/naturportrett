import { useState, useCallback } from 'react'

export function useRecommendations() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDone, setIsDone] = useState(false)

  const generate = useCallback(async (address, selectedSpecies) => {
    setText('')
    setError(null)
    setIsDone(false)
    setIsLoading(true)

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          zoneRadiusM: 500,
          selectedSpecies,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Serverfeil')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') {
            setIsDone(true)
            continue
          }
          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) {
              setError(parsed.error)
            } else if (parsed.text) {
              setText(prev => prev + parsed.text)
            }
          } catch {
            // ignorer parse-feil på enkeltlinjer
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { text, isLoading, error, isDone, generate }
}
