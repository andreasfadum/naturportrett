import { fetchSpeciesFromINaturalist } from './inaturalist.js'
import { fetchSpeciesFromGBIF } from './gbif.js'
import { getCategory } from '../utils/speciesCategories.js'

const MAX_SPECIES = 60

/**
 * Henter og slår sammen artsdata fra alle aktiverte kilder.
 * Returnerer deduplisert, sortert liste.
 */
export async function fetchAllSpecies(lat, lon, radiusKm = 0.5) {
  const [inatResult, gbifResult] = await Promise.allSettled([
    fetchSpeciesFromINaturalist(lat, lon, radiusKm),
    fetchSpeciesFromGBIF(lat, lon, radiusKm),
  ])

  const inatObs = inatResult.status === 'fulfilled' ? inatResult.value : []
  const gbifObs = gbifResult.status === 'fulfilled' ? gbifResult.value : []

  // Feilmelding hvis begge feiler
  if (inatResult.status === 'rejected' && gbifResult.status === 'rejected') {
    throw new Error('Kunne ikke hente artsdata. Sjekk internettforbindelsen.')
  }

  return aggregate([...inatObs, ...gbifObs])
}

function aggregate(observations) {
  const byScientificName = new Map()

  for (const obs of observations) {
    const key = cleanScientificName(obs.scientificName)
    if (!key || key.length < 3) continue

    if (!byScientificName.has(key)) {
      byScientificName.set(key, obs)
    } else {
      const existing = byScientificName.get(key)
      // Berik eksisterende med data fra ny kilde
      const merged = mergeObservations(existing, obs)
      byScientificName.set(key, merged)
    }
  }

  return Array.from(byScientificName.values())
    .map(obs => ({
      ...obs,
      category: getCategory(obs.iconicTaxonName, obs.kingdom),
    }))
    .sort((a, b) => b.observationCount - a.observationCount)
    .slice(0, MAX_SPECIES)
}

function mergeObservations(primary, secondary) {
  return {
    ...primary,
    // Foretrekk iNaturalist-foto (har riktig kvadratformat)
    photoSquareUrl: primary.source === 'inaturalist'
      ? primary.photoSquareUrl || secondary.photoSquareUrl
      : secondary.source === 'inaturalist'
      ? secondary.photoSquareUrl || primary.photoSquareUrl
      : primary.photoSquareUrl || secondary.photoSquareUrl,
    // Foretrekk norsk navn fra iNaturalist
    norwegianName: (primary.source === 'inaturalist' && primary.norwegianName !== 'Ukjent art')
      ? primary.norwegianName
      : secondary.norwegianName || primary.norwegianName,
    // Summer observasjonstall
    observationCount: primary.observationCount + secondary.observationCount,
    // Foretrekk iNaturalist iconicTaxon
    iconicTaxonName: primary.iconicTaxonName || secondary.iconicTaxonName,
    kingdom: primary.kingdom || secondary.kingdom,
  }
}

function cleanScientificName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ [a-z]\. /, ' ')  // fjern f.eks. "L." i midten
    .split(' ')
    .slice(0, 2)  // kun slekt + art
    .join(' ')
    .trim()
}
