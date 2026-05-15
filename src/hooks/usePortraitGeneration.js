import { useState, useCallback } from 'react'

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portraitType, payload }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setPortrait(data.portrait)
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
