import { Router } from 'express'
import { append, readJSON, writeJSON, clearAll } from './store.js'
import { callClaude } from './claude.js'
import {
  RESERVE_TASKS, GENERATE_SYSTEM, buildGenerateUser,
  SUMMARY_SYSTEM, buildSummaryUser
} from './prompts.js'

const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD || 'naturportrett'

function krevAdmin(req, res, next) {
  const oppgitt = req.headers['x-workshop-admin']
  if (oppgitt && oppgitt === ADMIN_PASSWORD) return next()
  res.status(401).json({ feil: 'feil passord' })
}

export function createWorkshopRouter() {
  const router = Router()

  // ---- innsamling ----
  router.post('/submit', (req, res) => {
    const { etat, stilling, epost, svar, klientId, override } = req.body || {}
    if (!etat || !stilling) return res.status(400).json({ feil: 'Mangler etat/stilling' })
    if (klientId && !override) {
      const eksisterende = readJSON('responses.json', []).find(r => r.klientId === klientId && !r.erOverride)
      if (eksisterende) {
        return res.status(409).json({
          feil: 'duplikat',
          tidligereTidspunkt: eksisterende.tidspunkt
        })
      }
    }
    const n = append('responses.json', {
      tidspunkt: new Date().toISOString(),
      etat, stilling, epost: epost || null, svar: svar || [],
      klientId: klientId || null,
      erOverride: !!override
    })
    res.json({ ok: true, antall: n })
  })

  router.post('/answers', (req, res) => {
    const { gruppe, besvarelser } = req.body || {}
    if (!Array.isArray(besvarelser) || !besvarelser.length)
      return res.status(400).json({ feil: 'Ingen besvarelser' })
    const n = append('answers.json', {
      tidspunkt: new Date().toISOString(),
      gruppe: gruppe || 'Uten navn', besvarelser
    })
    res.json({ ok: true, antall: n })
  })

  // ---- admin-data (passordbeskyttet) ----
  router.get('/admin', krevAdmin, (req, res) => {
    const responses = readJSON('responses.json', [])
    const answers = readJSON('answers.json', [])
    res.json({
      antallSvar: responses.length,
      antallEpost: responses.filter(r => r.epost).length,
      antallWorkshop: answers.length,
      responses, answers
    })
  })

  // ---- gjeldende oppgaver (generert hvis finnes, ellers reserve) ----
  router.get('/tasks', (req, res) => {
    const gen = readJSON('tasks.json', null)
    if (gen && Array.isArray(gen.tasks) && gen.tasks.length)
      return res.json({ tasks: gen.tasks, generert: true })
    res.json({ tasks: RESERVE_TASKS, generert: false })
  })

  // ---- Steg 2: generer 5 oppgaver fra svarene ----
  router.post('/generate', krevAdmin, async (req, res) => {
    const responses = readJSON('responses.json', [])
    if (!responses.length) return res.json({ tasks: RESERVE_TASKS, generert: false, grunn: 'ingen svar' })
    try {
      const text = await callClaude(GENERATE_SYSTEM, buildGenerateUser(responses), 900, 90000)
      let tasks = parseTasks(text)
      if (!tasks || tasks.length !== 5) throw new Error('Uventet format')
      writeJSON('tasks.json', { tasks, generertTid: new Date().toISOString() })
      res.json({ tasks, generert: true })
    } catch (e) {
      res.json({ tasks: RESERVE_TASKS, generert: false, grunn: String(e.message || e) })
    }
  })

  // ---- Avslutt: oppsummering + arkiv ----
  router.post('/summarize', krevAdmin, async (req, res) => {
    const responses = readJSON('responses.json', [])
    const answers = readJSON('answers.json', [])
    if (!responses.length && !answers.length) return res.status(400).json({ feil: 'Ingen data' })
    try {
      const markdown = await callClaude(SUMMARY_SYSTEM, buildSummaryUser(responses, answers), 2000, 120000)
      res.json({ ok: true, markdown })
    } catch (e) {
      res.status(500).json({ feil: String(e.message || e) })
    }
  })

  router.post('/reset', krevAdmin, (req, res) => { clearAll(); res.json({ ok: true }) })

  return router
}

function parseTasks(text) {
  let t = (text || '').trim()
  t = t.replace(/^```(json)?/i, '').replace(/```$/i, '').trim()
  const start = t.indexOf('['); const end = t.lastIndexOf(']')
  if (start >= 0 && end > start) t = t.slice(start, end + 1)
  try {
    const arr = JSON.parse(t)
    return Array.isArray(arr) ? arr.map((o, i) => ({
      nr: o.nr || i + 1, tittel: String(o.tittel || ''),
      instruks: String(o.instruks || ''), leveranse: String(o.leveranse || '')
    })) : null
  } catch { return null }
}
