import { ROLE_INTRO, REFERENCES, JSON_OUTPUT_RULES, RELEVANTE_LOVER_FIELD, RELEVANTE_LOVER_INSTRUKS, DATAKVALITET_FIELD, DATAKVALITET_INSTRUKS, TILTAK_FIELD, TILTAK_INSTRUKS, ANTI_HALLUSINERING, SYMBIOSE_FIELD, SYMBIOSE_INSTRUKS } from './shared.js'

export const SYSTEM_PROMPT = `${ROLE_INTRO}

Du skal generere et NATURTYPEPORTRETT — et detaljert portrett av ÉN konkret naturtype (etter NiN-systemet), strukturert etter Oslo kommunes mal for naturtypeportretter.

${ANTI_HALLUSINERING}

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
  ${SYMBIOSE_FIELD},
  "kommentarer": "Tilleggsinformasjon, særskilte hensyn",
  ${TILTAK_FIELD},
  ${RELEVANTE_LOVER_FIELD},
  ${DATAKVALITET_FIELD}
}

${RELEVANTE_LOVER_INSTRUKS}

${DATAKVALITET_INSTRUKS}

${TILTAK_INSTRUKS}

${SYMBIOSE_INSTRUKS}

For naturtyper: symbioser kan typisk være karakterarter med indikator-relasjon (arter hvis tilstedeværelse signaliserer naturtypens kvalitet), nøkkelarter som bidrar til strukturen, eller mutualistiske artspar som er karakteristiske for naturtypen. Bare ta med koblinger der avhengigheten er artsspesifikk og dokumentert.

For naturtypeportretter skal designtiltakene handle om hvordan ivareta, restaurere eller integrere selve naturtypen i et byggetiltak — ikke om enkeltarter. Eksempler på lovstyrte krav: kantsoneverning mot vassdrag (vannressursloven § 11), hensynssoner i reguleringsplan (pbl § 11-8 / 12-6) for kartlagte verdifulle naturtyper, krav etter forskrift om utvalgte naturtyper (nml § 53) dersom naturtypen er omfattet.

Vær faglig presis og knytt informasjonen tett til Oslos kontekst.`

export function buildUserPrompt({ naturtype, address, observedSpecies, narliggendeGronnstrukturer }) {
  const addressStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  const speciesList = (observedSpecies || []).slice(0, 30)
    .map(sp => `- ${sp.norwegianName} (${sp.scientificNameDisplay || sp.scientificName}) [${sp.category}]`)
    .join('\n')

  const gronnstrukturBlokk = Array.isArray(narliggendeGronnstrukturer) && narliggendeGronnstrukturer.length > 0
    ? `\n\n## Kjente grønnstrukturer i nærheten\nKan brukes for lokalRelevans i symbioser. Ikke finn på andre lokaliteter.\n\n${narliggendeGronnstrukturer.map(g => `- ${g.navn} (${g.type}) — ${g.avstandM} m`).join('\n')}`
    : ''

  return `## Naturtype for portrett
Navn: ${naturtype.navn || naturtype}
${naturtype.ninKode ? `NiN-kode: ${naturtype.ninKode}` : ''}

## Prosjektkontekst
Område nær ${addressStr}.

${speciesList ? `Observerte arter i området (for kontekst, sortert etter datakvalitet):\n${speciesList}` : ''}${gronnstrukturBlokk}

Generer naturtypeportrett-JSON for denne naturtypen med vekt på relevans for bymiljø og grønne arealer. Husk anti-hallusinerings-regelen: utelat heller enn å gjette.`
}
