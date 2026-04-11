import { useState, useEffect } from 'react'
import { fetchAllSpecies } from '../services/speciesAggregator.js'

export function useSpeciesSearch(address) {
  const [species, setSpecies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address?.representasjonspunkt) return

    const { lat, lon } = address.representasjonspunkt

    setIsLoading(true)
    setError(null)
    setSpecies([])

    fetchAllSpecies(lat, lon, 0.5)
      .then(results => setSpecies(results))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [address])

  return { species, isLoading, error }
}
