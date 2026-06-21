#!/usr/bin/env node
/**
 * Parser for markdown-formatert lovverk i Kunnskapsbase/.
 * Genererer strukturert JSON per lov + en hovedindeks.
 *
 * Kjør: npm run build:lover-index
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const KB_DIR = path.join(ROOT, 'Kunnskapsbase')
const OUT_DIR = path.join(KB_DIR, 'index')

const LOVER = [
  {
    lovId: 'naturmangfoldloven',
    kortKode: 'nml',
    tittel: 'Lov om forvaltning av naturens mangfold (naturmangfoldloven)',
    file: 'naturmangfoldloven.md',
  },
  {
    lovId: 'friluftsloven',
    kortKode: 'friluftsloven',
    tittel: 'Lov om friluftslivet (friluftsloven)',
    file: 'friluftsloven.md',
  },
  {
    lovId: 'forvaltningsloven',
    kortKode: 'forvaltningsloven',
    tittel: 'Lov om behandlingsmåten i forvaltningssaker (forvaltningsloven)',
    file: 'forvaltningsloven.md',
  },
  {
    lovId: 'byggesaksforskriften-sak10',
    kortKode: 'sak10',
    tittel: 'Forskrift om byggesak (byggesaksforskriften – SAK10)',
    file: 'byggesaksforskriften-sak10.md',
    endringer: ['byggesaksforskriften-sak10-endring-2025-11-03.md'],
  },
  {
    lovId: 'plan-og-bygningsloven',
    kortKode: 'pbl',
    tittel: 'Lov om planlegging og byggesaksbehandling (plan- og bygningsloven)',
    file: 'plan-og-bygningsloven.md',
  },
]

function parseMetadata(md) {
  // Trekk ut Dato-feltet fra metadata-tabellen
  const dateMatch = md.match(/\|\s*Dato\s*\|\s*((?:LOV|FOR)-[\d-]+)\s*\|/)
  const sistEndretMatch = md.match(/\|\s*Sist endret\s*\|\s*([^|]+?)\s*\|/)
  const datoKode = dateMatch ? dateMatch[1] : null
  const sistEndret = sistEndretMatch ? sistEndretMatch[1].trim() : null
  return { datoKode, sistEndret }
}

function buildLovdataBaseUrl(datoKode) {
  if (!datoKode) return null
  // LOV-2009-06-19-100 → https://lovdata.no/lov/2009-06-19-100
  // FOR-2010-03-26-488 → https://lovdata.no/forskrift/2010-03-26-488
  const isForskrift = datoKode.startsWith('FOR-')
  const datePart = datoKode.replace(/^(LOV|FOR)-/, '')
  const kind = isForskrift ? 'forskrift' : 'lov'
  return `https://lovdata.no/${kind}/${datePart}`
}

function parseChapters(md) {
  // Finn alle `## ` overskrifter (kapittel-overskrifter)
  const chapters = []
  const chapterRegex = /^## (.+)$/gm
  let m
  while ((m = chapterRegex.exec(md)) !== null) {
    const heading = m[1].trim()
    // Eksempler:
    //   "Kapittel I. Formål og virkeområde mv."
    //   "Kapittel I. Om ferdsel m.v."
    //   "Kapittel I–II (utdrag)"
    //   "Første del. Generelle bestemmelser"
    //   "Kort om loven"  (skip)
    //   "Kapitteloversikt" (skip)
    if (/^(Kort om loven|Kapitteloversikt|Innholdsfortegnelse)/i.test(heading)) continue
    chapters.push({ heading, position: m.index })
  }
  return chapters
}

function chapterAtPosition(chapters, position) {
  let current = null
  for (const c of chapters) {
    if (c.position <= position) current = c
    else break
  }
  return current ? current.heading : null
}

function parseParagraphs(md, kortKode) {
  // Match bold-spans som starter med "§ "
  // Vi godtar:
  //   - "§ 1. (tema)" — naturmangfoldloven
  //   - "§ 1. (Tema) text..." — friluftsloven (inline tekst)
  //   - "§ 1 (tema):" eller "§ 1 (tema)" — forvaltningsloven
  //   - "§ 1 a. (tema)" — bokstavsuffiks
  //   - "§ 1-1 (tema):" eller "§ 1-1 tema:" — sak10
  //   - "§ 1-3 opplysningsplikt" — sak10 uten parens
  //
  // Strategi:
  // 1) Finn alle bold-spans
  // 2) For hver bold-span: sjekk om innholdet starter med "§ "
  // 3) Trekk ut nummer, evt. tema fra parens, og resten av bold-innholdet
  // 4) Paragrafteksten er teksten mellom denne bold-spannen og neste §-bold-span

  const paragraphs = []
  const boldRegex = /\*\*([^*]+?)\*\*/g
  const matches = []
  let m
  while ((m = boldRegex.exec(md)) !== null) {
    const inner = m[1].trim()
    if (!inner.startsWith('§')) continue
    // Trekk ut paragrafnummer
    // Eksempler på inner:
    //   "§ 1. (lovens formål)"
    //   "§ 1 a. (Hva som forstås med innmark og utmark)"
    //   "§ 11 a (saksbehandlingstid, foreløpig svar):"
    //   "§ 1-1 (formål):"
    //   "§ 1-3 opplysningsplikt"
    //   "§§ 6–10 (habilitet/ugildhet):"  ← område, hopper over
    //   "§ 13–13 g (taushetsplikt)"      ← område, hopper over
    if (inner.startsWith('§§')) continue
    // Sjekk for områdebindestrek-syntaks (en-dash eller hyphen mellom numre)
    // Behold §-nummer som "X-Y" for sak10, men ikke "X–Y" områder
    const numMatch = inner.match(/^§\s*([0-9]+(?:\s*[a-zæøå])?(?:-\d+)?)(?:\.|\s|$)/)
    if (!numMatch) continue
    const rawNum = numMatch[1].replace(/\s+/g, ' ').trim()
    // Skip ranges som "13–13 g" (en-dash)
    if (/[–]/.test(inner.slice(0, numMatch[0].length + 5))) continue
    // Trekk ut tema fra parens, hvis finnes
    const temaMatch = inner.match(/\(([^)]+)\)/)
    const tema = temaMatch ? temaMatch[1].trim() : extractInlineTema(inner, numMatch[0])
    // Skip "(Opphevet)" / "(opphevet ...)"
    if (tema && /^opphevet/i.test(tema)) continue
    // Skip meta-headere fra endringsforskrifter ("skal lyde", "skal oppheves", etc.)
    const afterNum = inner.slice(numMatch[0].length).trim()
    if (/^(skal lyde|skal endres|skal oppheves|oppheves|fjernes)\b/i.test(afterNum)) continue
    matches.push({
      rawNum,
      tema: tema ? tema.replace(/\s+/g, ' ').trim() : '',
      boldStart: m.index,
      boldEnd: m.index + m[0].length,
      boldInner: inner.replace(/\s+/g, ' '),
    })
  }

  // Dedup: hold første forekomst per nummer (cross-references senere i teksten ignoreres)
  const seen = new Set()
  const deduped = []
  for (const x of matches) {
    if (seen.has(x.rawNum)) continue
    seen.add(x.rawNum)
    deduped.push(x)
  }
  matches.length = 0
  matches.push(...deduped)

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i]
    const next = matches[i + 1]
    // Tekst fra slutten av denne bold til starten av neste bold (eller filslutt)
    const sliceEnd = next ? next.boldStart : md.length
    let body = md.slice(cur.boldEnd, sliceEnd).trim()
    // Hvis kroppen begynner med en setning som åpenbart fortsetter bold-overskriften
    // (typisk for friluftsloven: "**§ 1. (Lovens formål)** Formålet er ..."),
    // er det allerede paragraftekst. Bare strip leading punctuation.
    body = body.replace(/^[:.\s]+/, '')

    // pbl-format: bold-spannet er kun "§ N-N." og temaet kommer etter som "***Tema***"
    // Trekk ut tema og strip det fra sitat-body
    if (!cur.tema) {
      const inlineTemaMatch = body.match(/^\*\*\*([^*]+)\*\*\*\s*/)
      if (inlineTemaMatch) {
        cur.tema = inlineTemaMatch[1].trim()
        body = body.slice(inlineTemaMatch[0].length).trim()
      }
    }

    // Hvis kroppen ER en annen ## seksjon eller --- divider, skjær der
    const cutMarkers = ['\n## ', '\n---\n', '\n> ']
    for (const marker of cutMarkers) {
      const idx = body.indexOf(marker)
      if (idx > 0) body = body.slice(0, idx).trim()
    }

    // Hvis tomt: bruk informasjonen fra bold-spannet selv som "sitat"
    // (dette gjelder gruppe-formatet i sak10/forvaltningsloven)
    let sitat = body
    if (!sitat || sitat.length < 10) {
      // Trekk ut alt etter §-nummer fra bold-innholdet
      const after = cur.boldInner.replace(/^§\s*[0-9]+(?:\s*[a-zæøå])?(?:-\d+)?(?:\.|\s)?\s*/, '').trim()
      sitat = after || cur.boldInner
    }

    // Lim tilbake tema i sitat hvis det var i parens (slik at sitatet er komplett)
    // Faktisk gjør vi ingenting — temaet vises som egen "tema"-felt i UI

    const displayNum = cur.rawNum
    const id = `${kortKode}-${displayNum.replace(/\s+/g, '').toLowerCase()}`

    paragraphs.push({
      id,
      nummer: displayNum,
      displayNavn: `§ ${displayNum}`,
      tema: cur.tema || '',
      sitat: cleanSitat(sitat),
      _position: cur.boldStart,
    })
  }

  return paragraphs
}

/**
 * Renser sitat-tekst fra Lovdata-formatert markdown:
 * - Fjerner endringshistorikk-tabellrader (`| 0 | Endret ved lover ... |`)
 * - Fjerner tabell-separatorer (`| --- | --- |`)
 * - Konverterer nummererte tabellrader (`| 1. | innhold |`) til vanlige
 *   listepunkter (`1. innhold`) som lar seg lese som ren prosa
 * - Beholder markdown-lenker `[tekst](url)` slik at UI kan rendre dem som
 *   klikkbare elementer
 */
function cleanSitat(raw) {
  if (!raw) return ''
  const linjer = raw.split('\n')
  const ut = []
  for (let i = 0; i < linjer.length; i++) {
    const l = linjer[i]
    const trimmed = l.trim()
    // Tabell-separator
    if (/^\|\s*[-\s|]+\|$/.test(trimmed)) continue
    // Endringshistorikk-rader (typisk `| 0 | Endret ved lover ... |`)
    if (/^\|\s*0\s*\|\s*(Endret|Tilføyd|Opphevet|Endra|Endret ved)\b/i.test(trimmed)) continue
    // Nummerert tabellrad: `| N. | innhold |` eller `| N | innhold |`
    const numRow = trimmed.match(/^\|\s*([0-9]+)\.?\s*\|\s*(.+?)\s*\|?\s*$/)
    if (numRow) {
      const innhold = numRow[2].replace(/\|+$/, '').trim()
      ut.push(`${numRow[1]}. ${innhold}`)
      continue
    }
    // Generelle tabellrader uten tydelig nummer: forsøk å snu til ren tekst
    if (/^\|.+\|$/.test(trimmed)) {
      const inner = trimmed.replace(/^\||\|$/g, '').split('|').map(s => s.trim()).filter(Boolean)
      if (inner.length > 0) {
        ut.push(inner.join(' — '))
        continue
      }
    }
    ut.push(l)
  }
  return ut.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function extractInlineTema(inner, numPrefix) {
  // For "§ 1-3 opplysningsplikt" (uten parens): bruk teksten etter nummer-prefiks
  // numPrefix er noe sånt som "§ 1-3 " eller "§ 1. "
  const rest = inner.slice(numPrefix.length).trim()
  // Avbryt ved kolon, punkt eller komma
  const stop = rest.search(/[:.,]/)
  return stop > 0 ? rest.slice(0, stop).trim() : rest
}

function applyChapters(paragraphs, chapters) {
  return paragraphs.map(p => {
    const chapterHeading = chapterAtPosition(chapters, p._position)
    const { _position, ...rest } = p
    return { ...rest, kapittel: chapterHeading || '' }
  })
}

function buildChapterList(md) {
  // Trekk ut kapitteloversikten fra "Kapitteloversikt"-blokken hvis den finnes
  const oversiktMatch = md.match(/## Kapitteloversikt\s+([\s\S]+?)(?:\n## |\n---)/)
  if (!oversiktMatch) return []
  const lines = oversiktMatch[1].split('\n').filter(l => /^-\s+/.test(l))
  return lines.map(line => {
    const text = line.replace(/^-\s+/, '').trim()
    // Eksempel: "Kapittel I. Formål og virkeområde mv. (§§ 1–3)"
    const m = text.match(/^([\wÆØÅæøå.]+(?:\s+[IVX]+)?)\.?\s*(.+?)\s*\((§§[^)]+)\)$/)
    if (m) {
      return { nummer: m[1], tittel: m[2], paragrafRange: m[3] }
    }
    return { nummer: null, tittel: text, paragrafRange: null }
  })
}

function buildParagraphUrl(baseUrl, nummer) {
  if (!baseUrl) return null
  // URL-enkod §-tegnet (Lovdata aksepterer både §N og %C2%A7N)
  const encoded = encodeURIComponent(`§${nummer.replace(/\s+/g, '')}`)
  return `${baseUrl}/${encoded}`
}

function mergeEndringer(paragraphs, endringMds, kortKode) {
  // Endrings-MDer kan inneholde paragrafendringer. For sak10-endringen:
  // "§ 15-3 endres slik: § 15-3 «Tidsavgrensede krav om tilsyn (ikke gitt)»"
  for (const endringMd of endringMds) {
    const endringParagraphs = parseParagraphs(endringMd, kortKode)
    for (const ep of endringParagraphs) {
      const existing = paragraphs.find(p => p.nummer === ep.nummer)
      if (existing) {
        existing.sitat = ep.sitat
        existing.tema = ep.tema || existing.tema
        existing.endretAv = 'FOR-2025-11-03-2172 (i kraft 01.01.2026)'
      }
    }
  }
  return paragraphs
}

function processLaw(lov) {
  const mdPath = path.join(KB_DIR, lov.file)
  const md = fs.readFileSync(mdPath, 'utf8')
  const { datoKode, sistEndret } = parseMetadata(md)
  const lovdataBaseUrl = buildLovdataBaseUrl(datoKode)
  const chapters = parseChapters(md)
  const chapterList = buildChapterList(md)
  let paragraphs = parseParagraphs(md, lov.kortKode)
  paragraphs = applyChapters(paragraphs, chapters)

  if (lov.endringer) {
    const endringMds = lov.endringer.map(f => fs.readFileSync(path.join(KB_DIR, f), 'utf8'))
    paragraphs = mergeEndringer(paragraphs, endringMds, lov.kortKode)
  }

  // Legg på lovdataUrl
  paragraphs = paragraphs.map(p => ({
    ...p,
    lovdataUrl: buildParagraphUrl(lovdataBaseUrl, p.nummer),
  }))

  return {
    lovId: lov.lovId,
    kortKode: lov.kortKode,
    tittel: lov.tittel,
    datoKode,
    sistEndret,
    lovdataBaseUrl,
    kapitler: chapterList,
    paragrafer: paragraphs,
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const indexEntries = {}
  for (const lov of LOVER) {
    console.log(`Parser ${lov.file} ...`)
    const data = processLaw(lov)
    const outFile = path.join(OUT_DIR, `${lov.lovId}.json`)
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf8')
    console.log(`  → ${data.paragrafer.length} paragrafer skrevet til ${path.relative(ROOT, outFile)}`)
    indexEntries[lov.kortKode] = {
      lovId: lov.lovId,
      fil: `${lov.lovId}.json`,
      tittel: data.tittel,
      kortKode: lov.kortKode,
    }
  }

  const indexFile = path.join(OUT_DIR, 'index.json')
  fs.writeFileSync(indexFile, JSON.stringify({ lover: indexEntries }, null, 2), 'utf8')
  console.log(`\nHovedindeks: ${path.relative(ROOT, indexFile)}`)
}

main()
