/**
 * Tilbakemeldings-API (iterasjon 6 — R7-innspill 17. juni).
 *
 * Lagrer brukerinnspill om feil/mangler i portretter på det persistente
 * Railway-volumet (samme dir som workshop-app: WORKSHOP_DATA_DIR=/data).
 * Bruker samme passordbeskyttede admin-mønster som workshop-app.
 *
 * Iter 11: ruter også tilbakemeldingen til en konfigurert e-post-adresse
 * via Resend hvis RESEND_API_KEY er satt. Fallback: bare lagring.
 */
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resend } from 'resend'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.WORKSHOP_DATA_DIR || path.join(__dirname, '..', '..', 'workshop-app', 'data')
const FEEDBACK_FILE = 'naturportrett-feedback.json'
const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD || 'naturportrett'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FEEDBACK_RECIPIENT_EMAIL = process.env.FEEDBACK_RECIPIENT_EMAIL || 'andreas.haugstad@pbe.oslo.kommune.no'
const FEEDBACK_FROM_EMAIL = process.env.FEEDBACK_FROM_EMAIL || 'Naturportrett <onboarding@resend.dev>'
const SUBJECT_PREFIX = '[Naturportrett tilbakemelding]'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

const GYLDIGE_TYPER = ['feil_innhold', 'manglende_info', 'hallusinasjon', 'tekstforslag', 'annet']
const GYLDIGE_PORTRETTER = ['naturportrett', 'artsportrett', 'planteportrett', 'naturtypeportrett']

const TYPE_LABEL = {
  feil_innhold: 'Feil i innholdet',
  manglende_info: 'Noe mangler',
  hallusinasjon: 'KI har funnet på noe',
  tekstforslag: 'Forslag til formulering',
  annet: 'Annet',
}

const PORTRAIT_LABEL = {
  naturportrett: 'Naturportrett',
  artsportrett: 'Artsportrett',
  planteportrett: 'Planteportrett',
  naturtypeportrett: 'Naturtypeportrett',
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendFeedbackEmail(innslag) {
  if (!resend) {
    console.warn('[feedback] RESEND_API_KEY mangler — hopper over e-post-routing (innslag lagret lokalt)')
    return { sendt: false, grunn: 'mangler_api_nokkel' }
  }
  const portrettNavn = PORTRAIT_LABEL[innslag.portretttype] || innslag.portretttype
  const typeNavn = TYPE_LABEL[innslag.type] || innslag.type
  const seksjon = innslag.seksjon ? ` — ${innslag.seksjon}` : ''
  const subject = `${SUBJECT_PREFIX} ${portrettNavn}: ${typeNavn}${seksjon}`

  // Bygg markdown-aktig innhold som er rett-fram-kopiérbart inn i Claude.
  const linjer = []
  linjer.push(`# Tilbakemelding på Naturportrett`)
  linjer.push('')
  linjer.push(`**Mottatt:** ${new Date(innslag.tidspunkt).toLocaleString('nb-NO', { dateStyle: 'long', timeStyle: 'short' })}`)
  linjer.push(`**Portretttype:** ${portrettNavn}`)
  linjer.push(`**Innspill-type:** ${typeNavn}`)
  if (innslag.seksjon) linjer.push(`**Seksjon i portrettet:** ${innslag.seksjon}`)
  if (innslag.epost) linjer.push(`**Avsender e-post:** ${innslag.epost}`)
  linjer.push(`**Klient-ID:** ${innslag.klientId || '–'}`)
  linjer.push('')
  linjer.push('## Innspill fra bruker')
  linjer.push('')
  linjer.push(innslag.fritekst)
  if (innslag.kontekst && Object.keys(innslag.kontekst).length > 0) {
    linjer.push('')
    linjer.push('## Kontekst (adresse / portrett-data)')
    linjer.push('')
    for (const [k, v] of Object.entries(innslag.kontekst)) {
      if (v) linjer.push(`- **${k}:** ${v}`)
    }
  }
  linjer.push('')
  linjer.push('---')
  linjer.push('Kilde: Naturportrett — Plan- og bygningsetaten, Oslo kommune')

  const tekst = linjer.join('\n')

  // HTML er en monospace-rendring av samme tekst — lett å markere med Cmd+A
  // og lime inn i Claude uten at typografi/blockquote-styling ødelegger.
  const html = `<pre style="font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; color: #1d1d1d; margin: 0;">${escapeHtml(tekst)}</pre>`

  try {
    const opts = {
      from: FEEDBACK_FROM_EMAIL,
      to: FEEDBACK_RECIPIENT_EMAIL,
      subject,
      html,
      text: tekst,
    }
    if (innslag.epost) opts.replyTo = innslag.epost
    const { data, error } = await resend.emails.send(opts)
    if (error) {
      console.error('[feedback] Resend-feil:', error)
      return { sendt: false, grunn: 'resend_feil', detalj: error }
    }
    console.log('[feedback] E-post sendt til', FEEDBACK_RECIPIENT_EMAIL, '— id:', data?.id)
    return { sendt: true, id: data?.id }
  } catch (err) {
    console.error('[feedback] Uventet feil ved e-post-sending:', err.message)
    return { sendt: false, grunn: 'exception', detalj: err.message }
  }
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function lesAlle() {
  ensureDir()
  const fil = path.join(DATA_DIR, FEEDBACK_FILE)
  if (!fs.existsSync(fil)) return []
  try { return JSON.parse(fs.readFileSync(fil, 'utf-8')) } catch { return [] }
}

function leggTil(innslag) {
  ensureDir()
  const fil = path.join(DATA_DIR, FEEDBACK_FILE)
  const alle = lesAlle()
  alle.push(innslag)
  fs.writeFileSync(fil, JSON.stringify(alle, null, 2))
  return alle.length
}

function krevAdmin(req, res, next) {
  const oppgitt = req.headers['x-workshop-admin']
  if (oppgitt && oppgitt === ADMIN_PASSWORD) return next()
  res.status(401).json({ feil: 'feil passord' })
}

export const feedbackRouter = Router()

// Innsending (åpent — ingen passord)
feedbackRouter.post('/', async (req, res) => {
  const { portretttype, kontekst, seksjon, type, fritekst, epost, klientId } = req.body || {}
  if (!portretttype || !GYLDIGE_PORTRETTER.includes(portretttype)) {
    return res.status(400).json({ feil: 'Ugyldig eller manglende portretttype' })
  }
  if (!fritekst || typeof fritekst !== 'string' || fritekst.trim().length < 3) {
    return res.status(400).json({ feil: 'Fritekst-feltet må fylles ut' })
  }
  const innslag = {
    tidspunkt: new Date().toISOString(),
    portretttype,
    kontekst: kontekst || null,
    seksjon: seksjon || null,
    type: GYLDIGE_TYPER.includes(type) ? type : 'annet',
    fritekst: fritekst.trim().slice(0, 4000),
    epost: (epost || '').trim() || null,
    klientId: klientId || null,
  }
  const antall = leggTil(innslag)
  // E-post-routing er fire-and-forget — vi venter ikke på Resend før vi
  // bekrefter innsending til brukeren (de skal ikke vente på en ekstern API).
  sendFeedbackEmail(innslag).catch(err => console.error('[feedback] sendFeedbackEmail kastet:', err))
  res.json({ ok: true, antall })
})

// Admin-data (passordbeskyttet)
feedbackRouter.get('/admin', krevAdmin, (req, res) => {
  const alle = lesAlle()
  const teller = {}
  for (const i of alle) {
    teller[i.portretttype] = (teller[i.portretttype] || 0) + 1
  }
  res.json({
    antall: alle.length,
    antallPerPortretttype: teller,
    antallMedEpost: alle.filter(i => i.epost).length,
    innslag: alle.sort((a, b) => b.tidspunkt.localeCompare(a.tidspunkt)),
  })
})

// Nullstilling (passordbeskyttet) — bare for utvikling/testing
feedbackRouter.post('/reset', krevAdmin, (req, res) => {
  ensureDir()
  const fil = path.join(DATA_DIR, FEEDBACK_FILE)
  if (fs.existsSync(fil)) fs.rmSync(fil)
  res.json({ ok: true })
})

// Diagnose for e-post-routing (passordbeskyttet)
// Returnerer konfig-status + forsøker faktisk å sende en testmail,
// slik at vi kan se nøyaktig hvilken feil Resend evt. gir.
feedbackRouter.post('/diagnose-email', krevAdmin, async (req, res) => {
  const status = {
    resend_api_key_satt: Boolean(RESEND_API_KEY),
    resend_api_key_lengde: RESEND_API_KEY.length,
    resend_api_key_prefix: RESEND_API_KEY ? RESEND_API_KEY.slice(0, 6) + '...' : null,
    mottaker_default: FEEDBACK_RECIPIENT_EMAIL,
    avsender_default: FEEDBACK_FROM_EMAIL,
    emneprefix: SUBJECT_PREFIX,
  }
  if (!resend) {
    return res.json({ ...status, kanSende: false, grunn: 'RESEND_API_KEY mangler i miljø' })
  }
  // Faktisk send-forsøk
  try {
    const { data, error } = await resend.emails.send({
      from: FEEDBACK_FROM_EMAIL,
      to: FEEDBACK_RECIPIENT_EMAIL,
      subject: `${SUBJECT_PREFIX} Diagnose-testmail (${new Date().toLocaleString('nb-NO')})`,
      text: 'Dette er en testmail fra diagnose-endepunktet. Hvis du mottar denne fungerer Resend-routingen riktig.',
      html: '<p>Dette er en <strong>testmail</strong> fra diagnose-endepunktet. Hvis du mottar denne fungerer Resend-routingen riktig.</p>',
    })
    if (error) {
      return res.json({
        ...status,
        kanSende: false,
        resendFeil: {
          name: error.name,
          message: error.message,
          statusCode: error.statusCode,
        },
      })
    }
    return res.json({ ...status, kanSende: true, emailId: data?.id })
  } catch (err) {
    return res.json({
      ...status,
      kanSende: false,
      exception: err.message || String(err),
      stack: err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : null,
    })
  }
})
