import { fetchSpeciesFromINaturalist } from './inaturalist.js'
import { fetchSpeciesFromGBIF } from './gbif.js'
import { getCategory } from '../utils/speciesCategories.js'
import { getConservationStatus } from '../utils/conservationStatus.js'

const MAX_SPECIES = 60

/**
 * Henter og slår sammen artsdata fra alle aktiverte kilder.
 * Returnerer deduplisert, prioritert liste sortert etter datakvalitet +
 * recency. Topp 25 brukes til Claude-portrettet; resten er tilgjengelig
 * for telling i UI-oppsummeringen.
 */
export async function fetchAllSpecies(lat, lon, radiusKm = 0.5) {
  const [inatResult, gbifResult] = await Promise.allSettled([
    fetchSpeciesFromINaturalist(lat, lon, radiusKm),
    fetchSpeciesFromGBIF(lat, lon, radiusKm),
  ])

  const inatObs = inatResult.status === 'fulfilled' ? inatResult.value : []
  const gbifObs = gbifResult.status === 'fulfilled' ? gbifResult.value : []

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
      byScientificName.set(key, { ...obs })
    } else {
      const existing = byScientificName.get(key)
      byScientificName.set(key, mergeObservations(existing, obs))
    }
  }

  return Array.from(byScientificName.values())
    .map(obs => ({
      ...obs,
      category: getCategory(obs.iconicTaxonName, obs.kingdom),
      conservationStatus: getConservationStatus(obs.scientificName),
      priorityScore: beregnPriorityScore(obs),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
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
    // Antall observasjoner = sum av observasjoner pr art
    observationCount: (primary.observationCount || 0) + (secondary.observationCount || 0),
    // Foretrekk iNaturalist iconicTaxon
    iconicTaxonName: primary.iconicTaxonName || secondary.iconicTaxonName,
    kingdom: primary.kingdom || secondary.kingdom,
    // Siste observerte dato = MAX
    lastObservedDate: nyeste(primary.lastObservedDate, secondary.lastObservedDate),
    // Beste kvalitet vinner: research > identified > unverified
    qualityGrade: besteKvalitet(primary.qualityGrade, secondary.qualityGrade),
    // Bedre presisjon vinner (lavere coordinate uncertainty)
    coordinateUncertaintyM: minstUsikkerhet(primary.coordinateUncertaintyM, secondary.coordinateUncertaintyM),
  }
}

function nyeste(a, b) {
  if (!a) return b
  if (!b) return a
  return a >= b ? a : b
}

function besteKvalitet(a, b) {
  const rangering = { research: 3, identified: 2, unverified: 1 }
  const ra = rangering[a] || 0
  const rb = rangering[b] || 0
  return ra >= rb ? a : b
}

function minstUsikkerhet(a, b) {
  if (a == null) return b
  if (b == null) return a
  return Math.min(a, b)
}

/**
 * Prioritetscore for sortering. Kombinerer:
 *
 * - Recency (50 %): eksponentiell decay over ca. 3 år. En obs fra i fjor får
 *   ~0.72, fra 3 år siden ~0.37, fra 10 år siden ~0.04. Forrige uke ~1.0.
 * - Antall observasjoner (30 %): log-skalert. Forskjellen mellom 1 og 5
 *   teller mer enn mellom 50 og 200 — en eneste obs er mistenkelig, men 5+
 *   gir tydelig signal. Topp ut ved 50.
 * - Kvalitet (20 %): research-grade (peer-verifisert iNaturalist) > GBIF med
 *   taxonKey > uverifisert. Coordinate uncertainty < 100 m gir bonus.
 *
 * Resultat 0–1. Brukes til å sortere arter slik at de mest sannsynlige
 * "faktisk her, faktisk nå" havner øverst i listen Claude får se.
 */
function beregnPriorityScore(species) {
  // Recency
  let recencyScore = 0.2  // arter uten dato får et lite minimum
  if (species.lastObservedDate) {
    const dato = new Date(species.lastObservedDate)
    if (!isNaN(dato.getTime())) {
      const aarSiden = (Date.now() - dato.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      recencyScore = Math.exp(-aarSiden / 3)
    }
  }

  // Antall observasjoner — log-skalert opp til 50
  const count = species.observationCount || 0
  const countScore = Math.min(1, Math.log(count + 1) / Math.log(51))

  // Kvalitet
  let qualityScore = 0.4
  if (species.qualityGrade === 'research') qualityScore = 1.0
  else if (species.qualityGrade === 'identified') qualityScore = 0.7
  // Bonus for presise koordinater
  if (typeof species.coordinateUncertaintyM === 'number' && species.coordinateUncertaintyM < 100) {
    qualityScore = Math.min(1, qualityScore + 0.1)
  }

  return 0.5 * recencyScore + 0.3 * countScore + 0.2 * qualityScore
}

function cleanScientificName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ [a-z]\. /, ' ')
    .split(' ')
    .slice(0, 2)
    .join(' ')
    .trim()
}
