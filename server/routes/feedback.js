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

  const kontekstLinjer = []
  if (innslag.kontekst) {
    for (const [k, v] of Object.entries(innslag.kontekst)) {
      if (v) kontekstLinjer.push(`<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`)
    }
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; color: #1d1d1d;">
      <h2 style="color: #2A2859; margin-bottom: 4px;">Ny tilbakemelding på Naturportrett</h2>
      <p style="color: #555; margin-top: 0;">Mottatt ${new Date(innslag.tidspunkt).toLocaleString('nb-NO', { dateStyle: 'long', timeStyle: 'short' })}</p>

      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Portrett</td><td style="padding: 4px 0;"><strong>${escapeHtml(portrettNavn)}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Type</td><td style="padding: 4px 0;"><strong>${escapeHtml(typeNavn)}</strong></td></tr>
        ${innslag.seksjon ? `<tr><td style="padding: 4px 12px 4px 0; color: #555;">Seksjon</td><td style="padding: 4px 0;">${escapeHtml(innslag.seksjon)}</td></tr>` : ''}
        ${innslag.epost ? `<tr><td style="padding: 4px 12px 4px 0; color: #555;">Avsender e-post</td><td style="padding: 4px 0;"><a href="mailto:${escapeHtml(innslag.epost)}">${escapeHtml(innslag.epost)}</a></td></tr>` : ''}
      </table>

      <h3 style="color: #2A2859; margin-bottom: 4px;">Innspill</h3>
      <blockquote style="border-left: 3px solid #2A2859; padding: 8px 12px; background: #f6f3eb; margin: 8px 0; white-space: pre-wrap;">${escapeHtml(innslag.fritekst)}</blockquote>

      ${kontekstLinjer.length > 0 ? `
        <h3 style="color: #2A2859; margin-bottom: 4px;">Kontekst</h3>
        <ul style="margin: 4px 0 16px;">${kontekstLinjer.join('')}</ul>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="font-size: 12px; color: #888;">
        Sendt fra <a href="https://naturportrett.figurate.studio">naturportrett.figurate.studio</a> (Plan- og bygningsetaten, Oslo kommune).
        Klient-ID: ${escapeHtml(innslag.klientId || '–')}
      </p>
    </div>
  `.trim()

  const tekst = [
    `Ny tilbakemelding på Naturportrett`,
    `Mottatt ${innslag.tidspunkt}`,
    ``,
    `Portrett: ${portrettNavn}`,
    `Type: ${typeNavn}`,
    innslag.seksjon ? `Seksjon: ${innslag.seksjon}` : null,
    innslag.epost ? `Avsender e-post: ${innslag.epost}` : null,
    ``,
    `Innspill:`,
    innslag.fritekst,
    ``,
    `Klient-ID: ${innslag.klientId || '–'}`,
    `Kilde: https://naturportrett.figurate.studio`,
  ].filter(Boolean).join('\n')

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
