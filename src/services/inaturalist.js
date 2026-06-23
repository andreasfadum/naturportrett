const BASE_URL = 'https://api.inaturalist.org/v1'

/**
 * Henter artsregistreringer nær et koordinat fra iNaturalist.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusKm  Søkeradius i km
 * @returns {Promise<Array>}
 */
export async function fetchSpeciesFromINaturalist(lat, lon, radiusKm = 0.5) {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lon.toFixed(6),
    radius: radiusKm.toString(),
    per_page: '100',
    locale: 'nb',
    quality_grade: 'research',
    order: 'desc',
    order_by: 'votes',
    photos: 'true',
  })

  const response = await fetch(`${BASE_URL}/observations?${params}`)
  if (!response.ok) {
    throw new Error(`iNaturalist-feil: ${response.status}`)
  }

  const data = await response.json()
  return (data.results || []).map(obs => mapINaturalistObservation(obs))
}

function mapINaturalistObservation(obs) {
  const taxon = obs.taxon || {}
  const photo = taxon.default_photo || (obs.photos && obs.photos[0])

  return {
    source: 'inaturalist',
    id: `inat-${obs.id}`,
    scientificName: (taxon.name || '').toLowerCase(),
    norwegianName: taxon.preferred_common_name || taxon.name || 'Ukjent art',
    scientificNameDisplay: taxon.name || '',
    iconicTaxonName: taxon.iconic_taxon_name || '',
    kingdom: taxon.kingdom || '',
    photoUrl: photo ? photo.medium_url || photo.url : null,
    photoSquareUrl: photo ? photo.square_url || photo.url : null,
    // Hver iNaturalist-rad = én observasjon; aggregator teller opp pr art
    observationCount: 1,
    // Siste-observert-dato — brukes som recency-signal i prioritet-sortering
    lastObservedDate: obs.observed_on || (obs.created_at ? obs.created_at.slice(0, 10) : null),
    // iNaturalist research-grade = peer-verifisert ID. Vi filtrerer på research-grade
    // allerede i query, så alle treff her er research-grade.
    qualityGrade: obs.quality_grade || 'research',
    taxonId: taxon.id,
  }
}
