import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS, DATAKVALITET_FIELD, DATAKVALITET_INSTRUKS, FORVALTNINGSRAD_FIELD, FORVALTNINGSRAD_INSTRUKS, EIENDOMSKONTEKST_FIELD, EIENDOMSKONTEKST_INSTRUKS } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et NATURPORTRETT — en helhetsoversikt over biologisk mangfold og naturhensyn for et konkret prosjektområde innenfor 500 m radius fra en oppgitt adresse i Oslo.

${REFERENCES}

${JSON_OUTPUT_RULES}

Returner et JSON-objekt med følgende struktur:

{
  "prosjektnavn": "Kort, beskrivende navn (typisk adresse)",
  "lokasjon": "Postnummer + bydel/poststed",
  ${EIENDOMSKONTEKST_FIELD},
  "antallVerdifulleNaturomrader": "Tall + kort beskrivelse, f.eks. '3 verdifulle naturområder, hvorav 1 med høy lokal verdi'",
  "naturtyper": [
    { "navn": "Naturtypens navn", "ninKode": "NiN-kode hvis kjent", "rodlisteStatus": "LC|NT|VU|EN|CR eller 'ikke vurdert'", "beskrivelse": "1-2 setninger" }
  ],
  "arterAvHoyOkologiskVerdi": [
    { "navn": "Norsk navn", "vitenskapelig": "Latinsk navn", "kategori": "Fugl/Plante/Insekt/Pattedyr/Sopp", "status": "f.eks. 'NT – Nær truet' eller 'Nøkkelart'" }
  ],
  "okologiskeSammenhenger": "Beskrivelse av grønne og blå strukturer, korridorer, nettverk og barrierer. 3-5 setninger.",
  "trusler": "Trusler fra utbygging, forurensing, klimaendringer. Fremtidige muligheter. 3-5 setninger.",
  "spesieltViktigeOmrader": "Områder med høyt biologisk mangfold, økosystemtjenester, viktige økologiske sammenhenger. 2-4 setninger.",
  ${FORVALTNINGSRAD_FIELD},
  ${RELEVANTE_LOVER_FIELD},
  ${DATAKVALITET_FIELD},
  "andreKilder": "Aktuelle rapporter, kartlegginger og datakilder for området. IKKE list lover her — bruk relevanteLover-feltet."
}

${RELEVANTE_LOVER_INSTRUKS}

${DATAKVALITET_INSTRUKS}

${FORVALTNINGSRAD_INSTRUKS}

${EIENDOMSKONTEKST_INSTRUKS}

Vær konkret, faglig presis og handlingsrettet. Bruk fagspråk tilpasset arkitekter og reguleringsplanleggere.`

export function buildUserPrompt({ address, coordinates, zoneRadiusM, topSpecies, categoryCounts }) {
  const addressStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer,
    address.poststed || 'Oslo',
  ].filter(Boolean).join(' ')

  const speciesList = topSpecies
    .slice(0, 25)
    .map(sp => {
      const cs = sp.conservationStatus
      const status = cs ? ` [${cs.type === 'redlist' ? 'Rødlistet' : 'Svartelistet'} ${cs.category}]` : ''
      return `- ${sp.norwegianName} (${sp.scientificNameDisplay || sp.scientificName}) [${sp.category}]${status}`
    })
    .join('\n')

  const categorySummary = Object.entries(categoryCounts)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(', ')

  return `## Prosjektadresse
${addressStr}
Koordinater: ${coordinates.lat?.toFixed(5)}, ${coordinates.lon?.toFixed(5)}

## Influenssone
${zoneRadiusM} meter radius

## Observerte arter i området (fra iNaturalist og GBIF)
Kategorier funnet: ${categorySummary}

Topp 25 arter etter observasjonsfrekvens:
${speciesList}

Generer naturportrett-JSON for dette området. Identifiser sannsynlige naturtyper basert på beliggenhet (urban/parknær/sjønær Oslo) og observerte arter.`
}
