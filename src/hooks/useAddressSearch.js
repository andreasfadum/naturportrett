import { useState, useEffect, useRef } from 'react'
import { searchAddresses } from '../services/kartverket.js'
import Fuse from 'fuse.js'

const DEBOUNCE_MS = 300
const MIN_CHARS = 2

export function useAddressSearch({ heleNorge = false } = {}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (query.length < MIN_CHARS) {
      setResults([])
      setError(null)
      return
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const hits = await searchAddresses(query, { heleNorge })

        // Fuse.js re-rangering for bedre relevans
        if (hits.length > 1) {
          const fuse = new Fuse(hits, {
            keys: ['adressetekst', 'adressenavn'],
            threshold: 0.5,
            distance: 100,
          })
          const fuseResults = fuse.search(query)
          // Hvis fuse finner treff, bruk re-rangert liste; ellers original
          setResults(fuseResults.length > 0 ? fuseResults.map(r => r.item) : hits)
        } else {
          setResults(hits)
        }
      } catch (err) {
        setError('Kunne ikke hente adresseforslag. Prøv igjen.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
  }, [query, heleNorge])

  return { query, setQuery, results, isLoading, error }
}
