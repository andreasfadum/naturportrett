// Modellkjeden og feilsvarene i /api/claude, kjørt mot en FALSK Anthropic-
// server (ANTHROPIC_BASE_URL) med en dummy-nøkkel. Ingen ekte API-kall.
// Kjøres med: npm test
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import express from 'express'
import Anthropic from '@anthropic-ai/sdk'

const feilKropp = (type, message, details) => ({
  type: 'error',
  error: { type, message, ...(details ? { details } : {}) },
  request_id: 'req_test',
})
const TAK_ORG = feilKropp('invalid_request_error', 'You have reached your specified API usage limits. You will regain access on 2026-11-01 at 00:00 UTC.')
const TAK_WORKSPACE = feilKropp('invalid_request_error', 'You have reached your specified workspace API usage limits. You will regain access on 2026-11-01 at 00:00 UTC.')
const TAK_TIER = feilKropp('rate_limit_error', "You have reached your API usage limits: your organization has crossed its monthly API usage threshold, set based on your organization's API tier. You will regain access on 2026-11-01 at 00:00 UTC.", { error_code: 'enforced_spend_limit_reached' })
const KREDITT = feilKropp('invalid_request_error', 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.')
const BILLING = feilKropp('billing_error', "There's an issue with your billing or payment information.")
const IKKE_FUNNET = feilKropp('not_found_error', 'model: claude-sonnet-4-6')
const ANNEN_400 = feilKropp('invalid_request_error', 'max_tokens: 999999 > 64000, which is the maximum allowed number of output tokens')

const PORTRETT = {
  portraitType: 'naturportrett',
  payload: {
    address: { adressenavn: 'Testveien', nummer: 1, postnummer: '0150', poststed: 'Oslo' },
    coordinates: { lat: 59.91, lon: 10.75 },
    zoneRadiusM: 500,
    topSpecies: [{ norwegianName: 'Gråspurv', scientificName: 'Passer domesticus', category: 'Fugl' }],
    categoryCounts: { Fugl: 1 },
    narliggendeGronnstrukturer: [],
  },
}

// Den falske Anthropic-serveren: noterer modellen i hvert kall og svarer med
// det testen har satt opp.
const upstreamKall = []
let upstreamSvar = () => ({ status: 500, body: feilKropp('api_error', 'ikke satt opp') })
const upstream = http.createServer((req, res) => {
  let raw = ''
  req.on('data', d => { raw += d })
  req.on('end', () => {
    const model = JSON.parse(raw || '{}').model
    upstreamKall.push(model)
    const { status, body } = upstreamSvar(model)
    res.writeHead(status, { 'content-type': 'application/json', 'request-id': 'req_test' })
    res.end(JSON.stringify(body))
  })
})

let server, base, streamWithRetry, MODEL_CHAIN

before(async () => {
  await new Promise(r => upstream.listen(0, '127.0.0.1', r))
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${upstream.address().port}`
  process.env.ANTHROPIC_API_KEY = 'test-dummy-ikke-ekte'
  delete process.env.CLAUDE_MODEL
  delete process.env.CLAUDE_MODEL_CHAIN
  const ruter = await import('./claude.js')
  streamWithRetry = ruter.streamWithRetry
  ;({ MODEL_CHAIN } = await import('../config/model.js'))
  const app = express()
  app.use(express.json())
  app.use('/api/claude', ruter.claudeRouter)
  server = await new Promise(r => { const s = app.listen(0, '127.0.0.1', () => r(s)) })
  base = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.closeAllConnections()
  server.close()
  upstream.closeAllConnections()
  upstream.close()
})

/** POST og les hele SSE-svaret som en liste av { event, data }. */
async function postSSE(sti, body) {
  const r = await fetch(base + sti, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const tekst = await r.text()
  return tekst.split('\n\n').filter(s => s.trim()).map(ramme => {
    let event = 'message'
    let data = ''
    for (const linje of ramme.split('\n')) {
      if (linje.startsWith('event: ')) event = linje.slice(7)
      else if (linje.startsWith('data: ')) data += linje.slice(6)
    }
    try { return { event, data: JSON.parse(data) } } catch { return { event, data } }
  })
}

async function portrettMed(status, body) {
  upstreamKall.length = 0
  upstreamSvar = () => ({ status, body })
  const events = await postSSE('/api/claude/portrait', PORTRETT)
  return { events, feil: events.find(e => e.event === 'error')?.data }
}

for (const [navn, body] of [['organisasjon', TAK_ORG], ['workspace', TAK_WORKSPACE]]) {
  test(`forbrukstak på ${navn} (400): kjeden stopper etter ett kall og klienten får budsjettkoden`, async () => {
    const { events, feil } = await portrettMed(400, body)
    assert.deepEqual(upstreamKall, [MODEL_CHAIN[0]])
    assert.equal(feil.feil, 'budsjett_brukt_opp')
    assert.equal(feil.igjen, '2026-11-01')
    assert.match(feil.error, /KI-budsjettet .* 1\. november 2026/)
    assert.doesNotMatch(JSON.stringify(feil), /usage limits|regain access|invalid_request_error/i)
    assert.equal(events.some(e => e.event === 'portrait'), false)
  })
}

test('tom kreditt (400 og 402): kjeden stopper etter ett kall og klienten får budsjettkoden uten dato', async () => {
  for (const [status, body] of [[400, KREDITT], [402, BILLING]]) {
    const { feil } = await portrettMed(status, body)
    assert.deepEqual(upstreamKall, [MODEL_CHAIN[0]], `status ${status}`)
    assert.equal(feil.feil, 'budsjett_brukt_opp')
    assert.equal(feil.igjen, null)
    assert.doesNotMatch(JSON.stringify(feil), /credit balance|billing/i)
  }
})

test('tierens månedstak (429): ingen gjenforsøk i appen og ingen neste modell', async () => {
  const { feil } = await portrettMed(429, TAK_TIER)
  // SDK-en prøver selv en 429 inntil 2 ganger til; appen skal ikke legge på
  // egne forsøk (ville gitt 9 kall) eller gå videre i kjeden.
  assert.ok(upstreamKall.length <= 3, `${upstreamKall.length} kall`)
  assert.ok(upstreamKall.every(m => m === MODEL_CHAIN[0]), upstreamKall.join(', '))
  assert.equal(feil.feil, 'budsjett_brukt_opp')
  assert.equal(feil.igjen, '2026-11-01')
})

test('404 (modell borte) går videre i kjeden som før', async () => {
  const { feil } = await portrettMed(404, IKKE_FUNNET)
  assert.deepEqual(upstreamKall, MODEL_CHAIN)
  assert.equal(feil.feil, undefined)
  assert.match(feil.error, /404/)
})

test('annen 400 kastes med én gang som før, uten budsjettkode', async () => {
  const { feil } = await portrettMed(400, ANNEN_400)
  assert.deepEqual(upstreamKall, [MODEL_CHAIN[0]])
  assert.equal(feil.feil, undefined)
  assert.match(feil.error, /max_tokens/)
})

test('eldre vurdering-endepunkt (POST /api/claude) sender også budsjettkoden', async () => {
  upstreamKall.length = 0
  upstreamSvar = () => ({ status: 400, body: TAK_ORG })
  const events = await postSSE('/api/claude', {
    address: { adressenavn: 'Testveien', nummer: 1 },
    selectedSpecies: [{ norwegianName: 'Gråspurv', scientificNameDisplay: 'Passer domesticus', category: 'Fugl' }],
  })
  const feil = events.find(e => e.data?.error)?.data
  assert.equal(upstreamKall.length, 1)
  assert.equal(feil.feil, 'budsjett_brukt_opp')
  assert.doesNotMatch(JSON.stringify(feil), /usage limits/i)
})

// streamWithRetry direkte, med en falsk klient (uten nettverk).
function falskKlient(feilFor) {
  const kall = []
  return {
    kall,
    messages: {
      stream(params) {
        kall.push(params.model)
        const feil = feilFor(params.model)
        return {
          async *[Symbol.asyncIterator]() {
            if (feil) throw feil
            yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '{}' } }
          },
          finalMessage: async () => ({ stop_reason: 'end_turn', usage: {} }),
        }
      },
    },
  }
}
const sdkFeil = (status, body) => Anthropic.APIError.generate(status, body, undefined, {})

test('streamWithRetry: budsjettfeil kastes etter ett kall', async () => {
  const klient = falskKlient(() => sdkFeil(400, TAK_ORG))
  await assert.rejects(streamWithRetry(klient, {}, () => {}), /usage limits/)
  assert.deepEqual(klient.kall, [MODEL_CHAIN[0]])
})

test('streamWithRetry: 404 bytter modell som før', async () => {
  const klient = falskKlient(m => (m === MODEL_CHAIN[0] ? sdkFeil(404, IKKE_FUNNET) : null))
  const r = await streamWithRetry(klient, {}, () => {})
  assert.equal(r.modelUsed, MODEL_CHAIN[1])
  assert.deepEqual(klient.kall, [MODEL_CHAIN[0], MODEL_CHAIN[1]])
})

test('streamWithRetry: vanlig 429 prøves på nytt som før', async () => {
  const vanlig429 = feilKropp('rate_limit_error', 'This request would exceed the rate limit for your organization of 50 requests per minute.')
  const klient = falskKlient(() => sdkFeil(429, vanlig429))
  await assert.rejects(streamWithRetry(klient, {}, () => {}, { maxRetries: 1 }), /rate limit/)
  assert.deepEqual(klient.kall, [MODEL_CHAIN[0], MODEL_CHAIN[0]])
})
