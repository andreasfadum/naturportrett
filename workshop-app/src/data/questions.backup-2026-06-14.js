// FROSSEN BACKUP — 14. juni 2026, kjent fungerende versjon av spørreskjemaet før eventuelle
// transkripsjon-drevne spissinger. Importeres ikke noe sted; eksisterer kun som plan B.
// For å rulle tilbake: kopier innholdet i denne fila inn i questions.js og redeploy.
//
// Spørsmål. Kilde: workshop/10-skjema-generering-FINAL.md (Del A) + demoen.

export const ETATER = [
  'Bymiljøetaten', 'Eiendoms- og byfornyelsesetaten', 'Oslobygg KF',
  'Klimaetaten', 'Plan- og bygningsetaten', 'Annet'
]

export const STILLINGER = {
  'naturforvalter-biolog': 'Naturforvalter / biolog',
  'landskapsarkitekt-plankonsulent': 'Landskapsarkitekt / plankonsulent',
  'eiendomsutvikler-prosjektleder': 'Eiendomsutvikler / prosjektleder',
  'byggherre-prosjekterende': 'Byggherre / prosjekterende',
  'saksbehandler-planradgiver': 'Saksbehandler / planrådgiver',
  'radgiver': 'Rådgiver',
  'annet': 'Annet'
}

export const GENERAL = [
  { id: 'g1', type: 'rank', label: 'Hvilke portretttyper bør utvikles først?', hint: 'Velg inntil 3.',
    options: ['Naturportrett (område)', 'Artsportrett (enkeltart)', 'Artsgruppeportrett (fugler/insekter/planter)', 'Naturtypeportrett', 'Rødlisteportrett', 'Fremmedartsportrett', 'Naturvernportrett'] },
  { id: 'g2a', type: 'likert', label: 'Hvor mye ville et naturportrett hevet kvaliteten og effektiviteten i naturutredninger du kjenner til?' },
  { id: 'g2b', type: 'text', label: 'Hva ville det konkret spart deg for eller forbedret? (valgfritt)' },
  { id: 'g3a', type: 'likert', label: 'Portrettet kan foreslå natur-/plantekonsepter og tiltak som inspirasjon — et startpunkt du selv vurderer og bygger videre på, ikke normative anbefalinger tjenesten går god for. Hvor nyttig ville slike inspirasjonsforslag være?', hint: 'Inspirasjon = forslag du selv vurderer og bearbeider. Normativ anbefaling = et «gjør X»-råd tjenesten står inne for — det gir den bevisst ikke.' },
  { id: 'g3b', type: 'text', label: 'I hvilke situasjoner ville slike inspirasjonsforslag hjulpet deg mest? (valgfritt)' },
  { id: 'g4', type: 'rank', label: 'Hva er viktigst at den første versjonen inneholder?', hint: 'Velg inntil 3.',
    options: ['Kartlagte arter', 'Rødlistearter', 'Naturtyper', 'Fremmede arter', 'Økologiske funksjoner/sammenhenger', 'Forvaltningsråd', 'Kilder og usikkerhet'] },
  { id: 'g5', type: 'single', label: 'Hvem bør være hovedbruker?',
    options: ['Privat plankonsulent/landskapsarkitekt', 'Kommunal saksbehandler', 'Utbygger', 'Alle'] },
  { id: 'g6', type: 'text', label: 'Hva bekymrer deg mest ved en slik tjeneste? (kort)' },
  { id: 'gmiss', type: 'text', label: 'Hva har vi oversett, eller hva savner du? (helt fritt — skriv gjerne mye)' },
  { id: 'g7', type: 'multi', label: 'Vil du bidra videre?',
    options: ['Testbruker', 'Faglig referansegruppe', 'Dele eksempelsaker', 'Nei'] },
  { id: 'epost', type: 'email', label: 'E-post — fyll inn hvis du vil bli kontaktet / bidra videre', hint: 'Påkrevd hvis du krysset av for å bidra over.' }
]

export const TAILORED = {
  'naturforvalter-biolog': [
    { id: 't1', type: 'text', label: 'Hvilke portretttyper ville gitt mest faglig verdi i egen forvaltning og i innspill til plansaker?' },
    { id: 't2', type: 'text', label: 'Hvilke faglige kilder/register bør portrettet bygge på — og hvilke bør brukes med varsomhet?' },
    { id: 't3', type: 'text', label: 'Hvor bør portrettet utløse feltregistrering i stedet for å gi falsk trygghet?' }
  ],
  'landskapsarkitekt-plankonsulent': [
    { id: 't1', type: 'text', label: 'I hvilken fase av prosjekteringen ville et naturportrett endret dine valg av naturkonsept/plantekonsept?' },
    { id: 't2', type: 'text', label: 'Hva må et artsportrett inneholde for å være konkret nok i prosjektering (terreng eller bygningsintegrert)?' },
    { id: 't3', type: 'text', label: 'Når er et «utadvendt» naturkonsept mest riktig? Foreslå ett kriterium.' }
  ],
  'eiendomsutvikler-prosjektleder': [
    { id: 't1', type: 'text', label: 'Ville tidlig naturinnsikt endret hvilke tomter/prosjekter dere går videre med — og når i løpet?' },
    { id: 't2', type: 'text', label: 'Ønsket resultat for dere: færre sene overraskelser, raskere avklaring, bedre dialog med PBE, annet?' },
    { id: 't3', type: 'text', label: 'Hvem hos dere ville brukt portrettet, og i hvilken situasjon?' }
  ],
  'byggherre-prosjekterende': [
    { id: 't1', type: 'single', label: 'Hvor i et byggeprosjekt gir portrettet mest verdi?',
      options: ['Tomtevalg', 'Prosjektering', 'Uteområde', 'Tak/fasade'] },
    { id: 't2', type: 'text', label: 'Ville artsportretter hjulpet dere å designe konkrete bygningsintegrerte tiltak (f.eks. biotop-tak)? Hva må til?' },
    { id: 't3', type: 'text', label: 'Ville KI-ideer koblet til normen for vegetasjon og vannhåndtering vært nyttige i prosjektutvikling?' }
  ],
  'radgiver': [
    { id: 't1', type: 'text', label: 'Hvor ser du faglige synergier mellom naturportrettet og klima-/naturbaserte løsninger (blågrønt, overvann, karbon)?' },
    { id: 't2', type: 'text', label: 'Bør portrettet eksplisitt koble naturverdier til klimatilpasning — hvordan?' },
    { id: 't3', type: 'text', label: 'Hva er ønsket resultat fra deres ståsted?' }
  ],
  'saksbehandler-planradgiver': [
    { id: 't1', type: 'text', label: 'Ville portrettet styrket dine faglige krav og vurderinger i en plansak? Hvordan?' },
    { id: 't2', type: 'text', label: 'Hvor går grensen før portrettet må følges av en full utredning?' },
    { id: 't3', type: 'single', label: 'Hjelper det å sikre likebehandling på tvers av saker?',
      options: ['Ja, tydelig', 'Litt', 'Nei', 'Usikker'] }
  ],
  'annet': [
    { id: 't1', type: 'text', label: 'Hvordan ser du for deg at du selv ville brukt et naturportrett?' },
    { id: 't2', type: 'text', label: 'Hva er det viktigste tjenesten må levere for å være nyttig for deg?' },
    { id: 't3', type: 'text', label: 'Hvem mener du er den viktigste brukeren?' }
  ]
}
