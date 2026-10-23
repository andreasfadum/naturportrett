// Gjenkjenning av «KI-budsjettet er brukt opp». Feilene bygges med SDK-ens
// egen APIError.generate, så de har samme form som det SDK-en kaster.
// Ingen nettverk, ingen ekte API-kall. Kjøres med: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import Anthropic from '@anthropic-ai/sdk'
import { budsjettfeil, budsjettSvar, formaterDato, BUDSJETT_FEIL } from './index.js'

function apiFeil(status, type, message, details) {
  const body = { type: 'error', error: { type, message, ...(details ? { details } : {}) }, request_id: 'req_test' }
  return Anthropic.APIError.generate(status, body, undefined, {})
}

const OKT = new Date('2026-10-23T09:00:00Z')

test('eget forbrukstak på organisasjonen (400) gjenkjennes med datoen fra API-et', () => {
  const err = apiFeil(400, 'invalid_request_error', 'You have reached your specified API usage limits. You will regain access on 2026-11-01 at 00:00 UTC.')
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'tak', igjen: '2026-11-01' })
})

test('eget forbrukstak på workspace (400) gjenkjennes', () => {
  const err = apiFeil(400, 'invalid_request_error', 'You have reached your specified workspace API usage limits. You will regain access on 2026-11-01 at 00:00 UTC.')
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'tak', igjen: '2026-11-01' })
})

test('tierens månedstak (429 enforced_spend_limit_reached) gjenkjennes', () => {
  const err = apiFeil(429, 'rate_limit_error', "You have reached your API usage limits: your organization has crossed its monthly API usage threshold, set based on your organization's API tier. You will regain access on 2026-11-01 at 00:00 UTC.", { error_code: 'enforced_spend_limit_reached' })
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'tak', igjen: '2026-11-01' })
})

test('feilkoden alene holder for tak, og datoen faller tilbake til 1. i neste måned (UTC)', () => {
  const err = apiFeil(429, 'rate_limit_error', 'Usage paused.', { error_code: 'enforced_spend_limit_reached' })
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'tak', igjen: '2026-11-01' })
  assert.equal(budsjettfeil(err, new Date('2026-12-31T23:59:00Z')).igjen, '2027-01-01')
})

test('for lav kreditt (400) gjenkjennes uten dato', () => {
  const err = apiFeil(400, 'invalid_request_error', 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.')
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'kreditt', igjen: null })
})

test('402 billing_error regnes som tom kreditt', () => {
  const err = apiFeil(402, 'billing_error', "There's an issue with your billing or payment information.")
  assert.deepEqual(budsjettfeil(err, OKT), { grunn: 'kreditt', igjen: null })
})

test('andre feil er ikke budsjettfeil', () => {
  const andre = [
    apiFeil(429, 'rate_limit_error', 'This request would exceed the rate limit for your organization of 50 requests per minute.'),
    apiFeil(404, 'not_found_error', 'model: claude-sonnet-4-6'),
    apiFeil(400, 'invalid_request_error', 'max_tokens: 999999 > 64000, which is the maximum allowed number of output tokens'),
    apiFeil(401, 'authentication_error', 'invalid x-api-key'),
    apiFeil(500, 'api_error', 'Internal server error'),
    apiFeil(529, 'overloaded_error', 'Overloaded'),
    new Anthropic.APIConnectionError({ message: 'Connection error.' }),
    Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }),
    null,
    undefined,
  ]
  for (const err of andre) assert.equal(budsjettfeil(err, OKT), null, String(err?.message))
})

test('svaret til klienten har stabil kode, norsk tekst med dato og ingen rå API-tekst', () => {
  const svar = budsjettSvar({ grunn: 'tak', igjen: '2026-11-01' })
  assert.equal(svar.feil, BUDSJETT_FEIL)
  assert.equal(svar.feil, 'budsjett_brukt_opp')
  assert.equal(svar.igjen, '2026-11-01')
  assert.match(svar.error, /KI-budsjettet/)
  assert.match(svar.error, /1\. november 2026/)
  assert.doesNotMatch(svar.error, /usage limits|regain access|Anthropic/i)
})

test('svaret ved tom kreditt har ingen dato', () => {
  const svar = budsjettSvar({ grunn: 'kreditt', igjen: null })
  assert.equal(svar.feil, 'budsjett_brukt_opp')
  assert.equal(svar.igjen, null)
  assert.match(svar.error, /fylt på/)
})

test('formaterDato gir norsk dato', () => {
  assert.equal(formaterDato('2026-11-01'), '1. november 2026')
  assert.equal(formaterDato('2027-01-01'), '1. januar 2027')
})
