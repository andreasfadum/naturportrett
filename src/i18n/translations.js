/**
 * Norske og engelske UI-strenger for Naturportrett.
 *
 * REDIGERINGS-GUIDE:
 * - Hver `nokkel: { no: '...', en: '...' }` er én UI-streng.
 * - Strengene under `en` er førsteutkast — Andreas Haugstad (PBE) eier
 *   korrektur og kan oppdatere fritt. Når du redigerer engelsk, beholder
 *   du eksisterende plassholdere som {antall}, {sted}, {avstand} etc.
 *   slik at hooken kan interpolere riktig.
 * - Hvis en streng mangler engelsk versjon (kun `no`-felt), faller
 *   visningen tilbake til norsk.
 *
 * Promptene mot Claude (i `server/prompts/`) er IKKE oversatt ennå —
 * KI-genererte felt forblir norske inntil videre. Dette er bevisst:
 * lovgrunnlaget vi indekserer er på norsk, og en oversatt KI ville
 * måtte oversette lov-sitater hver gang, noe som skader presisjon.
 */

export const SPRAK = {
  no: { kode: 'no', flag: '🇳🇴', navn: 'Norsk' },
  en: { kode: 'en', flag: '🇬🇧', navn: 'English' },
}

export const DEFAULT_SPRAK = 'no'

export const oversettelser = {
  // --- Navigasjon / topp ---
  'app.tittel': {
    no: 'Naturportrett',
    en: 'Naturportrett',
  },
  'app.undertittel': {
    no: 'Biologisk mangfold i influensområdet',
    en: 'Biodiversity in the project influence zone',
  },
  'sprak.bytt': {
    no: 'Bytt språk',
    en: 'Switch language',
  },

  // --- Adressesøk ---
  'adresse.placeholder': {
    no: 'Eks. Storgata 10 eller Karl Johans gate',
    en: 'E.g. Storgata 10 or Karl Johans gate',
  },
  'adresse.label': {
    no: 'Adresse',
    en: 'Address',
  },
  'adresse.hjelpetekst': {
    no: 'Søk adresser i hele Norge. Verktøyet har rikest kontekst for Oslo, der vi har kuratert lokal grønnstruktur og forvaltningsdata.',
    en: 'Search any Norwegian address. The tool provides the richest context for Oslo, where we have curated local green-structure data and planning sources.',
  },
  'adresse.ingen-treff': {
    no: 'Ingen adresser funnet',
    en: 'No addresses found',
  },
  'adresse.søker': {
    no: 'Søker …',
    en: 'Searching …',
  },
  'adresse.knapp-sok': {
    no: 'Søk etter arter',
    en: 'Search for species',
  },
  'adresse.overskrift': {
    no: 'Finn natur og arter i nærområdet',
    en: 'Find nature and species in the area',
  },
  'adresse.beskrivelse': {
    no: 'Skriv inn adressen til eiendommen du arbeider med. Systemet finner alle registrerte arter innenfor 500 meters influensområde.',
    en: 'Enter the address of the property you are working on. The system retrieves all registered species within a 500-metre influence zone.',
  },

  // --- "Om tjenesten"-boks ---
  'om-tjenesten.tittel': {
    no: 'Om tjenesten',
    en: 'About the service',
  },
  'om-tjenesten.utviklet-av': {
    no: 'Tjenesten er utviklet av Oslo kommune.',
    en: 'The service is developed by the City of Oslo.',
  },
  'om-tjenesten.bruk': {
    no: 'Tjenesten oppretter natur- og artsportretter som kan brukes i design og formgiving av grønne ute-/takarealer.',
    en: 'The service generates nature and species portraits intended to inform the design of green outdoor areas and roofs.',
  },
  'om-tjenesten.kilder-intro': {
    no: 'Tjenesten henter og sammenstiller informasjon fra følgende kilder:',
    en: 'The service retrieves and synthesises information from the following sources:',
  },
  'om-tjenesten.kilde.gbif': {
    no: 'GBIF — Global Biodiversity Information Facility (primær artsdata)',
    en: 'GBIF — Global Biodiversity Information Facility (primary species data)',
  },
  'om-tjenesten.kilde.inaturalist': {
    no: 'iNaturalist (artsobservasjoner, foto og norske navn)',
    en: 'iNaturalist (species observations, photos and Norwegian common names)',
  },
  'om-tjenesten.kilde.artsdatabanken': {
    no: 'Artsdatabanken (Rødlista 2021, Fremmedartslista 2023)',
    en: 'Norwegian Biodiversity Information Centre (Red List 2021, Alien Species List 2023)',
  },
  'om-tjenesten.kilde.kartverket': {
    no: 'Kartverket (norske adresser)',
    en: 'Norwegian Mapping Authority (Norwegian addresses)',
  },
  'om-tjenesten.kilde.lover': {
    no: 'Naturmangfoldloven, plan- og bygningsloven, friluftsloven, forvaltningsloven og SAK10 — paragrafer siteres ordrett fra Lovdata, ikke tolket',
    en: 'Norwegian Nature Diversity Act, Planning and Building Act, Outdoor Recreation Act, Public Administration Act, and the Building Regulations (SAK10) — paragraphs are quoted verbatim from Lovdata, not interpreted',
  },
  'om-tjenesten.kilde.naturstrategi': {
    no: 'Oslo kommunes Naturmangfoldstrategi 2030',
    en: 'The City of Oslo Biodiversity Strategy 2030',
  },
  'om-tjenesten.metode': {
    no: 'Sammenstillingene er basert på fastsatte instrukser og bruk av kunstig intelligens.',
    en: 'The syntheses are produced from fixed prompts using artificial intelligence.',
  },
  'om-tjenesten.disclaimer': {
    no: 'Portrettene av natur og arter må kvalitetssikres av fagkyndige.',
    en: 'The nature and species portraits must be quality-assured by domain experts.',
  },

  // --- Generelle knapper ---
  'knapp.fortsett': {
    no: 'Fortsett',
    en: 'Continue',
  },
  'knapp.tilbake': {
    no: 'Tilbake',
    en: 'Back',
  },
  'knapp.ny-adresse': {
    no: 'Ny adresse',
    en: 'New address',
  },
  'knapp.last-ned-pdf': {
    no: 'Last ned som PDF',
    en: 'Download as PDF',
  },
  'knapp.velg-annet-subjekt': {
    no: 'Velg annet subjekt',
    en: 'Choose another subject',
  },
  'knapp.velg-annen-portrettype': {
    no: 'Velg annen portrettype',
    en: 'Choose another portrait type',
  },
  'knapp.lag-mer-detaljert-portrett': {
    no: 'Lag mer detaljert portrett',
    en: 'Generate a more detailed portrait',
  },
  'knapp.avbryt': {
    no: 'Avbryt',
    en: 'Cancel',
  },
  'knapp.send': {
    no: 'Send inn',
    en: 'Submit',
  },

  // --- Steg-indikator ---
  'steg.adresse': {
    no: 'Adresse',
    en: 'Address',
  },
  'steg.naturportrett': {
    no: 'Naturportrett',
    en: 'Nature portrait',
  },
  'steg.portrettype': {
    no: 'Portrettype',
    en: 'Portrait type',
  },
  'steg.detaljportrett': {
    no: 'Detaljportrett',
    en: 'Detailed portrait',
  },
  'steg.artsportrett': {
    no: 'Artsportrett',
    en: 'Species portrait',
  },
  'steg.planteportrett': {
    no: 'Planteportrett',
    en: 'Plant portrait',
  },
  'steg.naturtypeportrett': {
    no: 'Naturtypeportrett',
    en: 'Habitat portrait',
  },
  'steg.fremdrift-aria': {
    no: 'Fremdrift',
    en: 'Progress',
  },

  // --- Naturportrett (oversikt) ---
  'naturportrett.tittel': {
    no: 'Naturportrett',
    en: 'Nature portrait',
  },
  'naturportrett.laster': {
    no: 'Lager naturportrett …',
    en: 'Generating nature portrait …',
  },
  'naturportrett.eiendomskontekst.tittel': {
    no: 'Slik knytter dette seg til eiendommen',
    en: 'How this relates to the property',
  },
  'naturportrett.eiendomskontekst.forklaring': {
    no: 'Resten av portrettet beskriver naturverdier innenfor 500 m fra adressen — ikke alt vi viser ligger på selve tomten.',
    en: 'The rest of the portrait describes nature values within 500 m of the address — not everything shown is on the parcel itself.',
  },
  'naturportrett.oversiktskart': {
    no: 'Oversiktskart — 500 m influenssone',
    en: 'Overview map — 500 m influence zone',
  },
  'naturportrett.naturtyper': {
    no: 'Naturtyper i området (innenfor 500 m)',
    en: 'Habitat types in the area (within 500 m)',
  },
  'naturportrett.arter-hoy-verdi': {
    no: 'Registrerte arter av høy økologisk verdi (innenfor 500 m)',
    en: 'Registered species of high ecological value (within 500 m)',
  },
  'naturportrett.kart.legend.adresse': {
    no: 'Prosjektadresse',
    en: 'Project address',
  },
  'naturportrett.kart.legend.sone': {
    no: '500 m influenssone',
    en: '500 m influence zone',
  },

  // --- Tabellhoder (gjenbrukes) ---
  'tabell.naturtype': { no: 'Naturtype', en: 'Habitat type' },
  'tabell.nin-kode': { no: 'NiN-kode', en: 'NiN code' },
  'tabell.rodliste': { no: 'Rødliste', en: 'Red list' },
  'tabell.beskrivelse': { no: 'Beskrivelse', en: 'Description' },
  'tabell.norsk-navn': { no: 'Norsk navn', en: 'Norwegian name' },
  'tabell.vitenskapelig': { no: 'Vitenskapelig', en: 'Scientific name' },
  'tabell.kategori': { no: 'Kategori', en: 'Category' },
  'tabell.status': { no: 'Status', en: 'Status' },

  // --- Banner / disclaimer ---
  'banner.informasjonsbase.tittel': {
    no: 'Informasjonsbase — ikke en endelig vurdering.',
    en: 'Information base — not a final assessment.',
  },
  'banner.informasjonsbase.tekst': {
    no: 'Portrettet er KI-generert fra åpne datakilder for å gi rask oversikt. Det erstatter ikke faglig kvalitetssikring eller feltkartlegging. Sjekk datakvalitets-vurderingene nederst før du bruker innholdet i en sak.',
    en: 'The portrait is AI-generated from open data sources to provide a rapid overview. It does not replace expert quality assurance or field surveys. Check the data quality assessments at the bottom before relying on this content in a case.',
  },

  // --- Lovgrunnlag ---
  'lov.tittel': {
    no: 'Relevant lovgrunnlag',
    en: 'Relevant legal basis',
  },
  'lov.disclaimer': {
    no: 'Lover og paragrafer som har relevans for dette portrettet. Sitater er hentet ordrett fra den arkiverte lovteksten. Naturportrett gir ingen juridisk tolkning — kvalifisert vurdering må gjøres av saksbehandler.',
    en: 'Laws and paragraphs relevant to this portrait. Quotations are taken verbatim from the archived legal text. Naturportrett does not provide legal interpretation — qualified assessment must be made by a case officer.',
  },
  'lov.ukjente-paragrafer': {
    no: 'KI foreslo paragrafer som ikke finnes i lovbasen: §{paragrafer}',
    en: 'The AI suggested paragraphs not found in the legal index: §{paragrafer}',
  },

  // --- Tilbakemelding ---
  'feedback.tittel': {
    no: 'Si fra om feil eller mangler',
    en: 'Report errors or gaps',
  },
  'feedback.intro': {
    no: 'Portrettet er KI-generert og kan ha feil, mangler eller upresise formuleringer. Ditt innspill brukes til å forbedre verktøyet.',
    en: 'This portrait is AI-generated and may contain errors, omissions, or imprecise wording. Your input is used to improve the tool.',
  },
  'feedback.knapp': {
    no: 'Rapportér feil eller foreslå forbedring',
    en: 'Report an error or suggest an improvement',
  },
  'feedback.modal.tittel': {
    no: 'Tilbakemelding på naturportrettet',
    en: 'Feedback on the nature portrait',
  },
  'feedback.type.label': {
    no: 'Hva slags innspill?',
    en: 'What kind of input?',
  },
  'feedback.type.feil_innhold': {
    no: 'Feil i innholdet',
    en: 'Incorrect content',
  },
  'feedback.type.manglende_info': {
    no: 'Noe mangler',
    en: 'Something is missing',
  },
  'feedback.type.hallusinasjon': {
    no: 'KI har funnet på noe',
    en: 'The AI made something up',
  },
  'feedback.type.tekstforslag': {
    no: 'Forslag til formulering',
    en: 'Wording suggestion',
  },
  'feedback.type.annet': {
    no: 'Annet',
    en: 'Other',
  },
  'feedback.seksjon.label': {
    no: 'Hvilken seksjon? (valgfri)',
    en: 'Which section? (optional)',
  },
  'feedback.fritekst.label': {
    no: 'Beskriv hva som er feil eller mangler',
    en: 'Describe what is wrong or missing',
  },
  'feedback.fritekst.placeholder': {
    no: 'F.eks. «Naturtype-listen mangler edelløvskog som faktisk finnes i ravinen sør for tomten.»',
    en: 'E.g. "The habitat list is missing the deciduous forest that actually exists in the ravine south of the parcel."',
  },
  'feedback.epost.label': {
    no: 'E-post (valgfri — hvis du vil høre fra oss)',
    en: 'Email (optional — if you would like a follow-up)',
  },
  'feedback.bekreftelse': {
    no: 'Takk for innspillet! Det er notert.',
    en: 'Thank you for your input — it has been recorded.',
  },
  'feedback.feil': {
    no: 'Beklager, innspillet ble ikke registrert. Prøv igjen.',
    en: 'Sorry, the input was not recorded. Please try again.',
  },

  // --- Footer ---
  'footer.kommune': {
    no: 'Oslo kommune · Plan- og bygningsetaten · Naturportrett prototype 2026',
    en: 'City of Oslo · Agency for Planning and Building Services · Naturportrett prototype 2026',
  },
  'footer.heatmap-lenke': {
    no: 'Heatmap over arts-registreringer i Oslo →',
    en: 'Heatmap of species registrations in Oslo →',
  },
  'footer.heatmap-tilbake': {
    no: '← Tilbake til Naturportrett',
    en: '← Back to Naturportrett',
  },
  'footer.dev-banner': {
    no: 'Testversjon under utvikling — sist oppdatert {dato}',
    en: 'Development version — last updated {dato}',
  },
}
