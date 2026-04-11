const BASE_URL = 'https://api.gbif.org/v1'

/**
 * Henter artsregistreringer nær et koordinat fra GBIF.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusKm  Søkeradius i km (GBIF bruker meter)
 * @returns {Promise<Array>}
 */
export async function fetchSpeciesFromGBIF(lat, lon, radiusKm = 0.5) {
  const params = new URLSearchParams({
    decimalLatitude: `${lat - 0.005},${lat + 0.005}`,
    decimalLongitude: `${lon - 0.007},${lon + 0.007}`,
    country: 'NO',
    hasCoordinate: 'true',
    mediaType: 'StillImage',
    limit: '100',
    offset: '0',
  })

  const response = await fetch(`${BASE_URL}/occurrence/search?${params}`)
  if (!response.ok) {
    throw new Error(`GBIF-feil: ${response.status}`)
  }

  const data = await response.json()
  return (data.results || []).map(occ => mapGBIFOccurrence(occ))
}

function mapGBIFOccurrence(occ) {
  const media = (occ.media || []).find(m => m.type === 'StillImage')

  return {
    source: 'gbif',
    id: `gbif-${occ.key}`,
    scientificName: (occ.scientificName || '').replace(/ [A-Z][a-z]+,? \d{4}$/, '').toLowerCase().trim(),
    norwegianName: occ.vernacularName || occ.species || occ.genus || 'Ukjent art',
    scientificNameDisplay: occ.species || occ.scientificName || '',
    iconicTaxonName: gbifClassToIconic(occ.class),
    kingdom: occ.kingdom || '',
    photoUrl: media ? media.identifier : null,
    photoSquareUrl: media ? media.identifier : null,
    observationCount: 0,
    taxonKey: occ.taxonKey,
  }
}

function gbifClassToIconic(gbifClass) {
  const map = {
    Aves: 'Aves',
    Mammalia: 'Mammalia',
    Insecta: 'Insecta',
    Arachnida: 'Arachnida',
    Reptilia: 'Reptilia',
    Amphibia: 'Amphibia',
    Actinopterygii: 'Actinopterygii',
    Liliopsida: 'Plantae',
    Magnoliopsida: 'Plantae',
    Pinopsida: 'Plantae',
    Agaricomycetes: 'Fungi',
  }
  return map[gbifClass] || ''
}
