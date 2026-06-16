/**
 * Sentralisert KI-modellkonfigurasjon.
 *
 * - CLAUDE_MODEL: primær modell (overstyrbar via env-variabel CLAUDE_MODEL).
 * - MODEL_CHAIN: prioritert liste — server faller tilbake hvis primær er
 *   deprecated/retired (404 model_not_found). Rekkefølge: primær først,
 *   deretter rimelige fallbacks i synkende kvalitet/kost.
 *
 * Sjekk gjeldende modell-katalog: https://platform.claude.com/docs/about-claude/models
 * Kjør `npm run check-models` for å verifisere status (kaller Models API).
 */

const DEFAULT_MODEL = 'claude-sonnet-4-6'

// Fallback-kjede ved 404 model_not_found. Rekkefølgen er bevisst:
// 1) Sonnet 4.6 — primær (1M context, balansert intelligens/kost)
// 2) Opus 4.8   — dyrere men mer kapabel, brukes hvis Sonnet forsvinner
// 3) Haiku 4.5  — billigste fallback, lav latens, 200K context
const DEFAULT_CHAIN = ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5']

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || DEFAULT_MODEL

export const MODEL_CHAIN = (() => {
  const fromEnv = process.env.CLAUDE_MODEL_CHAIN
  if (fromEnv) return fromEnv.split(',').map(s => s.trim()).filter(Boolean)
  // Primær først, så øvrige fallbacks (dedup hvis CLAUDE_MODEL = DEFAULT)
  return [CLAUDE_MODEL, ...DEFAULT_CHAIN.filter(m => m !== CLAUDE_MODEL)]
})()

/**
 * Sjekk om en feil indikerer at modellen ikke finnes (deprecated/retired).
 * Anthropic returnerer 404 med error.type === 'not_found_error' og en
 * feilmelding som typisk inneholder "model".
 */
export function isModelNotFoundError(err) {
  if (!err) return false
  if (err.status === 404) return true
  const msg = String(err.message || '').toLowerCase()
  return msg.includes('model_not_found') || (msg.includes('model') && msg.includes('not found'))
}
