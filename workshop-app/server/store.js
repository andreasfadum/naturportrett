// Enkel filbasert lagring i workshop-app/data/. Ingen database.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// DATA_DIR kan overstyres via env-variabel (f.eks. /data for Railway-volum).
// Standard: workshop-app/data/ (lokal utvikling).
const DATA_DIR = process.env.WORKSHOP_DATA_DIR || path.join(__dirname, '..', 'data')

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}
function file(name) { return path.join(DATA_DIR, name) }

export function readJSON(name, fallback) {
  ensure()
  try {
    if (!fs.existsSync(file(name))) return fallback
    return JSON.parse(fs.readFileSync(file(name), 'utf-8'))
  } catch { return fallback }
}
export function writeJSON(name, data) {
  ensure()
  fs.writeFileSync(file(name), JSON.stringify(data, null, 2))
}
export function append(name, item) {
  const arr = readJSON(name, [])
  arr.push(item)
  writeJSON(name, arr)
  return arr.length
}
export function clearAll() {
  ensure()
  for (const n of ['responses.json', 'answers.json', 'tasks.json']) {
    if (fs.existsSync(file(n))) fs.rmSync(file(n))
  }
}
