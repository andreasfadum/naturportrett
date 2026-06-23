import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS, DATAKVALITET_FIELD, DATAKVALITET_INSTRUKS, TILTAK_FIELD, TILTAK_INSTRUKS, ANTI_HALLUSINERING, SYMBIOSE_FIELD, SYMBIOSE_INSTRUKS, AVSTAND_INSTRUKS, formatAvstandKm } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et ARTSPORTRETT — et detaljert kortportrett for ÉN konkret dyreart (fugl, pattedyr, insekt, etc.), strukturert etter Oslo kommunes mal for artsportretter.

${ANTI_HALLUSINERING}

${AVSTAND_INSTRUKS}

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
    {
      "art": "Plantenavn",
      "detaljer": "Kort beskrivelse av hva som spises",
      "lokalForekomst": "1 setning: finnes/mangler hvor i influenssonen, basert på grønnstruktur-listen og arts-pipelinen — eller 'ikke kjent fra lokale registreringer'",
      "handlingPaaEiendommen": "1 setning: bevare X / styrke Y / introdusere Z, eller 'ingen konkret handling foreslås her'"
    }
  ],
  "plantebaserteSyntese": "2-3 setninger oppsummering — hvilke næringskilder finnes lokalt, hva må prioriteres ved drift/forvaltning av eiendommen",
  "habitatStottendePlanter": [
    {
      "art": "Plantenavn",
      "detaljer": "Hva planten gir (skjul/hekking/bær)",
      "lokalForekomst": "1 setning: finnes/mangler hvor i influenssonen",
      "handlingPaaEiendommen": "1 setning: bevare / styrke / introdusere"
    }
  ],
  "habitatStottendeSyntese": "2-3 setninger oppsummering",
  "dyrebasertNaeringskilder": [
    {
      "art": "Dyretype",
      "detaljer": "Kort beskrivelse",
      "lokalForekomst": "1 setning: finnes/mangler hvor",
      "handlingPaaEiendommen": "1 setning"
    }
  ],
  "dyrebasertSyntese": "2-3 setninger oppsummering",
  "trusslerOgPredatorer": "2-4 setninger om trusler",
  "samspillMedMennesker": "1-3 setninger om hvordan arten samhandler med mennesker",
  ${SYMBIOSE_FIELD},
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
  ${TILTAK_FIELD},
  "kommentarer": "Tilleggsinformasjon: parasitter, bevaring, interaksjoner, rolle i økosystemet",
  ${RELEVANTE_LOVER_FIELD},
  ${DATAKVALITET_FIELD}
}

${RELEVANTE_LOVER_INSTRUKS}

${DATAKVALITET_INSTRUKS}

${TILTAK_INSTRUKS}

${SYMBIOSE_INSTRUKS}

LOKAL FOREKOMST OG HANDLING:
For lokalForekomst-feltene i de tre næringskilde-tabellene: bruk listen "Observerte arter i området" og "Kjente grønnstrukturer" som user-prompten gir deg — IKKE finn på lokaliteter. Hvis du ikke kan koble en næringskilde til konkret lokal forekomst, skriv "ikke kjent fra lokale registreringer". For handlingPaaEiendommen: forutsatt en mer eller mindre utbygd eiendom — hva bør bevares hvis det finnes, eventuelt styrkes/introduseres. Ikke prosa-overflod.

Vær konkret med tall og avstander. Inkluder praktiske mål (f.eks. 'fuglekasse 12×12 cm', 'hekkelokalitet til mat: <100 m').`

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
    ? `

## Observerte arter i området (fra iNaturalist og GBIF, sortert etter datakvalitet)
Denne listen er reell og kan brukes til å vurdere lokal forekomst. Hvis en næringskilde matcher en av disse — si det. Hvis ikke, skriv "ikke kjent fra lokale registreringer".

${observedSpecies.slice(0, 30).map(sp => `- ${sp.norwegianName} (${sp.scientificNameDisplay || sp.scientificName}) [${sp.category}]`).join('\n')}`
    : ''

  const gronnstrukturBlokk = Array.isArray(narliggendeGronnstrukturer) && narliggendeGronnstrukturer.length > 0
    ? `

## Kjente Oslo-grønnstrukturer i nærheten (sortert etter avstand)
Du kan referere til disse ved navn for lokalForekomst-feltene. Ikke finn på andre lokaliteter.

${narliggendeGronnstrukturer.map(g => `- ${g.navn} (${g.type}) — ${formatAvstandKm(g.avstandM)}`).join('\n')}`
    : ''

  return `## Art for portrett
Norsk navn: ${species.norwegianName}
Vitenskapelig navn: ${species.scientificNameDisplay || species.scientificName}
Kategori: ${species.category}
${csInfo}

## Prosjektkontekst
Observert i nærheten av ${addressStr}.${observerteBlokk}${gronnstrukturBlokk}

Generer artsportrett-JSON for denne arten med fokus på relevans for bymiljø/grønne tak/grønne arealer. Husk anti-hallusinerings-regelen: utelat heller enn å gjette.`
}
