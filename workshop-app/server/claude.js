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
