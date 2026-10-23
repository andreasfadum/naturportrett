/**
 * KI-budsjettet er brukt opp — gjenkjenning av Anthropic-feilene som betyr at
 * forbrukstaket er nådd eller at kreditten er tom.
 *
 * Da feiler hver modell i kjeden på samme måte, så serveren stopper med én
 * gang og gir brukeren en forståelig melding i stedet for rå API-tekst.
 *
 * Feilformene (platform.claude.com/docs/en/api/errors og /rate-limits, 23.10.2026):
 * - Eget forbrukstak på organisasjon eller workspace: HTTP 400
 *   invalid_request_error. Meldingen starter med «You have reached your
 *   specified API usage limits» (workspace: «… specified workspace API usage
 *   limits») og sier når tilgangen kommer tilbake.
 * - Tierens månedstak: HTTP 429 rate_limit_error med
 *   error.details.error_code = 'enforced_spend_limit_reached'.
 * - Tom kreditt: «Your credit balance is too low …», og HTTP 402 billing_error.
 */

export const BUDSJETT_FEIL = 'budsjett_brukt_opp'

const TAK = /you have reached your (specified )?(workspace )?api usage limits/i
const KREDITT = /credit balance is too low/i
const DATO = /regain access on (\d{4}-\d{2}-\d{2})/i

const MAANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember']

/**
 * Returnerer { grunn: 'tak' | 'kreditt', igjen: 'YYYY-MM-DD' | null } når
 * feilen betyr at budsjettet er brukt opp, ellers null.
 */
export function budsjettfeil(err, naa = new Date()) {
  if (!err || typeof err !== 'object') return null
  // SDK-en legger API-svaret i err.error; selve feilen ligger i err.error.error.
  const api = err.error?.error ?? {}
  const tekst = `${typeof api.message === 'string' ? api.message : ''} ${err.message ?? ''}`
  if (api.details?.error_code === 'enforced_spend_limit_reached' || TAK.test(tekst)) {
    return { grunn: 'tak', igjen: tekst.match(DATO)?.[1] ?? forsteINesteMaaned(naa) }
  }
  if (KREDITT.test(tekst) || err.status === 402 || (api.type ?? err.type) === 'billing_error') {
    return { grunn: 'kreditt', igjen: null }
  }
  return null
}

// Månedstaket nullstilles 00:00 UTC den 1. i neste måned.
function forsteINesteMaaned(naa) {
  return new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth() + 1, 1)).toISOString().slice(0, 10)
}

export function formaterDato(iso) {
  const [aar, maaned, dag] = iso.split('-').map(Number)
  return `${dag}. ${MAANEDER[maaned - 1]} ${aar}`
}

/** Feilsvaret til klienten: stabil kode og kort norsk tekst, aldri rå API-tekst. */
export function budsjettSvar({ igjen }) {
  const error = igjen
    ? `KI-budsjettet for denne måneden er brukt opp, så Naturportrett kan ikke lage nye portretter nå. Tjenesten virker igjen ${formaterDato(igjen)}.`
    : 'KI-budsjettet er brukt opp, så Naturportrett kan ikke lage nye portretter nå. Tjenesten virker igjen når budsjettet er fylt på.'
  return { error, feil: BUDSJETT_FEIL, igjen }
}
