import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS, DATAKVALITET_FIELD, DATAKVALITET_INSTRUKS } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et ARTSPORTRETT — et detaljert kortportrett for ÉN konkret dyreart (fugl, pattedyr, insekt, etc.), strukturert etter Oslo kommunes mal for artsportretter.

${REFERENCES}

${JSON_OUTPUT_RULES}

Returner et JSON-objekt med følgende struktur:

{
  "folkenavn": "Norsk navn",
  "vitenskapelig": "Latinsk navn",
  "rodlisteStatus": { "kode": "LC|NT|VU|EN|CR eller SE/HI/PH for fremmedart", "label": "Norsk forklaring" },
  "artsfamilie": "Familienavn (f.eks. 'Fringillidae (finkefamilien)')",
  "utbredelse": "1-3 setninger om geografisk utbredelse i Norge",
  "beskrivelse": {
    "storrelse": "Lengde/vingespenn/vekt",
    "farger": "Generell fargebeskrivelse",
    "hannkjonn": "Beskrivelse av hannen (eller 'Lik hunnen' hvis monomorph)",
    "hunnkjonn": "Beskrivelse av hunnen"
  },
  "foretrukneHabitater": "2-4 setninger om hvilke habitater arten foretrekker",
  "arssyklus": {
    "avlOgOppvekst": ["Apr","Mai","Jun","Jul"],
    "voksen": ["Jan","Feb","Mar","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Des"],
    "overvintring": ["Jan","Feb","Mar","Nov","Des"]
  },
  "plantebaserteNaeringskilder": [
    { "art": "Plantenavn", "detaljer": "Kort beskrivelse av hva som spises" }
  ],
  "habitatStottendePlanter": [
    { "art": "Plantenavn", "detaljer": "Hva planten gir (skjul/hekking/bær)" }
  ],
  "dyrebasertNaeringskilder": [
    { "art": "Dyretype", "detaljer": "Kort beskrivelse" }
  ],
  "trusslerOgPredatorer": "2-4 setninger om trusler",
  "samspillMedMennesker": "1-3 setninger om hvordan arten samhandler med mennesker",
  "lenkeBildeEllerLyd": "URL eller tom streng",
  "attributter": {
    "nokkelart": true|false,
    "hoyOkologiskVerdi": true|false,
    "ansvarsart": true|false,
    "nasjonalForvaltningsinteresse": true|false
  },
  "atferdsprofil": {
    "parringsatferd": "Detaljert om parring, hekking, egg, ruging, unger",
    "voksen": "Levetid, aktivitet, føde, sosial atferd",
    "romligeForhold": "Trekkmønster, leveområde, overvintring"
  },
  "praktiskeDesigntiltak": [
    "Konkret designtiltak 1",
    "Konkret designtiltak 2"
  ],
  "kommentarer": "Tilleggsinformasjon: parasitter, bevaring, interaksjoner, rolle i økosystemet",
  ${RELEVANTE_LOVER_FIELD},
  ${DATAKVALITET_FIELD}
}

${RELEVANTE_LOVER_INSTRUKS}

${DATAKVALITET_INSTRUKS}

Vær konkret med tall og avstander. Inkluder praktiske mål (f.eks. 'fuglekasse 12×12 cm', 'hekkelokalitet til mat: <100 m').`

export function buildUserPrompt({ species, address }) {
  const addressStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  const csInfo = species.conservationStatus
    ? `Status fra Artsdatabanken: ${species.conservationStatus.type === 'redlist' ? 'Rødlistet' : 'Svartelistet'} ${species.conservationStatus.category} – ${species.conservationStatus.label}`
    : 'Ikke registrert på Rødliste eller Fremmedartsliste i vår referansedatabase.'

  return `## Art for portrett
Norsk navn: ${species.norwegianName}
Vitenskapelig navn: ${species.scientificNameDisplay || species.scientificName}
Kategori: ${species.category}
${csInfo}

## Prosjektkontext
Observert i nærheten av ${addressStr}, Oslo.

Generer artsportrett-JSON for denne arten med fokus på relevans for bymiljø/grønne tak/grønne arealer i Oslo.`
}
