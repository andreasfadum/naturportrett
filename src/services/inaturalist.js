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
    observationCount: obs.quality_grade === 'research' ? (obs.faves_count || 0) + 1 : 0,
    taxonId: taxon.id,
  }
}
