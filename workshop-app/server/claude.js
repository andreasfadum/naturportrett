// Kall mot Anthropic Messages API. Bruker global fetch (Node 18+).
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'

export async function callClaude(system, user, maxTokens = 800, timeoutMs = 90000) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('Mangler ANTHROPIC_API_KEY')
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
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }]
      }),
      signal: ctrl.signal
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error('Anthropic ' + res.status + ': ' + body.slice(0, 300))
    }
    const data = await res.json()
    return (data.content || []).map(b => b.text || '').join('').trim()
  } finally {
    clearTimeout(t)
  }
}
