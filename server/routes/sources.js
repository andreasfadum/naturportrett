import { Router } from 'express'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export const sourcesRouter = Router()

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../')
const SOURCES_DIR = join(ROOT, 'kunnskapskilder')

sourcesRouter.get('/', (req, res) => {
  try {
    const files = readdirSync(SOURCES_DIR).filter(f => f.endsWith('.json'))
    const sources = files
      .map(file => {
        try {
          const content = readFileSync(join(SOURCES_DIR, file), 'utf-8')
          return JSON.parse(content)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .filter(s => s.enabled !== false)

    res.json({ sources })
  } catch (err) {
    res.status(500).json({ error: 'Kunne ikke lese kunnskapskilder', detail: err.message })
  }
})
