import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INDEX_DIR = path.resolve(__dirname, '..', '..', 'Kunnskapsbase', 'index')

let CACHED_LOVER = null

function loadLover() {
  if (CACHED_LOVER) return CACHED_LOVER
  const map = new Map()
  try {
    const indexFile = path.join(INDEX_DIR, 'index.json')
    const idx = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
    for (const [kortKode, meta] of Object.entries(idx.lover || {})) {
      const lovFile = path.join(INDEX_DIR, meta.fil)
      if (!fs.existsSync(lovFile)) {
        console.warn(`[lover] Mangler fil: ${meta.fil}`)
        continue
      }
      const data = JSON.parse(fs.readFileSync(lovFile, 'utf8'))
      const paragrafMap = new Map(data.paragrafer.map(p => [p.nummer, p]))
      map.set(kortKode, { meta, data, paragrafMap })
    }
  } catch (err) {
    console.error('[lover] Kunne ikke laste lovindeks:', err.message)
  }
  CACHED_LOVER = map
  return map
}

/**
 * Tar KI-ens råliste over relevante lover/paragrafer og beriker med
 * ordrett sitat + lovdataUrl fra den strukturerte lovbasen.
 *
 * Input:  [{ lov: "nml", paragrafer: ["8","9"], kortBegrunnelse: "..." }, ...]
 * Output: [{ lov: "Naturmangfoldloven", kortKode: "nml", kortBegrunnelse: "...",
 *           paragrafer: [{ nummer, tema, sitat, lovdataUrl }, ...],
 *           ukjentParagrafer: [] }, ...]
 */
export function enrichRelevanteLover(rawList) {
  if (!Array.isArray(rawList)) return []
  const lover = loadLover()
  const result = []
  for (const entry of rawList) {
    if (!entry || typeof entry !== 'object') continue
    const kortKode = entry.lov
    const lovEntry = lover.get(kortKode)
    if (!lovEntry) {
      console.warn(`[lover] Ukjent lovId fra KI: "${kortKode}"`)
      continue
    }
    const ukjentParagrafer = []
    const paragrafer = []
    const inputParagrafer = Array.isArray(entry.paragrafer) ? entry.paragrafer : []
    for (const rawNum of inputParagrafer) {
      const normalized = normalizeParagrafNummer(rawNum)
      const found = lovEntry.paragrafMap.get(normalized)
        || findFlexibleMatch(lovEntry.paragrafMap, normalized)
      if (!found) {
        ukjentParagrafer.push(rawNum)
        continue
      }
      paragrafer.push({
        nummer: found.displayNavn,
        tema: found.tema || '',
        sitat: found.sitat || '',
        lovdataUrl: found.lovdataUrl,
        kapittel: found.kapittel || '',
        endretAv: found.endretAv,
      })
    }
    if (paragrafer.length === 0 && ukjentParagrafer.length === 0) continue
    result.push({
      lov: lovEntry.data.tittel,
      kortKode,
      kortBegrunnelse: typeof entry.kortBegrunnelse === 'string' ? entry.kortBegrunnelse : '',
      paragrafer,
      ukjentParagrafer,
    })
  }
  return result
}

function normalizeParagrafNummer(raw) {
  return String(raw).trim().replace(/^§\s*/, '').replace(/\s+/g, ' ')
}

function findFlexibleMatch(paragrafMap, normalized) {
  // Tillat at KI sender "1a" mens indeksen har "1 a", eller omvendt
  const noSpace = normalized.replace(/\s+/g, '')
  for (const [key, value] of paragrafMap) {
    if (key.replace(/\s+/g, '') === noSpace) return value
  }
  return null
}
