// Kall mot Anthropic Messages API. Bruker global fetch (Node 18+).
// Auto-fallback: hvis primær modell er deprecated/retired (404), prøv neste i kjeden.

const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'
const DEFAULT_CHAIN = ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5']

export const MODEL_CHAIN = (() => {
  const fromEnv = process.env.CLAUDE_MODEL_CHAIN
  if (fromEnv) return fromEnv.split(',').map(s => s.trim()).filter(Boolean)
  return [DEFAULT_MODEL, ...DEFAULT_CHAIN.filter(m => m !== DEFAULT_MODEL)]
})()

function isModelNotFound(status, body) {
  if (status === 404) return true
  const msg = String(body || '').toLowerCase()
  return msg.includes('model_not_found') || (msg.includes('model') && msg.includes('not found'))
}

// KI-budsjettet brukt opp: forbrukstaket er nådd (400 «You have reached your
// specified [workspace] API usage limits», eller 429 enforced_spend_limit_reached)
// eller kreditten er tom («credit balance is too low», 402 billing_error).
// Neste modell feiler likt. Samme gjenkjenning som server/budsjett/index.js.
export const BUDSJETT_FEIL = 'budsjett_brukt_opp'

export function budsjettfeil(status, body) {
  const tekst = String(body || '')
  if (/enforced_spend_limit_reached/.test(tekst) || /you have reached your (specified )?(workspace )?api usage limits/i.test(tekst)) {
    const naa = new Date()
    const nullstilles = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth() + 1, 1)).toISOString().slice(0, 10)
    return { grunn: 'tak', igjen: tekst.match(/regain access on (\d{4}-\d{2}-\d{2})/i)?.[1] ?? nullstilles }
  }
  if (/credit balance is too low/i.test(tekst) || status === 402 || /"billing_error"/.test(tekst)) {
    return { grunn: 'kreditt', igjen: null }
  }
  return null
}

export function budsjettSvar({ igjen }) {
  const dato = igjen && new Date(`${igjen}T00:00:00Z`).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const melding = 'KI-budsjettet er brukt opp, så KI-en kan ikke svare nå. '
    + (dato ? `Den virker igjen ${dato}.` : 'Den virker igjen når budsjettet er fylt på.')
  return { feil: BUDSJETT_FEIL, melding, igjen }
}

export async function callClaude(system, user, maxTokens = 800, timeoutMs = 90000) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('Mangler ANTHROPIC_API_KEY')

  let lastErr
  for (const model of MODEL_CHAIN) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: user }]
        }),
        signal: ctrl.signal
      })
      if (res.ok) {
        if (model !== MODEL_CHAIN[0]) {
          console.warn(`Workshop-KI: fallback til ${model} (${MODEL_CHAIN[0]} sannsynligvis deprecated)`)
        }
        const data = await res.json()
        return (data.content || []).map(b => b.text || '').join('').trim()
      }
      const body = await res.text().catch(() => '')
      const budsjett = budsjettfeil(res.status, body)
      if (budsjett) {
        const err = new Error(`Anthropic ${res.status} (${model}): KI-budsjettet er brukt opp (${budsjett.grunn})`)
        err.budsjett = budsjett
        throw err
      }
      if (isModelNotFound(res.status, body)) {
        console.warn(`Workshop-KI: modell ${model} ikke funnet — prøver neste`)
        lastErr = new Error(`Anthropic ${res.status} (${model}): ${body.slice(0, 200)}`)
        continue
      }
      throw new Error(`Anthropic ${res.status} (${model}): ${body.slice(0, 300)}`)
    } finally {
      clearTimeout(t)
    }
  }
  throw lastErr || new Error('Ingen modeller i MODEL_CHAIN er tilgjengelige')
}
