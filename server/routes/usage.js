import { Router } from 'express'
import { aggregerStats } from '../usage/index.js'
import { krevAdmin } from '../middleware/adminAuth.js'

export const usageRouter = Router()

usageRouter.get('/admin', krevAdmin, (_req, res) => {
  try {
    res.json(aggregerStats())
  } catch (err) {
    console.error('[usage] Aggregeringsfeil:', err.message)
    res.status(500).json({ feil: 'Kunne ikke aggregere data' })
  }
})
