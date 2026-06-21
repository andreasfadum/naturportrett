import { Router } from 'express'
import { aggregerStats } from '../usage/index.js'

const ADMIN_PASSWORD = process.env.WORKSHOP_ADMIN_PASSWORD || 'naturportrett'

function krevAdmin(req, res, next) {
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
