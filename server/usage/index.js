/**
 * Token- og kostnadssporing for Claude-kall.
 *
 * Lagrer hvert API-kall som én linje i en JSONL-fil på det persistente
 * Railway-volumet. Aggregeres ved behov via aggregerStats() — vi tror
 * ikke filen vokser til mer enn noen MB i prototypefasen (~1 KB per
 * portrett, ~100 kall per dag = ~3 MB per måned).
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.WORKSHOP_DATA_DIR || path.join(__dirname, '..', '..', 'workshop-app', 'data')
const USAGE_FILE = 'claude-usage.jsonl'

// M2 (GDPR) — vi lagrer aldri rå IP. I stedet en saltet hash som er stabil
// per IP (slik at sesjons-grupperingen i aggregerSesjoner fortsatt virker)
// men ikke kan reverseres til en faktisk IP uten saltet. Saltet MÅ være
// hemmelig: IPv4-rommet (~4 mrd) er lite nok til å brute-forces mot en
// usaltet hash. Sett USAGE_IP_SALT i miljøet for at hashene skal være
// stabile på tvers av omstarter; uten det genereres et tilfeldig salt per
// prosess (fortsatt sikkert, men sesjons-grupperingen brytes ved omstart).
const IP_SALT = process.env.USAGE_IP_SALT || crypto.randomBytes(32).toString('hex')
if (!process.env.USAGE_IP_SALT) {
  console.warn('[usage] USAGE_IP_SALT ikke satt — bruker tilfeldig salt per prosess (IP-hash brytes ved omstart). Sett USAGE_IP_SALT for stabile sesjoner.')
}

/**
 * Anonymiser en IP til en ikke-reverserbar, men stabil token.
 * Returnerer null for tom input. Allerede anonymiserte verdier
 * (prefiks 'ip_') sendes uendret tilbake.
 */
export function anonymiserIp(ip) {
  if (!ip) return null
  if (String(ip).startsWith('ip_')) return ip
  return 'ip_' + crypto.createHash('sha256').update(IP_SALT + ip).digest('hex').slice(0, 16)
}

// Maks alder på usage-innslag før de fjernes ved rotasjon.
const MAKS_ALDER_DAGER = 90

/**
 * USD-priser per million tokens. Tall hentet fra Anthropic offisielle
 * prisliste (anthropic.com/pricing). Sist verifisert juni 2026.
 * Disse er ESTIMATER — fasiten ligger i Anthropic Console.
 */
export const MODELL_PRISER = {
  'claude-sonnet-4-6': { input: 3, output: 15, cache_write: 3.75, cache_read: 0.30 },
  'claude-opus-4-8':   { input: 15, output: 75, cache_write: 18.75, cache_read: 1.50 },
  'claude-haiku-4-5':  { input: 1, output: 5, cache_write: 1.25, cache_read: 0.10 },
}

const SESSION_VINDU_MS = 30 * 60 * 1000  // 30 min mellom kall → ny session

export function beregnUsd(modell, usage) {
  const p = MODELL_PRISER[modell]
  if (!p || !usage) return 0
  const input = (usage.input_tokens || 0) / 1_000_000 * p.input
  const output = (usage.output_tokens || 0) / 1_000_000 * p.output
  const cacheWrite = (usage.cache_creation_input_tokens || 0) / 1_000_000 * p.cache_write
  const cacheRead = (usage.cache_read_input_tokens || 0) / 1_000_000 * p.cache_read
  return input + output + cacheWrite + cacheRead
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

/**
 * Logg én API-respons. Tåler manglende eller delvis usage-data.
 *
 * @param {object} args
 * @param {string} args.ip - rå IP; anonymiseres til saltet hash før lagring (M2)
 * @param {string} args.kontekst - 'portrait:naturportrett', 'recommendations', osv.
 * @param {string} args.modell
 * @param {object} args.usage - { input_tokens, output_tokens, cache_*_tokens }
 */
export function logUsage({ ip, kontekst, modell, usage, zoneRadiusM }) {
  if (!usage) return
  try {
    ensureDir()
    const innslag = {
      tidspunkt: new Date().toISOString(),
      ip: anonymiserIp(ip),
      kontekst: kontekst || 'ukjent',
      modell: modell || 'ukjent',
      zoneRadiusM: typeof zoneRadiusM === 'number' ? zoneRadiusM : null,
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      cache_creation_input_tokens: usage.cache_creation_input_tokens || 0,
      cache_read_input_tokens: usage.cache_read_input_tokens || 0,
      usd: beregnUsd(modell, usage),
    }
    fs.appendFileSync(path.join(DATA_DIR, USAGE_FILE), JSON.stringify(innslag) + '\n')
  } catch (err) {
    console.error('[usage] Kunne ikke logge:', err.message)
  }
}

export function lesAlleInnslag() {
  const fil = path.join(DATA_DIR, USAGE_FILE)
  if (!fs.existsSync(fil)) return []
  const content = fs.readFileSync(fil, 'utf-8').trim()
  if (!content) return []
  return content.split('\n').map(l => {
    try { return JSON.parse(l) } catch { return null }
  }).filter(Boolean)
}

/**
 * M2 (GDPR) — rydder usage-loggen: fjerner innslag eldre enn maxDager OG
 * anonymiserer ev. gjenværende rå IP-er fra før anonymiseringen ble innført
 * (en engangs-opprydding av eksisterende data). Skriver filen atomisk
 * (temp + rename). Trygg ved manglende fil. Kalles ved server-oppstart.
 *
 * @returns {{ beholdt: number, fjernet: number, anonymisert: number }}
 */
export function roterUsageLogg(maxDager = MAKS_ALDER_DAGER) {
  const fil = path.join(DATA_DIR, USAGE_FILE)
  if (!fs.existsSync(fil)) return { beholdt: 0, fjernet: 0, anonymisert: 0 }
  const grense = new Date(Date.now() - maxDager * 24 * 60 * 60 * 1000).toISOString()
  const alle = lesAlleInnslag()
  let anonymisert = 0
  const beholdt = []
  for (const innslag of alle) {
    if (innslag.tidspunkt && innslag.tidspunkt < grense) continue  // for gammelt — fjernes
    // Legacy: rå IP lagret før anonymiseringen (ikke null, ikke 'ip_'-prefiks)
    if (innslag.ip && !String(innslag.ip).startsWith('ip_')) {
      innslag.ip = anonymiserIp(innslag.ip)
      anonymisert++
    }
    beholdt.push(innslag)
  }
  const fjernet = alle.length - beholdt.length
  if (fjernet === 0 && anonymisert === 0) return { beholdt: beholdt.length, fjernet, anonymisert }
  try {
    ensureDir()
    const tmp = path.join(DATA_DIR, USAGE_FILE + '.tmp')
    fs.writeFileSync(tmp, beholdt.map(i => JSON.stringify(i)).join('\n') + (beholdt.length ? '\n' : ''))
    fs.renameSync(tmp, fil)
  } catch (err) {
    console.error('[usage] Rotasjon feilet:', err.message)
  }
  return { beholdt: beholdt.length, fjernet, anonymisert }
}

function aggregerKall(kall) {
  const tot = {
    antallKall: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheWriteTokens: 0,
    cacheReadTokens: 0,
    usd: 0,
  }
  const perModell = {}
  const perKontekst = {}
  for (const k of kall) {
    tot.antallKall++
    tot.inputTokens += k.input_tokens || 0
    tot.outputTokens += k.output_tokens || 0
    tot.cacheWriteTokens += k.cache_creation_input_tokens || 0
    tot.cacheReadTokens += k.cache_read_input_tokens || 0
    tot.usd += k.usd || 0
    if (k.modell) {
      perModell[k.modell] = perModell[k.modell] || { antallKall: 0, usd: 0 }
      perModell[k.modell].antallKall++
      perModell[k.modell].usd += k.usd || 0
    }
    if (k.kontekst) {
      perKontekst[k.kontekst] = perKontekst[k.kontekst] || { antallKall: 0, usd: 0 }
      perKontekst[k.kontekst].antallKall++
      perKontekst[k.kontekst].usd += k.usd || 0
    }
  }
  return { ...tot, perModell, perKontekst }
}

/**
 * En "session" defineres som alle kall fra samme IP innenfor 30 min av
 * forrige kall fra samme IP. Litt grovt — flere brukere på samme NAT
 * blir telt som én session — men gir en brukbar pekepinn for en
 * prototype hvor de fleste brukere har egne tilkoblinger.
 */
function aggregerSesjoner(kall) {
  const sortert = [...kall].sort((a, b) => a.tidspunkt.localeCompare(b.tidspunkt))
  const perIp = new Map()
  for (const k of sortert) {
    const ip = k.ip || 'ukjent'
    const t = Date.parse(k.tidspunkt)
    const liste = perIp.get(ip) || []
    const siste = liste[liste.length - 1]
    if (!siste || t - Date.parse(siste.sisteKall) > SESSION_VINDU_MS) {
      liste.push({
        ip,
        forsteKall: k.tidspunkt,
        sisteKall: k.tidspunkt,
        antallKall: 1,
        usd: k.usd || 0,
      })
    } else {
      siste.sisteKall = k.tidspunkt
      siste.antallKall++
      siste.usd += k.usd || 0
    }
    perIp.set(ip, liste)
  }
  const alle = []
  for (const liste of perIp.values()) alle.push(...liste)
  return alle
}

function sesjonsStats(sesjoner) {
  if (sesjoner.length === 0) {
    return { antallSesjoner: 0, snittUsdPerSession: 0, snittKallPerSession: 0 }
  }
  const totUsd = sesjoner.reduce((s, x) => s + x.usd, 0)
  const totKall = sesjoner.reduce((s, x) => s + x.antallKall, 0)
  return {
    antallSesjoner: sesjoner.length,
    snittUsdPerSession: totUsd / sesjoner.length,
    snittKallPerSession: totKall / sesjoner.length,
  }
}

export function aggregerStats() {
  const alle = lesAlleInnslag()
  const idagPrefix = new Date().toISOString().slice(0, 10)
  const idagsKall = alle.filter(i => i.tidspunkt.startsWith(idagPrefix))

  // Siste 7 dager (rullerende vindu)
  const syvDagerSiden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const syvDagerKall = alle.filter(i => i.tidspunkt >= syvDagerSiden)

  // Per-dag-fordeling siste 14 dager (for graf hvis ønskelig senere)
  const dagsBuckets = {}
  const fjortenDagerSiden = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  for (const k of alle) {
    const dato = k.tidspunkt.slice(0, 10)
    if (dato < fjortenDagerSiden) continue
    dagsBuckets[dato] = dagsBuckets[dato] || { antallKall: 0, usd: 0 }
    dagsBuckets[dato].antallKall++
    dagsBuckets[dato].usd += k.usd || 0
  }

  // Per-radius (kun naturportrett-kall, der zoneRadiusM er kjent):
  // bin på 100-meter — viser om kostnaden øker med influenssone-størrelse.
  const radiusBuckets = {}
  for (const k of alle) {
    if (typeof k.zoneRadiusM !== 'number') continue
    if (!k.kontekst || !k.kontekst.startsWith('portrait:naturportrett')) continue
    const bin = Math.round(k.zoneRadiusM / 100) * 100  // 100, 200, ..., 2000
    if (!radiusBuckets[bin]) radiusBuckets[bin] = {
      antallKall: 0, inputTokens: 0, outputTokens: 0, usd: 0,
    }
    radiusBuckets[bin].antallKall++
    radiusBuckets[bin].inputTokens += k.input_tokens || 0
    radiusBuckets[bin].outputTokens += k.output_tokens || 0
    radiusBuckets[bin].usd += k.usd || 0
  }
  // Legg til snitt-felter
  for (const b of Object.values(radiusBuckets)) {
    b.snittInputTokens = b.antallKall > 0 ? Math.round(b.inputTokens / b.antallKall) : 0
    b.snittOutputTokens = b.antallKall > 0 ? Math.round(b.outputTokens / b.antallKall) : 0
    b.snittUsd = b.antallKall > 0 ? b.usd / b.antallKall : 0
  }

  return {
    forstegangBruk: alle[0]?.tidspunkt || null,
    sistKall: alle[alle.length - 1]?.tidspunkt || null,
    idag: {
      ...aggregerKall(idagsKall),
      ...sesjonsStats(aggregerSesjoner(idagsKall)),
    },
    syvDager: {
      ...aggregerKall(syvDagerKall),
      ...sesjonsStats(aggregerSesjoner(syvDagerKall)),
    },
    totalt: {
      ...aggregerKall(alle),
      ...sesjonsStats(aggregerSesjoner(alle)),
    },
    perDag: dagsBuckets,
    perRadius: radiusBuckets,
    prisliste: MODELL_PRISER,
    notat: 'USD-beregninger er estimater basert på offisielle Anthropic-priser. Fasiten ligger i Anthropic Console.',
  }
}
