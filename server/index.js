import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { claudeRouter } from './routes/claude.js'
import { sourcesRouter } from './routes/sources.js'
import { createWorkshopRouter } from '../workshop-app/server/router.js'
import { CLAUDE_MODEL, MODEL_CHAIN } from './config/model.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://naturportrett.figurate.studio',
]
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/claude', claudeRouter)
app.use('/api/sources', sourcesRouter)

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
