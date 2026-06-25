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
    limit: '200',
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

  // GBIF eventDate kan være ISO eller bare år/måned/dag
  let lastObservedDate = null
  if (occ.eventDate) {
    lastObservedDate = occ.eventDate.slice(0, 10)
  } else if (occ.year) {
    const mm = String(occ.month || 1).padStart(2, '0')
    const dd = String(occ.day || 1).padStart(2, '0')
    lastObservedDate = `${occ.year}-${mm}-${dd}`
  }

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
    // Hver GBIF-occurrence = én observasjon
    observationCount: 1,
    lastObservedDate,
    // GBIF har ikke samme kvalitetsgradering som iNaturalist, men hasCoordinate=true
    // og kjent taxonKey er en grei indikasjon på at observasjonen er identifisert
    // og koordinatfestet.
    qualityGrade: occ.taxonKey ? 'identified' : 'unverified',
    coordinateUncertaintyM: typeof occ.coordinateUncertaintyInMeters === 'number'
      ? occ.coordinateUncertaintyInMeters
      : null,
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
