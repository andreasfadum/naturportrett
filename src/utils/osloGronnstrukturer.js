/**
 * Kjente grønnstrukturer, parker og naturområder i Oslo.
 *
 * Brukes til å gi KI en konkret sjekkliste av nærliggende verdiområder når
 * den genererer eiendomsKontekst-feltet i naturportrettet. Uten dette har KI
 * en tendens til å nevne kun de mest ikoniske (Akerselva, Birkelunden) og
 * hoppe over andre relevante steder (Tøyenparken, Botanisk hage osv.).
 *
 * Koordinatene er omtrentlige sentrumspunkter — Haversine-avstanden beregnes
 * mot adresse-koordinaten for å filtrere innenfor angitt radius.
 *
 * Listen er kuratert manuelt; legg gjerne til flere når brukere rapporterer
 * at lokale verdiområder mangler.
 */

export const OSLO_GRONNSTRUKTURER = [
  // Sentrum / vest
  { navn: 'Slottsparken', type: 'park', lat: 59.9170, lon: 10.7300 },
  { navn: 'Frognerparken (Vigelandsparken)', type: 'park', lat: 59.9272, lon: 10.7008 },
  { navn: 'St. Hanshaugen', type: 'park', lat: 59.9258, lon: 10.7383 },
  { navn: 'Vår Frelsers gravlund', type: 'gravlund/park', lat: 59.9221, lon: 10.7474 },
  { navn: 'Akershus festning og grøntområder', type: 'park/festningsanlegg', lat: 59.9081, lon: 10.7367 },

  // Grünerløkka / Tøyen / nord
  { navn: 'Birkelunden', type: 'park', lat: 59.9265, lon: 10.7595 },
  { navn: 'Sofienbergparken', type: 'park', lat: 59.9249, lon: 10.7621 },
  { navn: 'Olaf Ryes plass', type: 'park', lat: 59.9221, lon: 10.7569 },
  { navn: 'Tøyenparken', type: 'park', lat: 59.9210, lon: 10.7732 },
  { navn: 'Botanisk hage (UiO Naturhistorisk museum)', type: 'park/botanisk hage', lat: 59.9183, lon: 10.7716 },
  { navn: 'Kuba (langs Akerselva)', type: 'park/elvepark', lat: 59.9223, lon: 10.7551 },

  // Akerselva — flere punkter langs elva (gir KI presis avstand uansett hvor på elva eiendommen er)
  { navn: 'Akerselva ved Nydalen', type: 'elv/økologisk korridor', lat: 59.9494, lon: 10.7654 },
  { navn: 'Akerselva ved Sagene', type: 'elv/økologisk korridor', lat: 59.9359, lon: 10.7613 },
  { navn: 'Akerselva ved Grünerløkka', type: 'elv/økologisk korridor', lat: 59.9230, lon: 10.7551 },
  { navn: 'Akerselva ved Bjørvika (utløp)', type: 'elv/økologisk korridor', lat: 59.9080, lon: 10.7560 },

  // Øst / sør-øst
  { navn: 'Kampen park', type: 'park', lat: 59.9132, lon: 10.7785 },
  { navn: 'Klosterenga skulpturpark', type: 'park', lat: 59.9088, lon: 10.7691 },
  { navn: 'Ekebergskråningen', type: 'naturreservat/turdrag', lat: 59.8961, lon: 10.7740 },
  { navn: 'Hovinbekken (gjenåpnet)', type: 'bekk/økologisk korridor', lat: 59.9230, lon: 10.8000 },
  { navn: 'Østensjøvannet naturreservat', type: 'våtmark/naturreservat', lat: 59.8896, lon: 10.8334 },
  { navn: 'Bygdøy (Folkemuseet/Dronningberget)', type: 'natur/park', lat: 59.9083, lon: 10.6839 },

  // Øyer i Oslofjorden
  { navn: 'Hovedøya', type: 'øy/naturreservat', lat: 59.8943, lon: 10.7320 },
  { navn: 'Lindøya', type: 'øy', lat: 59.8856, lon: 10.7218 },

  // Marka / ytterkant
  { navn: 'Sognsvann og marka-grensa', type: 'sjø/markaområde', lat: 59.9758, lon: 10.7320 },
  { navn: 'Maridalsvannet sør', type: 'sjø/drikkevannskilde', lat: 59.9750, lon: 10.7800 },

  // Nordstrand / sør
  { navn: 'Frognerseteren og Holmenkollåsen', type: 'markaområde', lat: 59.9750, lon: 10.6750 },
  { navn: 'Ljansbruket og Hvervenbukta', type: 'strandpark', lat: 59.8556, lon: 10.7872 },

  // Søndre Aker / Skøyen / Bygdøy
  { navn: 'Frognerkilen', type: 'fjord/strand', lat: 59.9133, lon: 10.6939 },
  { navn: 'Skøyen-parken', type: 'park', lat: 59.9211, lon: 10.6856 },

  // Groruddalen
  { navn: 'Alna elvepark', type: 'elv/økologisk korridor', lat: 59.9275, lon: 10.8525 },
]

const JORDENS_RADIUS_M = 6371000

/**
 * Haversine — kortere bue-avstand i meter mellom to lat/lon-par.
 */
function avstandMeter(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return JORDENS_RADIUS_M * c
}

/**
 * Grov bounding-boks for Oslo kommune. Brukes som filter for å avgjøre
 * om grønnstruktur-listen er meningsfull for en gitt adresse — listen
 * er Oslo-spesifikk og skal IKKE eksponeres for adresser utenfor byen
 * (det ville gitt KI feil sjekkliste å lene seg på).
 */
const OSLO_BBOX = {
  latMin: 59.79,
  latMax: 60.13,
  lonMin: 10.49,
  lonMax: 10.95,
}

export function erIOslo(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false
  return lat >= OSLO_BBOX.latMin && lat <= OSLO_BBOX.latMax
      && lon >= OSLO_BBOX.lonMin && lon <= OSLO_BBOX.lonMax
}

/**
 * Returnerer en liste over grønnstrukturer innenfor `radiusM` fra (lat, lon),
 * sortert etter avstand stigende. Hver oppføring får et `avstandM`-felt.
 * Returnerer tom liste hvis adressen ligger utenfor Oslo — vi har ikke
 * kuraterte data for andre kommuner.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusM
 * @returns {Array<{navn:string,type:string,lat:number,lon:number,avstandM:number}>}
 */
export function finnNarliggende(lat, lon, radiusM = 1500) {
  if (!erIOslo(lat, lon)) return []
  const truffet = []
  for (const sted of OSLO_GRONNSTRUKTURER) {
    const avstand = avstandMeter(lat, lon, sted.lat, sted.lon)
    if (avstand <= radiusM) {
      truffet.push({ ...sted, avstandM: Math.round(avstand) })
    }
  }
  truffet.sort((a, b) => a.avstandM - b.avstandM)
  return truffet
}
