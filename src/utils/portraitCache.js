/**
 * Lokal-cache for genererte portretter. Sparer KI-runder når brukeren
 * bytter språk frem og tilbake, eller navigerer tilbake til et portrett
 * de allerede har sett. Lagres i localStorage med 24-timers TTL.
 *
 * Cachen lagrer kun KI-output (det dyreste å regenerere). Artsdata
 * fra GBIF/iNaturalist cachees ikke — den hentes raskt og billig av
 * useSpeciesSearch ved adresse-/radiusendring.
 */

const PREFIX = 'naturportrett.portrett-cache.'
const TTL_MS = 24 * 60 * 60 * 1000  // 24 timer

/**
 * Bygg en cache-nøkkel som er stabil for samme inputkombinasjon.
 * Returnerer null hvis vi mangler påkrevd input (da hopper vi cache).
 */
export function lagCacheNokkel(portraitType, payload) {
  const { lat, lon } = payload?.address?.representasjonspunkt || {}
  if (typeof lat !== 'number' || typeof lon !== 'number') return null

  const koord = `${lat.toFixed(5)},${lon.toFixed(5)}`
  const lang = payload.lang || 'no'
  const r = payload.zoneRadiusM ?? 500

  switch (portraitType) {
    case 'naturportrett':
      return `np:${koord}:r${r}:${lang}`
    case 'artsportrett':
    case 'planteportrett': {
      const sid = payload.species?.id
      if (!sid) return null
      return `${portraitType}:${koord}:r${r}:s${sid}:${lang}`
    }
    case 'naturtypeportrett': {
      const nin = payload.naturtype?.ninKode
      if (!nin) return null
      return `nt:${koord}:r${r}:n${nin}:${lang}`
    }
    case 'planportrett':
      return `pp:${koord}:r${r}:${lang}`
    default:
      return null
  }
}

export function getCache(nokkel) {
  if (!nokkel) return null
  try {
    const raw = window.localStorage.getItem(PREFIX + nokkel)
    if (!raw) return null
    const { portrait, tidspunkt } = JSON.parse(raw)
    if (typeof tidspunkt !== 'number' || Date.now() - tidspunkt > TTL_MS) {
      window.localStorage.removeItem(PREFIX + nokkel)
      return null
    }
    return portrait
  } catch {
    return null
  }
}

export function setCache(nokkel, portrait) {
  if (!nokkel || !portrait) return
  const verdi = JSON.stringify({ portrait, tidspunkt: Date.now() })
  try {
    window.localStorage.setItem(PREFIX + nokkel, verdi)
  } catch {
    // Antagelig quota-feil. Rydd utløpte entries og prøv én gang til.
    cleanupExpired()
    try {
      window.localStorage.setItem(PREFIX + nokkel, verdi)
    } catch {
      // Gi opp stille — generering fungerer fortsatt uten cache.
    }
  }
}

/**
 * Sletter alle utløpte cache-entries. Trygt å kjøre ved app-start.
 */
export function cleanupExpired() {
  try {
    const naa = Date.now()
    const noklerASlette = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const nokkel = window.localStorage.key(i)
      if (!nokkel || !nokkel.startsWith(PREFIX)) continue
      try {
        const raw = window.localStorage.getItem(nokkel)
        const { tidspunkt } = JSON.parse(raw)
        if (typeof tidspunkt !== 'number' || naa - tidspunkt > TTL_MS) {
          noklerASlette.push(nokkel)
        }
      } catch {
        noklerASlette.push(nokkel)  // korrupt entry — fjernes
      }
    }
    for (const k of noklerASlette) window.localStorage.removeItem(k)
  } catch {
    // localStorage ikke tilgjengelig (f.eks. private browsing strict mode)
  }
}
