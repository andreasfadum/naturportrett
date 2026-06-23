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
  'app.kommune': {
    no: 'Oslo kommune',
    en: 'City of Oslo',
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
  'adresse.hele-norge': {
    no: 'Hele Norge',
    en: 'Whole of Norway',
  },
  'adresse.hele-norge.hjelp': {
    no: 'Som standard søker vi kun i Oslo. Skru på for å søke i hele Norge.',
    en: 'By default we search Oslo only. Switch on to search anywhere in Norway.',
  },
  'adresse.influensradius.label': {
    no: 'Influensområde: {radius}',
    en: 'Influence zone: {radius}',
  },
  'adresse.influensradius.hjelp': {
    no: 'Hvor langt fra adressen vi henter arts- og naturdata. Standard 500 m.',
    en: 'How far from the address we retrieve species and nature data. Default 500 m.',
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
  'naturportrett.oversiktskart': {
    no: 'Oversiktskart — {radius} influenssone',
    en: 'Overview map — {radius} influence zone',
  },
  'naturportrett.naturtyper': {
    no: 'Naturtyper i området (innenfor {radius})',
    en: 'Habitat types in the area (within {radius})',
  },
  'naturportrett.arter-hoy-verdi': {
    no: 'Registrerte arter av høy økologisk verdi (innenfor {radius})',
    en: 'Registered species of high ecological value (within {radius})',
  },
  'naturportrett.eiendomskontekst.forklaring': {
    no: 'Resten av portrettet beskriver naturverdier innenfor {radius} fra adressen — ikke alt vi viser ligger på selve tomten.',
    en: 'The rest of the portrait describes nature values within {radius} of the address — not everything shown is on the parcel itself.',
  },
  'naturportrett.kart.legend.adresse': {
    no: 'Prosjektadresse',
    en: 'Project address',
  },
  'naturportrett.kart.legend.sone': {
    no: '{radius} influenssone',
    en: '{radius} influence zone',
  },
  'naturportrett.kart.heatmap-toggle': {
    no: 'Heatmap',
    en: 'Heatmap',
  },
  'naturportrett.kart.heatmap-hjelp': {
    no: 'Vis arts-observasjoner som heatmap-overlay. Mørke flekker = mye registrerte observasjoner.',
    en: 'Show species observations as a heatmap overlay. Dark spots = many recorded observations.',
  },
  'naturportrett.kart.heatmap-laster': {
    no: 'Laster heatmap …',
    en: 'Loading heatmap …',
  },
  'naturportrett.kart.heatmap-feil': {
    no: 'Klarte ikke å laste heatmap-data.',
    en: 'Could not load heatmap data.',
  },

  // --- Tabellhoder (gjenbrukes) ---
  'tabell.naturtype': { no: 'Naturtype', en: 'Habitat type' },
  'tabell.nin-kode': { no: 'NiN-kode', en: 'NiN code' },
  'tabell.rodliste': { no: 'Rødliste', en: 'Red list' },
  'tabell.beskrivelse': { no: 'Beskrivelse', en: 'Description' },
  'tabell.avhengige-arter': { no: 'Avhengige arter', en: 'Dependent species' },
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
  'feedback.takk': { no: 'Takk!', en: 'Thank you!' },
  'feedback.lukk': { no: 'Lukk', en: 'Close' },
  'feedback.gjelder-hele': { no: '— gjelder hele portrettet —', en: '— applies to the whole portrait —' },
  'feedback.epost.placeholder': { no: 'navn@etat.oslo.kommune.no', en: 'name@agency.org' },
  'feedback.aria.send-tilbakemelding': { no: 'Send inn tilbakemelding', en: 'Submit feedback' },
  'feedback.kort-beskrivelse-paakrevd': { no: 'Skriv en kort beskrivelse', en: 'Please write a brief description' },
  'feedback.send-feil-generisk': { no: 'Kunne ikke sende — prøv igjen om litt.', en: 'Could not send — please try again shortly.' },
  'feedback.sender': { no: 'Sender …', en: 'Sending …' },
  'feedback.modal.naturportrettet': { no: 'naturportrettet', en: 'the nature portrait' },
  'feedback.modal.artsportrettet': { no: 'artsportrettet', en: 'the species portrait' },
  'feedback.modal.planteportrettet': { no: 'planteportrettet', en: 'the plant portrait' },
  'feedback.modal.naturtypeportrettet': { no: 'naturtypeportrettet', en: 'the habitat portrait' },
  'feedback.modal.portrettet': { no: 'portrettet', en: 'the portrait' },

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
    no: 'Prototype under utvikling — sist oppdatert {dato}',
    en: 'Prototype under development — last updated {dato}',
  },

  // --- FactBox-labels (Naturportrett-hovedseksjonen) ---
  'fact.prosjektnavn': { no: 'Prosjektnavn', en: 'Project name' },
  'fact.lokasjon': { no: 'Lokasjon', en: 'Location' },
  'fact.antall-verdifulle': { no: 'Antall verdifulle naturområder', en: 'Number of valuable nature areas' },

  // --- Tekstseksjon-titler ---
  'seksjon.okologiske-sammenhenger': { no: 'Økologiske sammenhenger og barrierer', en: 'Ecological connections and barriers' },
  'seksjon.trusler': { no: 'Trusler og fremtidig potensiale', en: 'Threats and future potential' },
  'seksjon.spesielt-viktige': { no: 'Spesielt viktige områder', en: 'Particularly important areas' },
  'seksjon.andre-kilder': { no: 'Andre kilder for informasjon om området', en: 'Other sources of information about the area' },
  'seksjon.naturtyper-feedback': { no: 'Naturtyper', en: 'Habitat types' },
  'seksjon.arter-feedback': { no: 'Arter av høy økologisk verdi', en: 'Species of high ecological value' },
  'seksjon.okologiske-feedback': { no: 'Økologiske sammenhenger', en: 'Ecological connections' },
  'seksjon.trusler-feedback': { no: 'Trusler', en: 'Threats' },
  'seksjon.spesielt-feedback': { no: 'Spesielt viktige områder', en: 'Particularly important areas' },
  'seksjon.forvaltning-feedback': { no: 'Forvaltningsråd', en: 'Management advice' },
  'seksjon.lovgrunnlag-feedback': { no: 'Relevant lovgrunnlag', en: 'Relevant legal basis' },
  'seksjon.datakvalitet-feedback': { no: 'Datakvalitet', en: 'Data quality' },

  // --- Forvaltningsråd ---
  'forvaltning.tittel': { no: 'Forvaltningsråd', en: 'Management advice' },
  'forvaltning.intro': {
    no: 'Konkrete råd til arkitekt, utvikler eller saksbehandler — sortert etter når i prosjektet de bør gjennomføres.',
    en: 'Concrete advice for architects, developers and case officers — sorted by when in the project lifecycle they should be implemented.',
  },
  'forvaltning.umiddelbart': { no: 'Umiddelbart', en: 'Immediately' },
  'forvaltning.1-3-aar': { no: '1–3 år', en: '1–3 years' },
  'forvaltning.langsiktig': { no: 'Langsiktig', en: 'Long-term' },
  'forvaltning.uklar': { no: 'Tidshorisont uklar', en: 'Time horizon unclear' },

  // --- Tiltak (praktiske designtiltak) ---
  'tiltak.tittel': { no: 'Praktiske designtiltak', en: 'Practical design measures' },
  'tiltak.intro': {
    no: 'Hvert tiltak er merket som «Lovstyrt krav» (kan stilles som vilkår i en lovstyrt prosess) eller «Frivillig forbedring» (naturforbedrende tiltak uten lovhjemlet kravgrunnlag).',
    en: 'Each measure is marked as either "Legally mandated requirement" (can be set as a condition in a regulatory process) or "Voluntary improvement" (nature-enhancing measure without a legal basis as requirement).',
  },
  'tiltak.lovstyrt': { no: 'Lovstyrt krav', en: 'Legally mandated requirement' },
  'tiltak.frivillig': { no: 'Frivillig forbedring', en: 'Voluntary improvement' },
  'tiltak.ukategorisert': { no: 'Ukategorisert', en: 'Uncategorised' },
  'tiltak.hjemmel': { no: 'Hjemmel:', en: 'Legal basis:' },
  'tiltak.fase.tidligfase': { no: 'Tidligfase', en: 'Early phase' },
  'tiltak.fase.reguleringsplan': { no: 'Reguleringsplan', en: 'Zoning plan' },
  'tiltak.fase.utomhusplan': { no: 'Utomhusplan', en: 'Outdoor area plan' },
  'tiltak.fase.gjennomforing': { no: 'Gjennomføring', en: 'Implementation' },

  // --- Datakvalitet ---
  'datakvalitet.tittel': { no: 'Datakvalitet per tema', en: 'Data quality per topic' },
  'datakvalitet.intro': {
    no: 'Hvor godt støtter datagrunnlaget det portrettet sier? Vurderingen er gjort av KI på generelt grunnlag og bør sjekkes opp mot fagvurdering.',
    en: 'How well does the underlying data support what the portrait claims? The assessment is made by AI on a general basis and should be cross-checked with expert judgement.',
  },
  'datakvalitet.god': { no: 'God', en: 'Good' },
  'datakvalitet.delvis': { no: 'Delvis', en: 'Partial' },
  'datakvalitet.mangelfull': { no: 'Mangelfull', en: 'Insufficient' },
  'datakvalitet.ukjent': { no: 'Ukjent', en: 'Unknown' },
  'datakvalitet.uten-navn': { no: 'Uten navn', en: 'Unnamed' },
  'datakvalitet.feltarbeid': { no: 'Foreslått feltarbeid:', en: 'Suggested field work:' },

  // --- PortrettMetadata ---
  'metadata.tittel': { no: 'Portrettdata', en: 'Portrait metadata' },
  'metadata.produksjonsdato': { no: 'Produksjonsdato', en: 'Date of generation' },
  'metadata.produksjonsmate': { no: 'Produksjonsmåte', en: 'Generation method' },
  'metadata.produksjonsmate.verdi': {
    no: 'KI uten faglig kvalitetssikring',
    en: 'AI-generated without expert quality assurance',
  },
  'metadata.kilder': { no: 'Kilder', en: 'Sources' },
  'metadata.produsent': { no: 'Produsent', en: 'Producer' },
  'metadata.produsent.verdi': { no: 'Plan- og bygningsetaten, Oslo kommune', en: 'Agency for Planning and Building Services, City of Oslo' },
  'metadata.fagansvar': { no: 'Fagansvar', en: 'Expert responsibility' },
  'metadata.fagansvar.verdi': {
    no: 'Utarbeidet maskinelt — må kvalitetssikres av fagkyndige',
    en: 'Generated automatically — must be quality-assured by domain experts',
  },
  'metadata.kontakt': { no: 'Kontaktopplysninger', en: 'Contact information' },
  'metadata.referanseprosjekt': { no: 'Referanseprosjekt', en: 'Reference project' },
  'metadata.referanseprosjekt.default': {
    no: 'Naturportrett – prototype',
    en: 'Naturportrett – prototype',
  },

  // --- Lovgrunnlag ekstra ---
  'lov.endret': { no: 'Endret:', en: 'Changed:' },

  // --- AreaMap-legend ---
  'kart.mangler-koordinater': {
    no: 'Mangler koordinater for visning av kart.',
    en: 'Missing coordinates for map display.',
  },

  // --- Adresse-forslag ---
  'adresse.ingen-treff-for': { no: 'Ingen adresser funnet for «{query}»', en: 'No addresses found for "{query}"' },

  // --- Influenssone-info ---
  'influens.intro': {
    no: 'Søker innenfor {radius} m fra',
    en: 'Searching within {radius} m of',
  },

  // --- Naturportrett-seksjon (knapper + status) ---
  'nps.last-portrett': { no: 'Lager naturportrett …', en: 'Generating nature portrait …' },
  'nps.ny-adresse': { no: '← Ny adresse', en: '← New address' },
  'nps.detalj': { no: 'Lag mer detaljert portrett →', en: 'Generate a more detailed portrait →' },
  'nps.feil-label': { no: 'Feil:', en: 'Error:' },

  // --- Portretttype-velger ---
  'velger.tittel': { no: 'Velg portrettype', en: 'Select portrait type' },
  'velger.intro': {
    no: 'Et naturportrett kan utdypes med tre typer detaljportretter. Velg hva du ønsker å fordype deg i.',
    en: 'A nature portrait can be expanded with three types of detailed portraits. Choose which one you want to explore in depth.',
  },
  'velger.naturtype.tittel': { no: 'Naturtypeportrett', en: 'Habitat portrait' },
  'velger.naturtype.beskrivelse': {
    no: 'Detaljert portrett av en konkret naturtype basert på NiN-klassifikasjon (T35 park og bymark, T4 nakent berg osv).',
    en: 'A detailed portrait of a specific habitat type based on the NiN classification (T35 park, T4 bare rock, etc.).',
  },
  'velger.arts.tittel': { no: 'Artsportrett', en: 'Species portrait' },
  'velger.arts.beskrivelse': {
    no: 'Detaljert portrett av en konkret dyreart (fugl, pattedyr, insekt) med fokus på relevans for bymiljø og grønne arealer.',
    en: 'A detailed portrait of a specific animal species (bird, mammal, insect) with focus on relevance for urban environments and green areas.',
  },
  'velger.plante.tittel': { no: 'Planteportrett', en: 'Plant portrait' },
  'velger.plante.beskrivelse': {
    no: 'Detaljert portrett av en konkret plante med fokus på relevans for bymiljø, grønne tak og grønne arealer.',
    en: 'A detailed portrait of a specific plant with focus on relevance for urban environments, green roofs and green areas.',
  },
  'velger.tilbake': { no: '← Tilbake til naturportrett', en: '← Back to nature portrait' },

  // --- Arts-/Subjekt-valg ---
  'arter.tittel': { no: 'Natur og arter i nærområdet', en: 'Nature and species in the area' },
  'arter.soker': { no: 'Søker etter arter innenfor 500 m...', en: 'Searching for species within 500 m...' },
  'arter.funnet': {
    no: '{antall} arter funnet · Velg naturtypene og artene du vil ha portretter for',
    en: '{antall} species found · Select the habitats and species you want portraits for',
  },
  'arter.ingen-funnet': { no: 'Ingen artsregistreringer funnet i dette området.', en: 'No species registrations found in this area.' },
  'arter.ingen-i-kategori': { no: 'Ingen arter i denne kategorien.', en: 'No species in this category.' },
  'arter.ny-adresse': { no: '← Ny adresse', en: '← New address' },
  'arter.generer': { no: 'Generer faglig vurdering ({antall})', en: 'Generate professional assessment ({antall})' },
  'arter.minst-en': { no: 'Velg minst én art for å gå videre', en: 'Select at least one species to continue' },

  // --- ConservationStatusBadge ---
  'rodliste.tittel': { no: 'Rødliste status', en: 'Red list status' },

  // --- Arts-oppsummering under arts-tabellen ---
  'arter.oppsummering.kort': {
    no: 'Av {antallTotalt} registrerte arter i området ble de {antallTilKI} med høyest datakvalitet (nyligste observasjoner, peer-verifiserte registreringer) sendt til KI-syntese. KI vurderte {antallIPortrett} av dem til å ha høy økologisk verdi for prosjektet.',
    en: 'Of {antallTotalt} registered species in the area, the {antallTilKI} with the highest data quality (most recent observations, peer-verified records) were sent to AI synthesis. The AI judged {antallIPortrett} of these to have high ecological value for the project.',
  },
  'arter.oppsummering.fordeling': {
    no: 'Fordeling alle arter:',
    en: 'Distribution across all species:',
  },
  'arter.tabell.datakvalitet': { no: 'Datakvalitet', en: 'Data quality' },
  'arter.datakvalitet.hoy': { no: 'Høy', en: 'High' },
  'arter.datakvalitet.middels': { no: 'Middels', en: 'Medium' },
  'arter.datakvalitet.lav': { no: 'Lav', en: 'Low' },
  'arter.datakvalitet.ukjent': { no: 'Ukjent', en: 'Unknown' },
  'arter.datakvalitet.ingen-dato': { no: 'Ingen dato', en: 'No date' },
  'arter.kategori.alle': { no: 'Alle', en: 'All' },
  'arter.kategori.intro': {
    no: 'Filtrer på artskategori — tabellen viser mange arter:',
    en: 'Filter by species category — the table has many entries:',
  },

  // --- DetailPortraitSection (subjekt-velger og loading) ---
  'detalj.artsportrett.tittel': { no: 'Artsportrett', en: 'Species portrait' },
  'detalj.planteportrett.tittel': { no: 'Planteportrett', en: 'Plant portrait' },
  'detalj.naturtypeportrett.tittel': { no: 'Naturtypeportrett', en: 'Habitat portrait' },
  'detalj.artsportrett.velg': { no: 'Velg en art', en: 'Select a species' },
  'detalj.planteportrett.velg': { no: 'Velg en plante', en: 'Select a plant' },
  'detalj.naturtypeportrett.velg': { no: 'Velg en naturtype', en: 'Select a habitat type' },
  'detalj.velg-instruksjon': { no: '{velg} for å generere et detaljert portrett.', en: '{velg} to generate a detailed portrait.' },
  'detalj.artsportrett.tom': { no: 'Ingen dyrearter i resultatene for denne adressen.', en: 'No animal species in the results for this address.' },
  'detalj.planteportrett.tom': { no: 'Ingen planter i resultatene for denne adressen.', en: 'No plants in the results for this address.' },
  'detalj.naturtypeportrett.tom': { no: 'Ingen naturtyper foreslått ennå.', en: 'No habitat types proposed yet.' },
  'detalj.lager-for': { no: 'Lager {tittel} for', en: 'Generating {tittel} for' },
  'detalj.last.steg1': { no: 'Henter informasjon …', en: 'Retrieving information …' },
  'detalj.last.steg2': { no: 'Beskriver egenskaper og levevis …', en: 'Describing traits and ecology …' },
  'detalj.last.steg3': { no: 'Skriver portrettet …', en: 'Writing the portrait …' },
  'detalj.last.steg4': { no: 'Setter sammen sluttresultatet …', en: 'Assembling the final result …' },
  'detalj.last.steg5': { no: 'Gjør portrettet klart for visning …', en: 'Preparing the portrait for display …' },
  'detalj.knapp.velg-annet': { no: '← Velg annet subjekt', en: '← Choose another subject' },
  'detalj.knapp.annen-type': { no: 'Velg annen portrettype', en: 'Choose another portrait type' },
  'detalj.knapp.ny-adresse': { no: 'Ny adresse', en: 'New address' },
  'detalj.knapp.prov-annet': { no: 'Prøv et annet subjekt', en: 'Try another subject' },
  'detalj.knapp.tilbake': { no: '← Tilbake', en: '← Back' },
  'detalj.feil-label': { no: 'Feil:', en: 'Error:' },
  'detalj.nin-prefix': { no: 'NiN:', en: 'NiN:' },

  // --- Subject-picker filter + forklaringer ---
  'detalj.filter.status.label': { no: 'Verne-status', en: 'Conservation status' },
  'detalj.filter.status.alle': { no: 'Alle', en: 'All' },
  'detalj.filter.status.rodliste': { no: 'Rødlistet', en: 'Red-listed' },
  'detalj.filter.status.svarteliste': { no: 'Svartelistet', en: 'Invasive (alien)' },
  'detalj.filter.status.ingen': { no: 'Ikke vurdert', en: 'Not assessed' },
  'detalj.filter.kvalitet.label': { no: 'Datakvalitet', en: 'Data quality' },
  'detalj.filter.kvalitet.alle': { no: 'Alle', en: 'All' },
  'detalj.filter.kvalitet.hoy': { no: 'Høy', en: 'High' },
  'detalj.filter.kvalitet.mid': { no: 'Middels', en: 'Medium' },
  'detalj.filter.kvalitet.lav': { no: 'Lav', en: 'Low' },
  'detalj.filter.ingen-treff': {
    no: 'Ingen arter matcher valgte filtre. Slipp opp ett av filtrene eller velg en annen kategori.',
    en: 'No species match the selected filters. Loosen one of the filters or pick another category.',
  },

  // --- Forkortelse-forklaring ---
  'detalj.forkort.tittel': { no: 'Forklaring av forkortelser', en: 'Code abbreviations' },
  'detalj.forkort.tekst': {
    no: 'Rødliste (Norge 2021): LC = Livskraftig · NT = Nær truet · VU = Sårbar · EN = Sterkt truet · CR = Kritisk truet. Fremmedartsliste (2023): SE = Svært høy økologisk risiko · HI = Høy risiko · PH = Potensielt høy risiko · LO = Lav risiko · NK = Ingen kjent risiko · NR = Ikke risikovurdert.',
    en: 'Red List (Norway 2021): LC = Least Concern · NT = Near Threatened · VU = Vulnerable · EN = Endangered · CR = Critically Endangered. Alien Species List (2023): SE = Severe ecological impact · HI = High impact · PH = Potentially high impact · LO = Low impact · NK = No known impact · NR = Not risk-assessed.',
  },

  // --- Bekreftelses-modal ---
  'bekreft.tittel': {
    no: 'Generér {portretttype}?',
    en: 'Generate {portretttype}?',
  },
  'bekreft.intro': {
    no: 'Portrettet bygges fra åpne datakilder og KI-syntese. Det tar ca. 20 sekunder.',
    en: 'The portrait is built from open data sources and AI synthesis. It takes about 20 seconds.',
  },
  'bekreft.gener': { no: 'Generér portrett', en: 'Generate portrait' },
  'bekreft.aria.lukk': { no: 'Lukk', en: 'Close' },

  // --- Næringskilde-tabeller: nye kolonner + syntese ---
  'naering.kol.lokal-forekomst': { no: 'Lokal forekomst', en: 'Local occurrence' },
  'naering.kol.handling-eiendom': { no: 'Handling på eiendommen', en: 'Action on the property' },
  'naering.syntese.tittel': { no: 'Oppsummering', en: 'Summary' },

  // --- Symbioser-seksjon ---
  'symbioser.tittel': { no: 'Symbioser og økologiske avhengigheter', en: 'Symbioses and ecological dependencies' },
  'symbioser.intro': {
    no: 'Dokumenterte gjensidige avhengigheter mellom arten og andre arter, ikke generelle økosystem-koblinger. Tom liste betyr at KI ikke fant artsspesifikke, dokumenterte koblinger med tilstrekkelig belegg.',
    en: 'Documented mutual dependencies between this species and others — not general ecosystem links. An empty list means the AI could not find species-specific, sufficiently documented connections.',
  },
  'symbioser.tom': {
    no: 'Ingen artsspesifikke symbioser med tilstrekkelig dokumentasjon å vise. Generelle økosystem-koblinger er bevisst utelatt.',
    en: 'No species-specific symbioses with sufficient documentation to show. Generic ecosystem links are deliberately omitted.',
  },
  'symbioser.type.mutualisme': { no: 'Mutualisme', en: 'Mutualism' },
  'symbioser.type.kommensalisme': { no: 'Kommensalisme', en: 'Commensalism' },
  'symbioser.type.predator-bytte': { no: 'Predator–bytte', en: 'Predator–prey' },
  'symbioser.type.parasittisme': { no: 'Parasittisme', en: 'Parasitism' },
  'symbioser.type.konkurranse': { no: 'Konkurranse', en: 'Competition' },
  'symbioser.type.indikator-relasjon': { no: 'Indikator-relasjon', en: 'Indicator relationship' },
  'symbioser.lokal-relevans': { no: 'Lokal relevans:', en: 'Local relevance:' },
  'symbioser.evidensgrunnlag': { no: 'Evidensgrunnlag:', en: 'Evidence basis:' },

  // --- Felles delseksjonsoverskrifter for Arts-/Plante-/Naturtypeportrett ---
  'portrett.karakteristikker': { no: 'Karakteristikker', en: 'Characteristics' },
  'portrett.artsfamilie': { no: 'Artsfamilie', en: 'Species family' },
  'portrett.utbredelse': { no: 'Utbredelse', en: 'Distribution' },
  'portrett.lokaliteter-prosjekt': { no: 'Lokaliteter ved prosjektområde', en: 'Locations near the project area' },
  'portrett.beskrivelse': { no: 'Beskrivelse', en: 'Description' },
  'portrett.storrelse': { no: 'Størrelse', en: 'Size' },
  'portrett.farger': { no: 'Farger', en: 'Colours' },
  'portrett.hannkjonn': { no: 'Hannkjønn', en: 'Male' },
  'portrett.hunnkjonn': { no: 'Hunnkjønn', en: 'Female' },
  'portrett.foretrukne-habitater': { no: 'Foretrukne habitater', en: 'Preferred habitats' },
  'portrett.foretrukne-naturtyper': { no: 'Foretrukne naturtyper', en: 'Preferred habitat types' },
  'portrett.aarssyklus': { no: 'Årssyklus', en: 'Annual cycle' },
  'portrett.avl-oppvekst': { no: 'Avl og oppvekst', en: 'Breeding and rearing' },
  'portrett.voksen': { no: 'Voksen', en: 'Adult' },
  'portrett.overvintring': { no: 'Overvintring', en: 'Overwintering' },
  'portrett.plantebaserte': { no: 'Plantebaserte næringskilder', en: 'Plant-based food sources' },
  'portrett.habitatstottende-planter': { no: 'Habitatstøttende planter', en: 'Habitat-supporting plants' },
  'portrett.dyrebaserte': { no: 'Dyrebaserte næringskilder', en: 'Animal-based food sources' },
  'portrett.art-plantetype': { no: 'Art/plantetype', en: 'Species/plant type' },
  'portrett.art-dyretype': { no: 'Art/dyretype', en: 'Species/animal type' },
  'portrett.detaljer': { no: 'Detaljer', en: 'Details' },
  'portrett.trusler-predatorer': { no: 'Trusler og predatorer', en: 'Threats and predators' },
  'portrett.samspill-mennesker': { no: 'Samspill med mennesker', en: 'Human interactions' },
  'portrett.nokkelart': { no: 'Nøkkelart', en: 'Keystone species' },
  'portrett.hoy-okologisk-verdi': { no: 'Art av høy økologisk verdi', en: 'Species of high ecological value' },
  'portrett.ansvarsart': { no: 'Ansvarsart', en: 'Species of national responsibility' },
  'portrett.nasjonal-forvaltning': { no: 'Art av nasjonal forvaltningsinteresse', en: 'Species of national management interest' },
  'portrett.atferdsprofil': { no: 'Atferdsprofil', en: 'Behavioural profile' },
  'portrett.parringsatferd': { no: 'Parringsatferd, avl og oppvekst', en: 'Mating behaviour, breeding and rearing' },
  'portrett.romlige-overvintring': { no: 'Romlige forhold og overvintring', en: 'Spatial conditions and overwintering' },
  'portrett.lenke-mediafil': { no: 'Lenke til bilde/lyd', en: 'Link to image/audio' },
  'portrett.kommentarer': { no: 'Kommentarer', en: 'Comments' },

  // Naturtypeportrett-spesifikt
  'portrett.utseende': { no: 'Utseende', en: 'Appearance' },
  'portrett.struktur': { no: 'Struktur', en: 'Structure' },
  'portrett.okologisk-saerpreg': { no: 'Økologisk særpreg', en: 'Ecological distinctiveness' },
  'portrett.viktige-elementer': { no: 'Viktige elementer', en: 'Important elements' },
  'portrett.viktige-strukturer': { no: 'Viktige strukturer/elementer', en: 'Important structures and elements' },
  'portrett.vegetasjon': { no: 'Vegetasjon', en: 'Vegetation' },
  'portrett.hydrologi': { no: 'Hydrologi', en: 'Hydrology' },
  'portrett.substrat': { no: 'Substrat', en: 'Substrate' },
  'portrett.topografi': { no: 'Topografi', en: 'Topography' },
  'portrett.okologiske-forhold': { no: 'Økologiske forhold', en: 'Ecological conditions' },
  'portrett.typiske-arter': { no: 'Typiske arter:', en: 'Typical species:' },
  'portrett.nokkelarter': { no: 'Nøkkelarter:', en: 'Keystone species:' },
  'portrett.naturtypefunksjoner': { no: 'Naturtypefunksjoner:', en: 'Habitat functions:' },
  'portrett.naturlig-dynamikk': { no: 'Naturlig dynamikk:', en: 'Natural dynamics:' },
  'portrett.hjemmehorende-tak': { no: 'Hjemmehørende arter relevant for grønne tak', en: 'Native species relevant for green roofs' },
  'portrett.tidsaspekter': { no: 'Tidsaspekter', en: 'Temporal aspects' },
  'portrett.aarstidsvariasjon': { no: 'Årstidsvariasjon:', en: 'Seasonal variation:' },
  'portrett.forstyrrelsesregime': { no: 'Forstyrrelsesregime:', en: 'Disturbance regime:' },
  'portrett.paavirkningsfaktorer': { no: 'Påvirkningsfaktorer og trusler', en: 'Impact factors and threats' },
  'portrett.naturlige-trusler': { no: 'Naturlige trusler:', en: 'Natural threats:' },
  'portrett.menneskeskapte-trusler': { no: 'Menneskeskapte trusler:', en: 'Human-induced threats:' },
  'portrett.kulturell-verdi': { no: 'Kulturell verdi / historisk bruk:', en: 'Cultural value / historical use:' },
  'portrett.friluftsliv': { no: 'Friluftsliv:', en: 'Outdoor recreation:' },
  'portrett.konflikter': { no: 'Konflikter / utfordringer:', en: 'Conflicts / challenges:' },

  // Planteportrett-spesifikt
  'portrett.plantetype': { no: 'Plantetype', en: 'Plant type' },
  'portrett.vekstform': { no: 'Vekstform', en: 'Growth form' },
  'portrett.blomstringstid': { no: 'Blomstringstid', en: 'Flowering period' },
  'portrett.blomstring': { no: 'Blomstring', en: 'Flowering' },
  'portrett.habitatkrav': { no: 'Habitatkrav', en: 'Habitat requirements' },
  'portrett.krav': { no: 'Krav', en: 'Requirement' },
  'portrett.fuktighet': { no: 'Fuktighet', en: 'Moisture' },
  'portrett.klimasone': { no: 'Klimasone', en: 'Climate zone' },
  'portrett.hardforhet': { no: 'Hardførhet', en: 'Hardiness' },
  'portrett.lysforhold': { no: 'Lysforhold', en: 'Light conditions' },
  'portrett.vindtoleranse': { no: 'Vindtoleranse', en: 'Wind tolerance' },
  'portrett.jord': { no: 'Jordtype og dybde', en: 'Soil type and depth' },
  'portrett.ph': { no: 'pH', en: 'pH' },
  'portrett.spredning': { no: 'Spredning og livssyklus', en: 'Dispersal and life cycle' },
  'portrett.frospredning': { no: 'Frøspredning', en: 'Seed dispersal' },
  'portrett.etablering': { no: 'Etableringsvilkår', en: 'Establishment conditions' },
  'portrett.levetid': { no: 'Levetid', en: 'Lifespan' },
  'portrett.overvintringsevne': { no: 'Overvintringsevne', en: 'Overwintering ability' },
  'portrett.tilknyttede-arter': { no: 'Tilknyttede arter', en: 'Associated species' },
  'portrett.arter': { no: 'Arter', en: 'Species' },
  'portrett.trusler': { no: 'Trusler', en: 'Threats' },
  'portrett.pollinator-verdi': { no: 'Pollinator-verdi', en: 'Pollinator value' },
  'portrett.kvalitet': { no: 'Kvalitet', en: 'Quality' },
  'portrett.erfaringsgrunnlag': { no: 'Erfaringsgrunnlag i Norge', en: 'Experience base in Norway' },
  'portrett.samplanting': { no: 'Anbefalt samplanting', en: 'Recommended companion planting' },
  'portrett.vedlikehold': { no: 'Vedlikeholdsbehov', en: 'Maintenance needs' },
  'portrett.saerskilte-hensyn': { no: 'Særskilte hensyn', en: 'Special considerations' },
}
