import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS, DATAKVALITET_FIELD, DATAKVALITET_INSTRUKS, TILTAK_FIELD, TILTAK_INSTRUKS, ANTI_HALLUSINERING, SYMBIOSE_FIELD, SYMBIOSE_INSTRUKS, AVSTAND_INSTRUKS, formatAvstandKm } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et PLANTEPORTRETT — et detaljert plantekortportrett for ÉN konkret plante, strukturert etter Oslo kommunes mal for planteportretter.

${ANTI_HALLUSINERING}

${AVSTAND_INSTRUKS}

${REFERENCES}

${JSON_OUTPUT_RULES}

Returner et JSON-objekt med følgende struktur:

{
  "folkenavn": "Norsk navn",
  "vitenskapelig": "Latinsk navn",
  "rodlisteStatus": { "kode": "LC|NT|VU|EN|CR eller SE/HI/PH for fremmedart", "label": "Norsk forklaring" },
  "artsfamilie": "Familienavn (f.eks. 'Gressfamilien (Poaceae)')",
  "utbredelse": "1-3 setninger om geografisk utbredelse i Norge",
  "lokaliteterVedProsjektomrade": "Hvor planten er kjent å forekomme i nærheten av prosjektområdet (kan være generelt hvis ikke kjent)",
  "beskrivelse": {
    "plantetype": "F.eks. 'Flerårig gras', 'Toårig urt', 'Tre'",
    "storrelse": "Høyde/utstrekning",
    "farger": "Generell fargebeskrivelse av blomst/blad/stengel",
    "vekstform": "Vekstform (tuedannende, krypende, opprett, etc.)"
  },
  "foretrukneNaturtyper": "2-4 setninger om hvilke naturtyper planten foretrekker",
  "blomstringstid": ["Jun","Jul"],
  "habitatkrav": {
    "fuktighet": "Beskrivelse",
    "klimasone": "H-sone hvis aktuelt",
    "hardforhet": "H-grad eller beskrivelse",
    "lysforhold": "Sol/halvskygge/skygge",
    "vindtoleranse": "Beskrivelse",
    "jordtype": "Jordtype og dybde",
    "ph": "pH-område"
  },
  "spredningOgLivssyklus": {
    "frospredning": "Vind/dyr/vann/selvspredning",
    "etableringsvilkar": "Krav til etablering",
    "levetid": "Levetid",
    "overvintringsevne": "Vintertåleranse"
  },
  "tilknyttedeArter": [
    { "art": "Art eller artsgruppe", "detaljer": "Hvordan planten støtter denne arten" }
  ],
  ${SYMBIOSE_FIELD},
  "trussler": "2-4 setninger om trusler",
  "lenkeBilde": "URL eller tom streng",
  "pollinatorVerdi": { "kvalitet": "Lite|Middels|Høy", "detaljer": "Forklaring" },
  "samspillMedMennesker": "Historisk bruk, samtidig bruk, kulturell verdi",
  "attributter": {
    "nokkelart": true|false,
    "hoyOkologiskVerdi": true|false,
    "ansvarsart": true|false,
    "nasjonalForvaltningsinteresse": true|false,
    "hjemmehorende": true|false,
    "finnesINorskProduksjon": true|false,
    "matplanteForDyr": true|false,
    "finnesINorskNatur": true|false
  },
  "erfaringsgrunnlagINorge": "Konkrete eksempler på bruk i Norge (grønne tak, parker, hager, naturrestaurering). 3-6 setninger.",
  "anbefaltSamplanting": "Andre arter som passer å plante sammen med denne",
  "vedlikeholdsbehov": "Krav til vanning, klipping, gjødsling",
  "saerskilteHensyn": "Spesielle utfordringer eller hensyn",
  ${TILTAK_FIELD},
  "kommentarer": "Tilleggsinformasjon",
  ${RELEVANTE_LOVER_FIELD},
  ${DATAKVALITET_FIELD}
}

${RELEVANTE_LOVER_INSTRUKS}

${DATAKVALITET_INSTRUKS}

${TILTAK_INSTRUKS}

${SYMBIOSE_INSTRUKS}

For planter: symbioser kan typisk være pollinatorer (humler, bier, sommerfugler), mykorrhiza-sopp, frøspredende fugler eller pattedyr, eller kantvegetasjons-konkurrenter. Bare ta med dem som har dokumentert artsspesifikk avhengighet med DENNE planten — ikke generelle "pollinerer mange blomster"-koblinger.

Vær konkret og handlingsrettet. For plante som brukes på grønne tak, inkluder eksempler fra Oslo (Vega Scene, etc.) hvis relevant.`

export function buildUserPrompt({ species, address, observedSpecies, narliggendeGronnstrukturer }) {
  const addressStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  const csInfo = species.conservationStatus
    ? `Status fra Artsdatabanken: ${species.conservationStatus.type === 'redlist' ? 'Rødlistet' : 'Svartelistet'} ${species.conservationStatus.category} – ${species.conservationStatus.label}`
    : 'Ikke registrert på Rødliste eller Fremmedartsliste i vår referansedatabase.'

  const observerteBlokk = Array.isArray(observedSpecies) && observedSpecies.length > 0
    ? `\n\n## Observerte arter i området (fra iNaturalist og GBIF)\nKan brukes for vurdering av lokale symbioser/pollinatorer/spredere — ikke gjett utover dette.\n\n${observedSpecies.slice(0, 30).map(sp => `- ${sp.norwegianName} (${sp.scientificNameDisplay || sp.scientificName}) [${sp.category}]`).join('\n')}`
    : ''

  const gronnstrukturBlokk = Array.isArray(narliggendeGronnstrukturer) && narliggendeGronnstrukturer.length > 0
    ? `\n\n## Kjente Oslo-grønnstrukturer i nærheten\nReferer til disse ved navn for lokalRelevans-feltet i symbioser.\n\n${narliggendeGronnstrukturer.map(g => `- ${g.navn} (${g.type}) — ${formatAvstandKm(g.avstandM)}`).join('\n')}`
    : ''

  return `## Plante for portrett
Norsk navn: ${species.norwegianName}
Vitenskapelig navn: ${species.scientificNameDisplay || species.scientificName}
${csInfo}

## Prosjektkontekst
Observert i nærheten av ${addressStr}.${observerteBlokk}${gronnstrukturBlokk}

Generer planteportrett-JSON for denne planten med fokus på relevans for bymiljø/grønne tak/grønne arealer. Husk anti-hallusinerings-regelen: utelat heller enn å gjette.`
}
