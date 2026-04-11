import { normalizeNorwegian } from '../utils/norwegianText.js'

const BASE_URL = 'https://ws.geonorge.no/adresser/v1'
const OSLO_KOMMUNE = '0301'

/**
 * Søker etter adresser i Oslo via Kartverket API.
 * @param {string} query  Adressetekst (kan inneholde skrivefeil)
 * @returns {Promise<Array>} Liste med adressetreff
 */
export async function searchAddresses(query) {
  if (!query || query.trim().length < 2) return []

  const normalized = normalizeNorwegian(query.trim())

  const params = new URLSearchParams({
    sok: normalized,
    kommunenummer: OSLO_KOMMUNE,
    fuzzy: 'true',
    treffPerSide: '8',
    side: '0',
  })

  const response = await fetch(`${BASE_URL}/sok?${params}`)
  if (!response.ok) {
    throw new Error(`Kartverket-feil: ${response.status}`)
  }

  const data = await response.json()
  return data.adresser || []
}
