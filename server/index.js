import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { claudeRouter } from './routes/claude.js'
import { sourcesRouter } from './routes/sources.js'
import { feedbackRouter } from './routes/feedback.js'
import { usageRouter } from './routes/usage.js'
import { roterUsageLogg } from './usage/index.js'
import { createWorkshopRouter } from '../workshop-app/server/router.js'
import { CLAUDE_MODEL, MODEL_CHAIN } from './config/model.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Railway/Vercel-proxy: nødvendig for at req.ip skal returnere klientens
// faktiske IP istedenfor proxyens. Brukes til IP-baserte sessions i
// usage-tracking.
app.set('trust proxy', true)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://naturportrett.figurate.studio',
]
app.use(cors({ origin: allowedOrigins }))
// Portrett-payload inneholder hele artslista (opptil ~200 GBIF + 200 iNaturalist
// med foto-URLer, navn osv.) i `topSpecies`. Default Express-grense er 100 KB,
// noe som ga HTTP 413 (Payload Too Large) på store influensområder. 5 MB er
// romslig og dekker selv de største artslistene.
app.use(express.json({ limit: '5mb' }))

app.use('/api/claude', claudeRouter)
app.use('/api/sources', sourcesRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/usage', usageRouter)

app.get('/api/health', (_, res) => res.json({ status: 'ok', model: CLAUDE_MODEL, modelChain: MODEL_CHAIN }))

// Workshop-app monteres på /workshop_01 (egen under-app, eget datalager)
app.use('/workshop_01/api', createWorkshopRouter())
const workshopDist = join(__dirname, '../workshop-app/dist')
if (fs.existsSync(workshopDist)) {
  app.use('/workshop_01', express.static(workshopDist))
  app.get('/workshop_01/*', (_, res) => res.sendFile(join(workshopDist, 'index.html')))
}

// Server bygget Naturportrett-frontend i produksjon
const distPath = join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (_, res) => res.sendFile(join(distPath, 'index.html')))

// M2 (GDPR) — rydd usage-loggen ved oppstart: fjern innslag eldre enn 90 dager
// og anonymiser ev. gjenværende rå IP-er fra før anonymiseringen ble innført.
try {
  const r = roterUsageLogg()
  if (r.fjernet > 0 || r.anonymisert > 0) {
    console.log(`[usage] Rotasjon: ${r.fjernet} fjernet (>90 d), ${r.anonymisert} IP-er anonymisert, ${r.beholdt} beholdt.`)
  }
} catch (err) {
  console.error('[usage] Rotasjon ved oppstart feilet:', err.message)
}

app.listen(PORT, () => {
  console.log(`Naturportrett API-server kjører på http://localhost:${PORT}`)
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    console.warn('ADVARSEL: ANTHROPIC_API_KEY er ikke satt i .env')
  } else {
    console.log(`API-nøkkel lastet: ${key.slice(0, 14)}...${key.slice(-4)} (${key.length} tegn)`)
  }
  console.log(`KI-modell: ${CLAUDE_MODEL}  ·  fallback-kjede: [${MODEL_CHAIN.join(', ')}]`)
})
