#!/usr/bin/env node
/**
 * Henter arts-registreringer for Oslo kommune fra GBIF og aggregerer dem
 * til et 100x100m grid for heatmap-visning.
 *
 * Kjør: npm run build:heatmap-data
 *
 * Skriver: public/heatmap-data.json (serveres som static asset)
 *
 * Volum-strategi:
 * - Maks 60 sider á 300 obs = 18 000 observasjoner i første versjon
 * - Bbox dekker hele Oslo kommune (lat 59.80-60.13, lon 10.45-10.95)
 * - Aggregeres til 0.001° grid (~100m bucketing)
 * - Output ~50-200 kB JSON istedenfor 10-20 MB rå observasjoner
 *
 * Senere utvidelser: full eksport via GBIF occurrence/download (asynk),
 * iNaturalist-supplement, tidsperiode-filter.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_FILE = path.join(__dirname, '..', 'public', 'heatmap-data.json')

const OSLO_BBOX = {
  latMin: 59.80,
  latMax: 60.13,
  lonMin: 10.45,
  lonMax: 10.95,
}

const PAGE_SIZE = 300
const MAX_PAGES = 60
const GRID_RESOLUTION = 0.001

const CLASS_TIL_KATEGORI = {
  Aves: 'Fugl',
  Mammalia: 'Pattedyr',
  Insecta: 'Insekt',
  Arachnida: 'Edderkoppdyr',
  Reptilia: 'Reptil',
  Amphibia: 'Amfibium',
  Actinopterygii: 'Fisk',
  Magnoliopsida: 'Plante',
  Liliopsida: 'Plante',
  Pinopsida: 'Plante',
  Polypodiopsida: 'Plante',
  Bryopsida: 'Plante',
  Agaricomycetes: 'Sopp',
  Lecanoromycetes: 'Sopp',
  Mollusca: 'Bløtdyr',
}

const KINGDOM_TIL_KATEGORI = {
  ANIMALIA: 'Dyr',
  PLANTAE: 'Plante',
  FUNGI: 'Sopp',
}

function kategoriserObservasjon(occ) {
  if (occ.class && CLASS_TIL_KATEGORI[occ.class]) return CLASS_TIL_KATEGORI[occ.class]
  if (occ.kingdom && KINGDOM_TIL_KATEGORI[occ.kingdom.toUpperCase()]) {
    return KINGDOM_TIL_KATEGORI[occ.kingdom.toUpperCase()]
  }
  return 'Annet'
}

async function hentSide(offset) {
  const params = new URLSearchParams({
    decimalLatitude: `${OSLO_BBOX.latMin},${OSLO_BBOX.latMax}`,
    decimalLongitude: `${OSLO_BBOX.lonMin},${OSLO_BBOX.lonMax}`,
    country: 'NO',
    hasCoordinate: 'true',
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  const res = await fetch(`https://api.gbif.org/v1/occurrence/search?${params}`)
  if (!res.ok) throw new Error(`GBIF ${res.status} ved offset ${offset}`)
  return res.json()
}

function snapTilGrid(verdi) {
  return Math.round(verdi / GRID_RESOLUTION) * GRID_RESOLUTION
}

async function main() {
  console.log(`Henter observasjoner for Oslo (bbox: ${OSLO_BBOX.latMin}-${OSLO_BBOX.latMax}, ${OSLO_BBOX.lonMin}-${OSLO_BBOX.lonMax})`)
  console.log(`Maks ${MAX_PAGES} sider á ${PAGE_SIZE} obs = ${MAX_PAGES * PAGE_SIZE} observasjoner`)
  console.log('')

  const grid = new Map()
  let totalt = 0
  let ferdig = false

  for (let side = 0; side < MAX_PAGES && !ferdig; side++) {
    const offset = side * PAGE_SIZE
    process.stdout.write(`  Side ${side + 1}/${MAX_PAGES} (offset ${offset}) … `)
    let data
    try {
      data = await hentSide(offset)
    } catch (err) {
      console.log(`feil: ${err.message}`)
      break
    }

    const obs = data.results || []
    console.log(`hentet ${obs.length}`)

    for (const o of obs) {
      if (typeof o.decimalLatitude !== 'number' || typeof o.decimalLongitude !== 'number') continue
      if (
        o.decimalLatitude < OSLO_BBOX.latMin || o.decimalLatitude > OSLO_BBOX.latMax ||
        o.decimalLongitude < OSLO_BBOX.lonMin || o.decimalLongitude > OSLO_BBOX.lonMax
      ) continue

      const kategori = kategoriserObservasjon(o)
      const lat = snapTilGrid(o.decimalLatitude)
      const lon = snapTilGrid(o.decimalLongitude)
      const aar = o.year || null

      const noekkel = `${lat.toFixed(3)}_${lon.toFixed(3)}_${kategori}`
      const eksisterende = grid.get(noekkel)
      if (eksisterende) {
        eksisterende.antall += 1
        if (aar && (!eksisterende.sisteAr || aar > eksisterende.sisteAr)) eksisterende.sisteAr = aar
      } else {
        grid.set(noekkel, {
          lat,
          lon,
          kategori,
          antall: 1,
          sisteAr: aar,
        })
      }
      totalt += 1
    }

    if (obs.length < PAGE_SIZE) {
      ferdig = true
      console.log('  Færre enn full side — antar at vi har alt')
    }

    // Rimelig pause for å være snill mot GBIF
    await new Promise(r => setTimeout(r, 100))
  }

  const celler = Array.from(grid.values())
  const perKategori = {}
  for (const celle of celler) {
    perKategori[celle.kategori] = (perKategori[celle.kategori] || 0) + celle.antall
  }

  console.log('')
  console.log(`Totalt brukbare observasjoner: ${totalt}`)
  console.log(`Antall celler i grid: ${celler.length}`)
  console.log(`Fordeling per kategori:`)
  for (const [k, n] of Object.entries(perKategori).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(15)} ${n}`)
  }

  const output = {
    generertTid: new Date().toISOString(),
    omrade: 'Oslo kommune (bbox)',
    bbox: OSLO_BBOX,
    gridResolusjon: GRID_RESOLUTION,
    antallObservasjoner: totalt,
    antallCeller: celler.length,
    kategorier: Object.keys(perKategori).sort(),
    celler,
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(output))
  const sizeKb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1)
  console.log('')
  console.log(`Skrev ${OUT_FILE} (${sizeKb} kB)`)
}

main().catch(err => {
  console.error('FEIL:', err)
  process.exit(1)
})
