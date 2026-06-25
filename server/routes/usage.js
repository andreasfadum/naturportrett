import { Router } from 'express'
import { aggregerStats } from '../usage/index.js'

// Ingen default-fallback — se feedback.js for begrunnelse.
const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD
if (!ADMIN_PASSWORD) {
  console.warn('[admin/usage] WORKSHOP_ADMIN_PASSWORD ikke satt — admin-rutene er deaktivert. Sett env-variabelen for å aktivere.')
}

function krevAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ feil: 'admin deaktivert — WORKSHOP_ADMIN_PASSWORD ikke satt' })
  }
  const oppgitt = req.headers['x-workshop-admin']
  if (oppgitt && oppgitt === ADMIN_PASSWORD) return next()
  res.status(401).json({ feil: 'feil passord' })
}

export const usageRouter = Router()

usageRouter.get('/admin', krevAdmin, (_req, res) => {
  try {
    res.json(aggregerStats())
  } catch (err) {
    console.error('[usage] Aggregeringsfeil:', err.message)
    res.status(500).json({ feil: 'Kunne ikke aggregere data' })
  }
})
