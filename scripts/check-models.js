#!/usr/bin/env node
/**
 * Sjekker status på modellene i MODEL_CHAIN mot Anthropic Models API.
 * Advarer hvis noen er deprecated/retired.
 *
 * Kjør: npm run check-models
 *
 * Bruker ANTHROPIC_API_KEY fra .env.
 */
import 'dotenv/config'
import { MODEL_CHAIN, CLAUDE_MODEL } from '../server/config/model.js'

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('FEIL: ANTHROPIC_API_KEY mangler i .env')
  process.exit(1)
}

console.log(`Primær modell: ${CLAUDE_MODEL}`)
console.log(`Fallback-kjede: [${MODEL_CHAIN.join(', ')}]`)
console.log('')
console.log('Sjekker hver modell mot Anthropic Models API ...')
console.log('')

let alleOk = true
let primarOk = false

for (const model of MODEL_CHAIN) {
  try {
    const res = await fetch(`https://api.anthropic.com/v1/models/${encodeURIComponent(model)}`, {
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      }
    })
    if (res.status === 404) {
      console.log(`  ✗ ${model.padEnd(30)} IKKE FUNNET (deprecated/retired)`)
      alleOk = false
      continue
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.log(`  ? ${model.padEnd(30)} HTTP ${res.status} ${body.slice(0, 80)}`)
      continue
    }
    const data = await res.json()
    const ctx = data.max_input_tokens ? `${Math.round(data.max_input_tokens / 1000)}K ctx` : ''
    const out = data.max_tokens ? `${Math.round(data.max_tokens / 1000)}K out` : ''
    const dep = data.deprecated_at ? ` ⚠ deprecated_at=${data.deprecated_at}` : ''
    const ret = data.retires_at ? ` ⚠ retires_at=${data.retires_at}` : ''
    console.log(`  ✓ ${model.padEnd(30)} ${data.display_name || ''} (${ctx}, ${out})${dep}${ret}`)
    if (model === CLAUDE_MODEL) primarOk = true
    if (dep || ret) alleOk = false
  } catch (err) {
    console.log(`  ! ${model.padEnd(30)} feil: ${err.message}`)
    alleOk = false
  }
}

console.log('')
if (!primarOk) {
  console.log('⚠  Primær modell svarer ikke OK — auto-fallback vil tre i kraft, men du bør oppdatere CLAUDE_MODEL.')
  process.exit(2)
}
if (!alleOk) {
  console.log('⚠  En eller flere modeller har advarsel — gjennomgå før neste deploy.')
  process.exit(1)
}
console.log('✓ Alle modeller i kjeden er aktive.')
