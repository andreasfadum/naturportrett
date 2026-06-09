import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et NATURTYPEPORTRETT — et detaljert portrett av ÉN konkret naturtype (etter NiN-systemet), strukturert etter Oslo kommunes mal for naturtypeportretter.

${REFERENCES}

${JSON_OUTPUT_RULES}

Returner et JSON-objekt med følgende struktur:

{
  "navn": "Naturtypens norske navn",
  "ninKode": "NiN-kode (f.eks. 'T4-1' for boreal lauvskog)",
  "rodlisteStatus": { "kode": "LC|NT|VU|EN|CR", "label": "Norsk forklaring" },
  "utbredelse": "1-3 setninger om geografisk utbredelse i Norge/Oslo",
  "beskrivelse": {
    "utseende": "Visuell beskrivelse av naturtypen",
    "struktur": "Lagdeling, sjikt, romstruktur",
    "okologiskSaerpreg": "Hva som er økologisk unikt",
    "viktigeElementer": "Karaktertrekkene som definerer naturtypen"
  },
  "viktigeStrukturer": {
    "vegetasjon": "Dominerende vegetasjon",
    "hydrologi": "Vannforhold",
    "substrat": "Jord og berggrunn",
    "topografi": "Helning, høyde, eksponering"
  },
  "okologiskeForhold": {
    "typiskeArter": ["Art 1", "Art 2", "Art 3"],
    "nokkelarter": ["Art 1", "Art 2"],
    "naturtypeFunksjoner": "Økosystemtjenester (pollinering, karbonlagring, flomdemping, friluftsliv)",
    "naturligDynamikk": "Naturlige prosesser (brann, beiting, flom, suksesjon)"
  },
  "hjemmehorendeArterGronneTak": [
    "Art 1 som kan etablere seg på grønne tak",
    "Art 2"
  ],
  "tidsaspekter": {
    "arstidsvariasjon": "Hvordan naturtypen endrer seg over året",
    "forstyrrelsesregime": "Hva holder naturtypen i gang (slått, beite, oversvømmelse)"
  },
  "trussler": {
    "naturlige": "Gjengroing, suksesjon",
    "menneskeskapte": "Arealendringer, nedbygging, forurensing, klimaendringer"
  },
  "samspillMedMennesker": {
    "kulturellVerdi": "Historisk bruk og kulturell betydning",
    "friluftsliv": "Bruk til rekreasjon",
    "konflikter": "Bruk vs. vern"
  },
  "kommentarer": "Tilleggsinformasjon, særskilte hensyn",
  ${RELEVANTE_LOVER_FIELD}
}

${RELEVANTE_LOVER_INSTRUKS}

Vær faglig presis og knytt informasjonen tett til Oslos kontekst.`

export function buildUserPrompt({ naturtype, address, observedSpecies }) {
  const addressStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  const speciesList = (observedSpecies || []).slice(0, 15)
    .map(sp => `- ${sp.norwegianName} (${sp.scientificNameDisplay || sp.scientificName}) [${sp.category}]`)
    .join('\n')

  return `## Naturtype for portrett
Navn: ${naturtype.navn || naturtype}
${naturtype.ninKode ? `NiN-kode: ${naturtype.ninKode}` : ''}

## Prosjektkontext
Område nær ${addressStr}, Oslo.

${speciesList ? `Observerte arter i området (for kontekst):\n${speciesList}` : ''}

Generer naturtypeportrett-JSON for denne naturtypen med vekt på relevans for bymiljø og grønne arealer i Oslo.`
}
