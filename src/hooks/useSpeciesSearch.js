import { useState, useEffect } from 'react'
import { fetchAllSpecies } from '../services/speciesAggregator.js'

export function useSpeciesSearch(address, radiusM = 500) {
  const [species, setSpecies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address?.representasjonspunkt) return

    const { lat, lon } = address.representasjonspunkt
    const radiusKm = Math.max(0.1, radiusM / 1000)

    setIsLoading(true)
    setError(null)
    setSpecies([])

    fetchAllSpecies(lat, lon, radiusKm)
      .then(results => setSpecies(results))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [address, radiusM])

  return { species, isLoading, error }
}
