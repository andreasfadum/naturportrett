/**
 * Lokal-cache for arts-data fra GBIF + iNaturalist. Gir deterministisk
 * gjenta-søk innen 24 timer: samme adresse + radius → samme artsliste,
 * selv om iNaturalist/GBIF i mellomtiden har fått nye observasjoner
 * eller endret sortering.
 *
 * Tidligere oppdaget brukeren at to søk på samme adresse kunne gi
 * ulike arter — fordi iNaturalist sorterte på `votes` som er dynamisk.
 * Vi har samtidig byttet sortering til `id` desc for stabilitet, men
 * cachen sikrer at også reelle bakgrunnsendringer (nye observasjoner
 * lagt til mellom søkene) ikke gir overraskende variasjon i samme
 * arbeidsøkt.
 *
 * Modellen speiler portraitCache.js — samme TTL, samme quota-håndtering.
 */

const PREFIX = 'naturportrett.species-cache.'
const TTL_MS = 24 * 60 * 60 * 1000  // 24 timer

/**
 * Bygg en cache-nøkkel for et species-søk. Koordinater rundes til
 * 5 desimaler (~1 m presisjon — mer enn nok til at "samme adresse"
 * matcher).
 */
export function lagSpeciesNokkel(lat, lon, radiusM) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null
  const koord = `${lat.toFixed(5)},${lon.toFixed(5)}`
  const r = typeof radiusM === 'number' ? radiusM : 500
  return `${koord}:r${r}`
}

export function getSpeciesCache(nokkel) {
  if (!nokkel) return null
  try {
    const raw = window.localStorage.getItem(PREFIX + nokkel)
    if (!raw) return null
    const { species, tidspunkt } = JSON.parse(raw)
    if (typeof tidspunkt !== 'number' || Date.now() - tidspunkt > TTL_MS) {
      window.localStorage.removeItem(PREFIX + nokkel)
      return null
    }
    return species
  } catch {
    return null
  }
}

export function setSpeciesCache(nokkel, species) {
  if (!nokkel || !Array.isArray(species)) return
  const verdi = JSON.stringify({ species, tidspunkt: Date.now() })
  try {
    window.localStorage.setItem(PREFIX + nokkel, verdi)
  } catch {
    cleanupExpiredSpecies()
    try {
      window.localStorage.setItem(PREFIX + nokkel, verdi)
    } catch {
      // Gi opp stille — pipelinen henter species på nytt neste gang.
    }
  }
}

/**
 * Sletter alle utløpte species-cache-entries. Trygt å kjøre ved app-start.
 */
export function cleanupExpiredSpecies() {
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
    // localStorage utilgjengelig
  }
}
