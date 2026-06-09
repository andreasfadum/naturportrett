# Spørreskjema + workshop-generering — FINAL (test 17. juni)

Klar til test i morgen (Tore + Andreas). Forankret i Tores beskrivelse 9. juni og spørsmålsutkastet (`04-sporsmalsutkast-17juni.md`).

**To KI-steg i verktøyet:**
- **Steg 1 (før utfylling):** transkripsjonen fra plenumssamtalen brukes til å *spisse og konkretisere* spørsmålene i skjemaet. Logikken ligger i `04-sporsmalsutkast-17juni.md`, Del 4 (promotér / fyll med deltakernes ord / spiss / spawn). Skjer i den korte luken rett etter den åpne diskusjonen.
- **Steg 2 (etter utfylling):** når alle har svart, genereres workshop-oppgavene **fra svarene** — umiddelbart. Det er **ingen pause** mellom skjema og workshop. Mål: oppgaveliste på skjerm innen **~2 minutter** mens parene organiserer seg.

## Flyt på dagen
1. Åpen plenumssamtale etter demoen. Andreas tar opptak.
2. **Steg 1:** rask transkripsjon (JOJO) → lim inn i Claude med tilpasnings-instruksen → de 10–15 skjemaspørsmålene (multiple choice + valgfri fritekst) spisses/konkretiseres og publiseres. Reserve: det forhåndsgodkjente skjemaet står hvis steget droppes.
3. Deltakerne skanner QR → fyller ut skjemaet på egen mobil.
4. **Steg 2:** når alle har sendt inn, trykker Andreas **«Generer workshop-oppgaver»** (ett klikk).
5. Claude leser alle svar og returnerer 3–4 paroppgaver innen ~2 min.
6. Oppgavelisten vises/deles; parene (2 og 2) jobber ~20 min.
7. **Reserve-oppgaveliste ligger alltid klar** (Del C) — brukes uendret hvis genereringen er treg eller feiler. Det genererte er et pluss, aldri en avhengighet.

---

## Del A — Spørreskjemaet (individuell utfylling, ~8–10 min)

Topptekst i skjemaet: **Oslo kommune / Plan- og bygningsetaten** med Oslo-logoen (hvit variant på mørk bakgrunn, `public/oslo-logo.svg`), og en tydelig markering om at prosjektet er i **tidlig pilotfase** (det vises noe under utvikling, og innspillene former veien videre).

Holdt kort fordi det ikke er noen pausebuffer. Fritekstsvarene (merket *fritekst*) er det viktigste råstoffet for å generere gode oppgaver — behold dem korte.

### Side 1 — Identitet (ingen navn lagres)
- **Etat:** Bymiljøetaten / Eiendoms- og byfornyelsesetaten / Oslobygg KF / Klimaetaten / Plan- og bygningsetaten / Annet
- **Stilling/rolle:** naturforvalter–biolog / landskapsarkitekt–plankonsulent / eiendomsutvikler–prosjektleder / byggherre–prosjekterende / saksbehandler–planrådgiver / rådgiver / annet

### Generelle spørsmål (alle)
1. **Portretttyper (NØKKEL).** Ranger topp 3: naturportrett (område) · artsportrett (enkeltart) · artsgruppeportrett (fugler/insekter/planter) · naturtypeportrett · rødlisteportrett · fremmedartsportrett · naturvernportrett.
2. **Verdi i utredningsarbeidet.** Likert 1–5: «Hvor mye ville et naturportrett hevet kvaliteten og effektiviteten i naturutredninger du kjenner til?» + *fritekst:* «Hva ville det konkret spart deg for eller forbedret?»
3. **Inspirasjon vs. normativ anbefaling.** Likert 1–5: «Portrettet kan foreslå natur-/plantekonsepter og tiltak som *inspirasjon* — et startpunkt du selv vurderer og bygger videre på, ikke normative anbefalinger tjenesten går god for. Hvor nyttig ville slike inspirasjonsforslag være?» + *fritekst:* «I hvilke situasjoner ville slike inspirasjonsforslag hjulpet deg mest?»
   *Skille (forklart i skjemaet): Inspirasjon = forslag du selv vurderer og bearbeider. Normativ anbefaling = et «gjør X»-råd tjenesten står inne for — det gir den bevisst ikke.*
4. **Innhold i v1.** Ranger topp 3: kartlagte arter · rødlistearter · naturtyper · fremmede arter · økologiske funksjoner/sammenhenger · forvaltningsråd · kilder og usikkerhet.
5. **Hovedbruker.** Enkeltvalg: privat plankonsulent/landskapsarkitekt · kommunal saksbehandler · utbygger · alle.
6. **Største bekymring (faglig).** *Fritekst, kort:* «Hva bekymrer deg mest ved en slik tjeneste?»
7. **Oversett / savnet.** *Helt fri tekst:* «Hva har vi oversett, eller hva savner du?» (oppfordre til å skrive mye — dette mates rett inn i oppsummeringen).
8. **Videre deltakelse.** Flervalg: testbruker · faglig referansegruppe · dele eksempelsaker · nei.
9. **E-post (betinget).** Vises/aktiveres hvis deltakeren krysser av for å bidra. **Påkrevd da**, slik at Andreas kan ta kontakt. Samtykkebasert kontaktinfo — lagres kun for dem som velger å bidra.

### Tilpasset bolk (3 spørsmål, etter etat+stilling)

Vis tydelig i skjemaet at denne bolken er **tilpasset rollen deltakeren valgte** (overskrift: «Tilpassede spørsmål — <stilling>», med en linje om at spørsmålene gjelder valgt etat + rolle).

**BYM – naturforvalter/biolog**
- Hvilke portretttyper ville gitt mest faglig verdi i egen forvaltning og i innspill til plansaker?
- *Fritekst:* Hvilke faglige kilder/register bør portrettet bygge på — og hvilke bør brukes med varsomhet? (f.eks. Artsdatabanken, GBIF, iNaturalist, naturtypekartlegging, Naturkart for Oslo)
- Hvor bør portrettet *utløse* feltregistrering i stedet for å gi falsk trygghet?

**BYM – landskapsarkitekt/plankonsulent**
- I hvilken fase av prosjekteringen ville et naturportrett endret dine valg av naturkonsept/plantekonsept?
- *Fritekst:* Hva må et artsportrett inneholde for å være konkret nok til bruk i prosjektering (terreng eller bygningsintegrert)?
- Når er et «utadvendt» naturkonsept mest riktig? Foreslå ett kriterium.

**Eiendoms- og byfornyelsesetaten – eiendomsutvikler/prosjektleder**
- Ville tidlig naturinnsikt endret hvilke tomter/prosjekter dere går videre med — og når i løpet?
- *Fritekst:* Ønsket resultat for dere — færre sene overraskelser, raskere avklaring, bedre dialog med PBE, annet?
- Hvem hos dere ville brukt portrettet, og i hvilken situasjon?

**Oslobygg KF – byggherre/prosjekterende**
- Hvor i et byggeprosjekt gir portrettet mest verdi (tomtevalg, prosjektering, uteområde, tak/fasade)?
- *Fritekst:* Ville artsportretter hjulpet dere å designe konkrete bygningsintegrerte tiltak (f.eks. biotop-tak)? Hva må til?
- Ville KI-ideer koblet til normen for vegetasjon og vannhåndtering vært nyttige i prosjektutvikling?

**Klimaetaten – rådgiver**
- Hvor ser du faglige synergier mellom naturportrettet og klima-/naturbaserte løsninger (blågrønt, overvann, karbon)?
- *Fritekst:* Bør portrettet eksplisitt koble naturverdier til klimatilpasning — hvordan?
- Hva er ønsket resultat fra deres ståsted?

**Plan- og bygningsetaten – saksbehandler/planrådgiver**
- Ville portrettet styrket dine faglige krav og vurderinger i en plansak? Hvordan?
- *Fritekst:* Hvor går grensen før portrettet må følges av en full utredning?
- Hjelper det å sikre likebehandling på tvers av saker?

**Annet/annen rolle** (fallback)
- Hvordan ser du for deg at du selv ville brukt et naturportrett?
- *Fritekst:* Hva er det viktigste tjenesten må levere for å være nyttig for deg?
- Hvem mener du er den viktigste brukeren?

---

## Del B — Genererings-prompt (kjøres på «Generer»-knappen)

Lim hele blokka under som *system/instruks*, etterfulgt av `=== SVARDATA ===` og JSON med alle innsendte svar. Designet for rask, avgrenset respons.

```
Du hjelper Plan- og bygningsetaten i Oslo med en miniworkshop om tjenesten «Naturportrett»
(KI-drevet område-/arts-/naturtypeportrett for tidlig fase i arealplanlegging; ideer, ikke fasit).

OPPGAVE: Les alle deltakersvarene under og lag en kort oppgaveliste til en 30-minutters
workshop der deltakerne jobber TO OG TO, helst på tvers av etater.

KRAV:
- Lag NØYAKTIG 5 paroppgaver. Gruppene (2 og 2) velger selv hvilken/hvilke de besvarer,
  for hånd eller digitalt. Hver oppgave: (1) kort tittel, (2) 1–3 setningers instruks,
  (3) konkret leveranse paret skal produsere.
- Forankre oppgavene i det deltakerne FAKTISK svarte: løft fram portretttypene, temaene,
  bekymringene og kildene som går igjen. Der det er nyttig, lag en «frø-liste» av punkter
  hentet rett fra svarene (f.eks. de mest rangerte portretttypene, de hyppigste bekymringene).
- Minst én oppgave skal handle om Tores viktigste spørsmål: HVILKE PORTRETTTYPER tjenesten
  bør utvikle først.
- Bygg på malene i reservelisten (under), men tilpass dem til gruppens svar. Behold malens
  struktur hvis svarene er tynne.
- IKKE dikt opp sitater eller deltakere. Bruk bare det som står i dataene.
- Norsk. Hold deg kort — hele svaret skal kunne leses på en skjerm. Ingen lange forklaringer.

FORMAT (ren markdown):
## Workshop-oppgaver (par)
Kort fellesinstruks (1 setning).
### Oppgave 1 — <tittel>
<instruks>
**Leveranse:** <hva paret leverer>
### Oppgave 2 — ...
(5 oppgaver totalt — gruppene velger selv hvilke de besvarer)

=== SVARDATA ===
<JSON med alle svar: liste av {etat, stilling, svar...}>
```

Modellvalg: bruk en rask modell (claude-sonnet eller -haiku), maks ~700 tokens output. På serveren forhåndslastes prompten; knappen sender bare svardataene.

---

## Del C — Reserve-oppgaveliste: 5 oppgaver (forhåndsgodkjent)

**Gruppene (2 og 2) velger selv hvilken/hvilke av de 5 oppgavene de besvarer — for hånd eller digitalt.** Disse er ferdige og kan deles uendret; den genererte versjonen følger samme struktur, men tilpasset svarene.

**Oppgave 1 — Velg portretttypene for v1.** Bli enige om hvilke 2–3 portretttyper tjenesten bør utvikle først (naturportrett, artsportrett, artsgruppeportrett, naturtypeportrett, rødliste-, fremmedarts-, naturvernportrett), med én setnings begrunnelse per og hvilket formål hver tjener. **Leveranse:** rangert kortliste + begrunnelser.

**Oppgave 2 — Fra område til målart.** Ta utgangspunkt i et konkret Oslo-strøk (gjerne fra demoen). Med naturportrettet som grunnlag: hvilke 2–3 målarter ville dere utforsket, og hvilket tiltak (på terreng eller bygningsintegrert, f.eks. biotop-tak) kunne styrket dem? **Leveranse:** målarter + tiltaksidé.

**Oppgave 3 — Ideer mot normen.** Velg ett kriterium fra normen for vegetasjon og vannhåndtering (fysisk utvidelse av blågrønn struktur / nye leveområder / overvann / samordning med nabogrunn / gjenåpning av vassdrag). Hva slags KI-genererte *ideer* ville vært nyttige der — og hvor går grensen mot «anbefalinger» dere ikke ville stolt på? **Leveranse:** nyttevurdering + grense.

**Oppgave 4 — Plasser portrettet i din arbeidsflyt.** Tegn/beskriv hvor i planprosessen et naturportrett gir mest verdi, og hvilken konkret beslutning det skal støtte. **Leveranse:** fase → beslutning → hva portrettet må vise der.

**Oppgave 5 — Drøm og bekymring.** Den *ene* funksjonen som ville fått dere til å bruke tjenesten, og den *ene* risikoen som ville fått dere til å ikke stole på den. **Leveranse:** to korte tekster.

---

## Del D — Slik tester dere i morgen
Åpne `demo-naturportrett-workshop.html` (i denne mappa) i en nettleser:
1. Fyll ut skjemaet som om dere er ulike deltakere (velg ulik etat/stilling hver gang) — gjenta 4–6 ganger for å simulere en gruppe.
2. Gå til «Administrator»-fanen → se antall svar → trykk **«Lag genererings-pakke»**. Da kopieres prompt + alle svar til utklippstavla.
3. Lim inn i Claude (her i Cowork eller i Claude Code) → dere får oppgavelista. Mål tiden.
4. Sammenlign med reservelista som vises i admin-fanen. Vurder om spørsmålene og oppgavene treffer.
5. Test også fane **«2 · Workshop»**: kryss av for oppgaver og skriv svar som en gruppe.
6. Til slutt: admin → **«Avslutt – lag oppsummering»** → lim inn i Claude → dere får et sortert arkiv + en kort oppsummering (hva det kom mest inn på, og hva som savnes).

## Del E — For Claude Code (live-versjon)
Bygg inn i prototypen (React + Express, Oslo Punkt). To KI-steg + skjema:
- Route `/workshop` (deltaker) + `/workshop/admin` (Andreas).
- **Steg 1 — spiss spørsmål:** `POST /api/workshop/sharpen` tar plenums-transkripsjon, kjører tilpasningslogikken (`04-...`, Del 4) mot det forhåndsdefinerte spørsmålssettet (Del A), og returnerer et oppdatert sett. Admin **godkjenner** før publisering; baseline-settet står hvis steget droppes.
- `POST /api/workshop/submit` → lagre svar (lokal JSON/SQLite). Ingen navn; kun etat + stilling.
- `GET /api/workshop/admin` → antall svar + «Generer»-knapp.
- **Steg 2 — generer oppgaver:** `POST /api/workshop/generate` bygger prompten i Del B + svardata, kaller Claude-proxyen (`server/prompts/`), returnerer markdown. Bruk rask modell, maks ~700 tokens, timeout 90 s; ved feil/timeout returneres reservelista i Del C.
- **Workshop-svar:** `POST /api/workshop/answers` lagrer gruppenes svar (gruppe, valgte oppgaver, fritekst). Gruppene velger selv hvilke av de 5 oppgavene de besvarer; svar kan også gis på papir og bare krysses av digitalt.
- **Avslutt/oppsummer:** `POST /api/workshop/summarize` bygger oppsummerings-prompten (Del F) + alle skjema- og workshop-svar, returnerer (a) kort oppsummering og (b) sortert arkiv. Trigges når alle har svart eller på «Avslutt»-knapp.
- Distribusjon: kjør lokalt + tunnel (ngrok/Cloudflare) → QR. Reservelista og baseline-skjemaet pakkes med klienten så de vises selv uten nett.
- **Personvern:** ingen navn lagres. Etat + stilling for analyse. **E-post lagres kun for dem som aktivt velger å bidra** (samtykke), og brukes bare til oppfølging.

---

## Del F — Oppsummering (kjøres på «Avslutt – oppsummer»)
Når alle har svart, eller når Andreas trykker «Avslutt», sendes ALLE skjema- og workshop-svar tilbake til Claude med denne instruksen. Resultatet er todelt: en kort oppsummering Andreas kan lese opp, og et komplett, sortert arkiv.

```
Du hjelper Plan- og bygningsetaten i Oslo etter en miniworkshop om tjenesten «Naturportrett».
Under får du (1) alle spørreskjemasvar og (2) alle workshop-svar.

Lag på norsk:
A) KORT OPPSUMMERING (3–6 setninger Andreas kan lese opp): hva slags svar kom det MEST
   inn på (hvilke portretttyper, temaer og prioriteringer går igjen), og hva deltakerne
   melder at de SAVNER eller mener er OVERSETT.
B) STRUKTURERT ARKIV:
   - Tematisk sortering: for hvert tema, kort hva som kom fram + hvilke etater/roller som løftet det.
   - Egen bolk «Savnet / oversett» (samle alle svar på det frie feltet).
   - Egen bolk «Til oppfølging — kontaktliste»: de som la igjen e-post, med rolle og hva de vil bidra med.
   - Egen bolk «Workshop»: hva gruppene svarte, per oppgave.

KRAV: IKKE dikt opp. Bruk bare det som står i dataene. Marker tydelig hvis noe er tynt/usikkert.
Behold deltakernes komplette svar tilgjengelig i arkivdelen.

=== SPØRRESKJEMA ===
<JSON med alle skjemasvar>
=== WORKSHOP ===
<JSON med alle workshop-svar>
```

Andreas får da både **deltakernes komplette svar** (i arkivdelen) og en **kort oppsummering** av hva det kom mest inn på og hva som savnes — klart til å oppsummere muntlig med noen få setninger.
