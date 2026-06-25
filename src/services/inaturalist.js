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
    per_page: '200',
    locale: 'nb',
    quality_grade: 'research',
    // Sorter på `id` desc i stedet for `votes` desc. votes er dynamisk
    // og endrer seg når noen voter på iNaturalist — fører til at samme
    // adresse kan returnere ulike arter mellom søk (en art akkurat
    // over/under per_page-grensen flyttes ut når votes endres). `id`
    // desc er monotont voksende → stabilt over tid, gir nyeste
    // observasjoner først.
    order: 'desc',
    order_by: 'id',
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
  const baseUrl = photo ? (photo.medium_url || photo.url) : null

  return {
    source: 'inaturalist',
    id: `inat-${obs.id}`,
    scientificName: (taxon.name || '').toLowerCase(),
    norwegianName: taxon.preferred_common_name || taxon.name || 'Ukjent art',
    scientificNameDisplay: taxon.name || '',
    iconicTaxonName: taxon.iconic_taxon_name || '',
    kingdom: taxon.kingdom || '',
    // Beholder eksisterende felt for bakoverkompatibilitet
    photoUrl: baseUrl,
    photoSquareUrl: photo ? (photo.square_url || baseUrl) : null,
    // Nye felter — hentes direkte hvis tilgjengelig, eller utledes ved å bytte
    // ut "medium" i URL-en (iNaturalist-konvensjon: alle størrelser bor på samme
    // base-URL kun med ulik størrelsessuffiks).
    photoMediumUrl: photo
      ? (photo.medium_url || (baseUrl ? baseUrl.replace(/(square|small|large|original)\.(jpe?g|png)/i, 'medium.$2') : null))
      : null,
    photoLargeUrl: photo
      ? (photo.large_url || (baseUrl ? baseUrl.replace(/(square|small|medium|original)\.(jpe?g|png)/i, 'large.$2') : null))
      : null,
    photoOriginalUrl: photo
      ? (photo.original_url || (baseUrl ? baseUrl.replace(/(square|small|medium|large)\.(jpe?g|png)/i, 'original.$2') : null))
      : null,
    // Hver iNaturalist-rad = én observasjon; aggregator teller opp pr art
    observationCount: 1,
    lastObservedDate: obs.observed_on || (obs.created_at ? obs.created_at.slice(0, 10) : null),
    qualityGrade: obs.quality_grade || 'research',
    taxonId: taxon.id,
  }
}
