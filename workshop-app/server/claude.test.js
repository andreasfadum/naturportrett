// Workshop-KI-en når KI-budsjettet er brukt opp. fetch mot api.anthropic.com
// er byttet ut med et falskt svar, så ingen kall går ut. Data skrives til en
// midlertidig mappe. Kjøres med: npm test (fra rotmappa)
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import express from 'express'

const feilKropp = (type, message, details) => JSON.stringify({
  type: 'error',
  error: { type, message, ...(details ? { details } : {}) },
})
const TAK = feilKropp('invalid_request_error', 'You have reached your specified workspace API usage limits. You will regain access on 2026-11-01 at 00:00 UTC.')
const TAK_TIER = feilKropp('rate_limit_error', 'You have reached your API usage limits: your organization has crossed its monthly API usage threshold.', { error_code: 'enforced_spend_limit_reached' })
const KREDITT = feilKropp('invalid_request_error', 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.')
const IKKE_FUNNET = feilKropp('not_found_error', 'model: claude-sonnet-4-6')
const ANNEN_400 = feilKropp('invalid_request_error', 'max_tokens: 999999 > 64000')

const anthropicKall = []
let anthropicSvar = () => ({ status: 500, body: feilKropp('api_error', 'ikke satt opp') })
const ektefetch = globalThis.fetch
globalThis.fetch = async (url, opts) => {
  if (!String(url).startsWith('https://api.anthropic.com/')) return ektefetch(url, opts)
  const model = JSON.parse(opts.body).model
  anthropicKall.push(model)
  const { status, body } = anthropicSvar(model)
  return new Response(body, { status, headers: { 'content-type': 'application/json' } })
}

let callClaude, MODEL_CHAIN, server, base
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workshop-budsjett-'))

before(async () => {
  process.env.ANTHROPIC_API_KEY = 'test-dummy-ikke-ekte'
  process.env.WORKSHOP_DATA_DIR = dataDir
  process.env.WORKSHOP_ADMIN_PASSWORD = 'testpassord'
  delete process.env.CLAUDE_MODEL
  delete process.env.CLAUDE_MODEL_CHAIN
  fs.writeFileSync(path.join(dataDir, 'responses.json'), JSON.stringify([{ etat: 'Test', stilling: 'Test', svar: [] }]))
  ;({ callClaude, MODEL_CHAIN } = await import('./claude.js'))
  const { createWorkshopRouter } = await import('./router.js')
  const app = express()
  app.use(express.json())
  app.use('/api', createWorkshopRouter())
  server = await new Promise(r => { const s = app.listen(0, '127.0.0.1', () => r(s)) })
  base = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.closeAllConnections()
  server.close()
  globalThis.fetch = ektefetch
  fs.rmSync(dataDir, { recursive: true, force: true })
})

async function kallMed(status, body) {
  anthropicKall.length = 0
  anthropicSvar = () => ({ status, body })
  return callClaude('system', 'bruker').then(() => null, e => e)
}

test('forbrukstak og tom kreditt: kjeden stopper etter ett kall', async () => {
  for (const [status, body, grunn] of [[400, TAK, 'tak'], [429, TAK_TIER, 'tak'], [400, KREDITT, 'kreditt'], [402, '{}', 'kreditt']]) {
    const err = await kallMed(status, body)
    assert.deepEqual(anthropicKall, [MODEL_CHAIN[0]], `status ${status}`)
    assert.equal(err.budsjett.grunn, grunn)
  }
})

test('404 går videre i kjeden som før', async () => {
  const err = await kallMed(404, IKKE_FUNNET)
  assert.deepEqual(anthropicKall, MODEL_CHAIN)
  assert.equal(err.budsjett, undefined)
})

test('annen 400 kastes med én gang som før', async () => {
  const err = await kallMed(400, ANNEN_400)
  assert.deepEqual(anthropicKall, [MODEL_CHAIN[0]])
  assert.equal(err.budsjett, undefined)
  assert.match(err.message, /max_tokens/)
})

async function adminPost(sti) {
  const r = await fetch(base + sti, { method: 'POST', headers: { 'x-workshop-admin': 'testpassord' } })
  return { status: r.status, data: await r.json() }
}

test('/generate: 503 med budsjettkode, reserveoppgaver og norsk tekst', async () => {
  anthropicSvar = () => ({ status: 400, body: TAK })
  const { status, data } = await adminPost('/api/generate')
  assert.equal(status, 503)
  assert.equal(data.feil, 'budsjett_brukt_opp')
  assert.equal(data.generert, false)
  assert.ok(Array.isArray(data.tasks) && data.tasks.length > 0)
  assert.match(data.grunn, /KI-budsjettet er brukt opp/)
  assert.doesNotMatch(JSON.stringify(data), /usage limits|invalid_request_error/i)
})

test('/summarize: 503 med budsjettkode og norsk tekst', async () => {
  anthropicSvar = () => ({ status: 400, body: KREDITT })
  const { status, data } = await adminPost('/api/summarize')
  assert.equal(status, 503)
  assert.equal(data.feil, 'budsjett_brukt_opp')
  assert.equal(data.igjen, null)
  assert.match(data.melding, /fylt på/)
  assert.doesNotMatch(JSON.stringify(data), /credit balance/i)
})

test('/summarize: andre feil gir 500 som før', async () => {
  anthropicSvar = () => ({ status: 400, body: ANNEN_400 })
  const { status, data } = await adminPost('/api/summarize')
  assert.equal(status, 500)
  assert.notEqual(data.feil, 'budsjett_brukt_opp')
})
