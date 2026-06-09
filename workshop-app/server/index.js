import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createWorkshopRouter } from './router.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Last .env fra workshop-app/, ellers arv fra rot-.env (../../.env fra server/).
dotenv.config({ path: path.join(__dirname, '..', '.env') })
if (!process.env.ANTHROPIC_API_KEY) dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const app = express()
app.use(express.json({ limit: '1mb' }))

const BASE_PATH = '/workshop_01'

app.use(`${BASE_PATH}/api`, createWorkshopRouter())

// server bygget frontend (dist/) hvis den finnes
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(BASE_PATH, express.static(dist))
  app.get(`${BASE_PATH}/*`, (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Workshop-api på http://localhost:${PORT}${BASE_PATH}/api` + (fs.existsSync(dist) ? ` (serverer også ${BASE_PATH}/)` : ''))
  if (!process.env.ANTHROPIC_API_KEY) console.warn('  ⚠ ANTHROPIC_API_KEY ikke satt — /generate og /summarize vil bruke reserve/feile.')
})
