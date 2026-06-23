import { normalizeNorwegian } from '../utils/norwegianText.js'

const BASE_URL = 'https://ws.geonorge.no/adresser/v1'
const OSLO_KOMMUNE = '0301'

/**
 * Søker etter adresser via Kartverket API. Default: filtrert til Oslo
 * (kommunenummer 0301). Hvis `heleNorge=true` fjernes Oslo-filteret og
 * søket dekker hele Norge. Oslo-fokus er det vanlige bruksmønsteret for
 * PBE; «hele Norge»-flagget er en bryter brukeren slår på når trengt.
 *
 * @param {string} query  Adressetekst (kan inneholde skrivefeil)
 * @param {object} [opts]
 * @param {boolean} [opts.heleNorge=false] true = søk i hele Norge, false = bare Oslo
 * @returns {Promise<Array>} Liste med adressetreff
 */
export async function searchAddresses(query, opts = {}) {
  if (!query || query.trim().length < 2) return []

  const normalized = normalizeNorwegian(query.trim())

  const params = new URLSearchParams({
    sok: normalized,
    fuzzy: 'true',
    treffPerSide: '8',
    side: '0',
  })

  if (!opts.heleNorge) {
    params.set('kommunenummer', OSLO_KOMMUNE)
  }

  const response = await fetch(`${BASE_URL}/sok?${params}`)
  if (!response.ok) {
    throw new Error(`Kartverket-feil: ${response.status}`)
  }

  const data = await response.json()
  return data.adresser || []
}
