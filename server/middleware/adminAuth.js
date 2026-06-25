/**
 * Delt admin-autentisering for /admin-endepunktene (feedback + usage).
 *
 * Krever passord via `x-workshop-admin`-header (samme kontrakt som før).
 * I tillegg (K3) en enkel in-memory brute-force-beskyttelse: vi teller
 * FEILEDE forsøk per IP i et 15-minutters vindu og blokkerer (429) etter
 * MAKS_FORSOK feil. Et vellykket forsøk nullstiller telleren, slik at en
 * legitim admin aldri låses ute. Repoet er offentlig — header-formatet er
 * kjent — så uten denne grensen er admin-passordet utsatt for brute-force.
 *
 * In-memory er nok for én Railway-instans. Ved horisontal skalering må
 * telleren flyttes til delt lager (Redis e.l.).
 */

const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD
if (!ADMIN_PASSWORD) {
  console.warn('[admin] WORKSHOP_ADMIN_PASSWORD ikke satt — admin-rutene er deaktivert. Sett env-variabelen for å aktivere.')
}

const VINDU_MS = 15 * 60 * 1000  // 15 min
const MAKS_FORSOK = 10           // feilede forsøk per IP per vindu
const forsokPerIp = new Map()    // ip -> { antall, forste }

function gjeldende(ip) {
  const e = forsokPerIp.get(ip)
  if (!e) return null
  if (Date.now() - e.forste > VINDU_MS) {
    forsokPerIp.delete(ip)
    return null
  }
  return e
}

// Rydd opp utløpte tellere periodisk så Map-en ikke vokser ubegrenset.
// .unref() lar Node avslutte selv om timeren er aktiv.
setInterval(() => {
  const t = Date.now()
  for (const [ip, e] of forsokPerIp) {
    if (t - e.forste > VINDU_MS) forsokPerIp.delete(ip)
  }
}, VINDU_MS).unref?.()

export function krevAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ feil: 'admin deaktivert — WORKSHOP_ADMIN_PASSWORD ikke satt' })
  }
  const ip = req.ip || req.socket?.remoteAddress || 'ukjent'

  const e = gjeldende(ip)
  if (e && e.antall >= MAKS_FORSOK) {
    const sekIgjen = Math.ceil((VINDU_MS - (Date.now() - e.forste)) / 1000)
    res.set('Retry-After', String(sekIgjen))
    return res.status(429).json({ feil: 'For mange feilede forsøk. Prøv igjen senere.' })
  }

  const oppgitt = req.headers['x-workshop-admin']
  if (oppgitt && oppgitt === ADMIN_PASSWORD) {
    forsokPerIp.delete(ip)  // nullstill teller ved vellykket innlogging
    return next()
  }

  // Feilet forsøk — tell opp i gjeldende vindu.
  if (!e) forsokPerIp.set(ip, { antall: 1, forste: Date.now() })
  else e.antall++
  res.status(401).json({ feil: 'feil passord' })
}
