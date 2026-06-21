/**
 * Tilbakemeldings-API (iterasjon 6 — R7-innspill 17. juni).
 *
 * Lagrer brukerinnspill om feil/mangler i portretter på det persistente
 * Railway-volumet (samme dir som workshop-app: WORKSHOP_DATA_DIR=/data).
 * Bruker samme passordbeskyttede admin-mønster som workshop-app.
 */
import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.WORKSHOP_DATA_DIR || path.join(__dirname, '..', '..', 'workshop-app', 'data')
const FEEDBACK_FILE = 'naturportrett-feedback.json'
const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD || 'naturportrett'

const GYLDIGE_TYPER = ['feil_innhold', 'manglende_info', 'hallusinasjon', 'tekstforslag', 'annet']
const GYLDIGE_PORTRETTER = ['naturportrett', 'artsportrett', 'planteportrett', 'naturtypeportrett']

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
feedbackRouter.post('/', (req, res) => {
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
