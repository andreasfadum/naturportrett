import { useState, useEffect } from 'react'
import { fetchAllSpecies } from '../services/speciesAggregator.js'
import { lagSpeciesNokkel, getSpeciesCache, setSpeciesCache } from '../utils/speciesCache.js'

/**
 * Henter artsregistreringer for en adresse + radius. Cacher resultatet
 * i localStorage med 24-timers TTL slik at gjentatte søk på samme
 * adresse innen samme arbeidsøkt gir DETERMINISTISK samme liste —
 * unngår overraskende variasjon når GBIF/iNaturalist får nye
 * observasjoner eller sorterer ulikt mellom kall.
 */
export function useSpeciesSearch(address, radiusM = 500) {
  const [species, setSpecies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address?.representasjonspunkt) return

    const { lat, lon } = address.representasjonspunkt
    const radiusKm = Math.max(0.1, radiusM / 1000)

    // Cache-hit: instant retur uten loading-state, ingen API-kall.
    const cacheKey = lagSpeciesNokkel(lat, lon, radiusM)
    const cached = getSpeciesCache(cacheKey)
    if (cached) {
      setSpecies(cached)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setSpecies([])

    let kansellert = false
    fetchAllSpecies(lat, lon, radiusKm)
      .then(results => {
        if (kansellert) return
        setSpecies(results)
        setSpeciesCache(cacheKey, results)
      })
      .catch(err => {
        if (!kansellert) setError(err.message)
      })
      .finally(() => {
        if (!kansellert) setIsLoading(false)
      })

    return () => { kansellert = true }
  }, [address, radiusM])

  return { species, isLoading, error }
}
