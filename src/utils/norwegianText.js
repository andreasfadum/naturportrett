/**
 * Normaliserer norsk tekst for adressesøk.
 * Kartverket støtter fuzzy=true, men dette forbedrer treff ytterligere.
 */
export function normalizeNorwegian(input) {
  return input
    .replace(/ae/gi, 'æ')
    .replace(/oe/gi, 'ø')
    .replace(/aa/gi, 'å')
}

/**
 * Formatterer en adresse fra Kartverket-responsen til visningsformat.
 */
export function formatAddress(hit) {
  const parts = []
  if (hit.adressenavn) parts.push(hit.adressenavn)
  if (hit.nummer) {
    let num = String(hit.nummer)
    if (hit.bokstav) num += hit.bokstav
    parts.push(num)
  }
  return parts.join(' ')
}

export function formatFullAddress(hit) {
  const street = formatAddress(hit)
  const postal = hit.postnummer ? `${hit.postnummer} ${hit.poststed || ''}`.trim() : ''
  return postal ? `${street}, ${postal}` : street
}
