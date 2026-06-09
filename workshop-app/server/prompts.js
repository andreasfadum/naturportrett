// Prompts og reserve-oppgaver. Kilde: workshop/10-skjema-generering-FINAL.md (Del B, C, F).

export const RESERVE_TASKS = [
  { nr: 1, tittel: 'Velg portretttypene for v1',
    instruks: 'Bli enige om hvilke 2–3 portretttyper tjenesten bør utvikle først (naturportrett, artsportrett, artsgruppeportrett, naturtypeportrett, rødliste-, fremmedarts-, naturvernportrett), med én setnings begrunnelse per og hvilket formål hver tjener.',
    leveranse: 'rangert kortliste + begrunnelser' },
  { nr: 2, tittel: 'Fra område til målart',
    instruks: 'Ta utgangspunkt i et konkret Oslo-strøk. Med naturportrettet som grunnlag: hvilke 2–3 målarter ville dere utforsket, og hvilket tiltak (terreng eller bygningsintegrert, f.eks. biotop-tak) kunne styrket dem?',
    leveranse: 'målarter + tiltaksidé' },
  { nr: 3, tittel: 'Ideer mot normen',
    instruks: 'Velg ett kriterium fra normen for vegetasjon og vannhåndtering (fysisk utvidelse av blågrønn struktur / nye leveområder / overvann / samordning med nabogrunn / gjenåpning av vassdrag). Hva slags KI-genererte ideer ville vært nyttige der — og hvor går grensen mot normative anbefalinger dere ikke ville stolt på?',
    leveranse: 'nyttevurdering + grense' },
  { nr: 4, tittel: 'Plasser portrettet i din arbeidsflyt',
    instruks: 'Beskriv hvor i planprosessen et naturportrett gir mest verdi, og hvilken konkret beslutning det skal støtte.',
    leveranse: 'fase → beslutning → hva portrettet må vise' },
  { nr: 5, tittel: 'Drøm og bekymring',
    instruks: 'Den ene funksjonen som ville fått dere til å bruke tjenesten, og den ene risikoen som ville fått dere til å ikke stole på den.',
    leveranse: 'to korte tekster' }
]

export const GENERATE_SYSTEM = `Du hjelper Plan- og bygningsetaten i Oslo med en miniworkshop om tjenesten «Naturportrett» (KI-drevet område-/arts-/naturtypeportrett for tidlig fase i arealplanlegging; inspirasjon, ikke fasit).

Lag NØYAKTIG 5 paroppgaver til en 20-min workshop der deltakerne jobber to og to, helst på tvers av etater. Gruppene velger selv hvilke oppgaver de besvarer.

KRAV:
- Forankre oppgavene i det deltakerne FAKTISK svarte (portretttyper, temaer, bekymringer og kilder som går igjen). Gjerne en frø-liste hentet rett fra svarene.
- Minst én oppgave skal handle om HVILKE PORTRETTTYPER tjenesten bør utvikle først.
- Bygg på de fem reservemalene (Velg portretttyper / Fra område til målart / Ideer mot normen / Plasser i arbeidsflyt / Drøm og bekymring), tilpasset svarene.
- IKKE dikt opp sitater eller deltakere. Norsk, kort.

Returner KUN gyldig JSON (ingen tekst rundt): en liste med nøyaktig 5 objekter med feltene "nr" (1-5), "tittel" (kort), "instruks" (1-3 setninger), "leveranse" (kort).`

export function buildGenerateUser(responses) {
  return 'Deltakersvar fra spørreskjemaet (JSON):\n' + JSON.stringify(responses, null, 2)
}

export const SUMMARY_SYSTEM = `Du hjelper Plan- og bygningsetaten i Oslo etter en miniworkshop om tjenesten «Naturportrett». Du får (1) alle spørreskjemasvar og (2) alle workshop-svar.

Lag på norsk:
A) KORT OPPSUMMERING (3–6 setninger Andreas kan lese opp): hva slags svar kom det MEST inn på (hvilke portretttyper, temaer og prioriteringer går igjen), og hva deltakerne melder at de SAVNER eller mener er OVERSETT.
B) STRUKTURERT ARKIV:
   - Tematisk sortering: for hvert tema, kort hva som kom fram + hvilke etater/roller som løftet det.
   - Egen bolk «Savnet / oversett» (samle alle svar på det frie feltet).
   - Egen bolk «Til oppfølging — kontaktliste»: de som la igjen e-post, med rolle og hva de vil bidra med.
   - Egen bolk «Workshop»: hva gruppene svarte, per oppgave.

KRAV: IKKE dikt opp. Bruk bare det som står i dataene. Marker tydelig hvis noe er tynt/usikkert. Behold deltakernes komplette svar tilgjengelig i arkivdelen. Svar i ren markdown.`

export function buildSummaryUser(responses, answers) {
  return '=== SPØRRESKJEMA ===\n' + JSON.stringify(responses, null, 2) +
         '\n\n=== WORKSHOP ===\n' + JSON.stringify(answers, null, 2)
}
