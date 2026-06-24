/**
 * Formatér build-datoen til menneskelig lesbar tekst på valgt språk.
 * Build-tiden injiserer en ISO-streng (YYYY-MM-DD) som global konstant
 * via Vite (se vite.config.js). Tidligere var formatet hardkodet til
 * norsk allerede ved build — engelske UI viste norsk dato.
 *
 * Eksempler:
 *   formatBuildDate('2026-06-24', 'no') → '24. juni 2026'
 *   formatBuildDate('2026-06-24', 'en') → '24 June 2026'
 */
export function formatBuildDate(isoDato, sprak = 'no') {
  if (typeof isoDato !== 'string' || !isoDato) return ''
  // Parse YYYY-MM-DD eksplisitt så vi unngår tidssone-skiftet ved
  // direkte new Date(isoDato) (som tolker som UTC midnatt).
  const [aar, maaned, dag] = isoDato.split('-').map(s => parseInt(s, 10))
  if (!aar || !maaned || !dag) return isoDato

  const dato = new Date(aar, maaned - 1, dag)
  const locale = sprak === 'en' ? 'en-GB' : 'nb-NO'
  return dato.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
