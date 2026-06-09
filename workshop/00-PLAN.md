# Workshop & spørreskjema — plan for Naturportrett

Underlag for å bygge løsningen med Claude Code. Skrevet for møtet der PBE demonstrerer Naturportrett-prototypen for Bymiljøetaten, Eiendoms- og byfornyelsesetaten, Oslobygg KF, Klimaetaten (og ev. VAV), ~15–20 deltakere, 1,5 time. **Dato: 17. juni 2026.**

> Status: **plan/skisse**. Neste steg er å generere de konkrete byggefilene (spørsmålsbank, app-modul, prompts) — se del 8.

---

## 1. Mål og rammer

**Hensikt:** Få konkret, strukturert input til videreutvikling av prototypen i sommer — samtidig som deltakerne informeres og inviteres til videre deltakelse.

**De viktigste rammene som styrer designet:**

- **Pausen er flaskehalsen.** Du har ~10 minutter til å gjøre skjemaet ferdig, mens du *også* skal håndtere transkripsjon. Alt tungt må derfor være bygget og godkjent på forhånd.
- **Du transkriberer selv.** iPhone-opptak → JOJO (norsk transkripsjon) → tekst inn til Claude. Dette tar noen minutter av pausen.
- **Deltakerne er kjent på forhånd.** Derfor kan *alt* innhold forhåndstilpasses til etat og aktuelle stillinger. Deltakeren velger selv etat + stilling på en startside før spørsmålene begynner.
- **Forms er ikke et krav.** Kjent for folk, men skaper et ekstra trinn for deg i pausen. Vi velger derfor en egen, lett løsning som du kontrollerer fullt ut.
- **50/50:** Halvparten generelle spørsmål (likt for alle), halvparten tilpasset etat + stilling.

**Bærende designprinsipp:** *Forhåndsbygg alt tungt — gjør pausen lett.* I pausen skal du ikke skrive spørsmål fra bunnen. Du skal kun (a) la Claude foreslå små justeringer basert på plenumsdiskusjonen, og (b) godkjenne en kort diff. Selv om det live-trinnet feiler helt, står et komplett, forhåndsgodkjent skjema klart.

---

## 2. Tidslinje — hva er forhåndsbygd vs. live

Møtestruktur (fra mailtråden) og hva som skjer teknisk:

| Tid | Bolk | Teknisk status |
|----|------|----------------|
| 5 min | Intro (Tore) | — |
| 10 min | Demo (Andreas) | App allerede live på laptop |
| 5 min | Veien videre (Tore) | — |
| 20 min | Åpen diskusjon | **Du tar opptak på iPhone** |
| 10 min | Pause / summing | **Pipeline kjører** (under) |
| 10 min | Individuell spørreundersøkelse | Deltakere åpner lenke/QR, velger etat+stilling |
| 30 min | Workshop, par (2 og 2) | Samme app, paroppgaver |

### Mikro-tidslinje for pausen (10 min)

| Min | Handling |
|----|----------|
| 0–3 | Stopp opptak, kjør JOJO-transkripsjon, kopier teksten |
| 3–6 | Lim transkripsjon inn i Claude Code med den forhåndslagde «tilpasnings-prompten». Claude rangerer/justerer eksisterende spørsmålsbank mot diskusjonen og foreslår 2–4 nye/endrede spørsmål + en frø-liste til prioriteringsoppgaven |
| 6–8 | Du leser en kort diff og godkjenner (ja/nei per forslag) |
| 8–10 | Publiser: app-en leser oppdatert config-fil. Ingen redeploy nødvendig. QR/lenke er den samme hele tiden |

**Hard regel:** redigeringen i pausen er en 2-minutters diff-godkjenning, ikke åpen skriving. Tidsboks det.

---

## 3. Spørsmålsdesign

> **Oppdatert:** gjeldende spørsmålsutkast ligger i `04-sporsmalsutkast-17juni.md` (forankret i Tores svar 8. juni). Bankene under er den første skissen og er videreført der.

Deltakeren velger **etat** og **stilling** på side 1. Deretter får hun: den generelle bolken (lik for alle) + den tilpassede bolken for sin etat/rolle. Alle spørsmål har en `id` slik at svar kan aggregeres på tvers.

Svartyper: **Likert** (1–5), **rangering**, **enkeltvalg**, **fritekst**. Hold individuell-runden til ~10 min → sikt på 8–10 spørsmål totalt per person (4–5 generelle + 4–5 tilpassede).

### 3a. Generelle spørsmål (likt for alle)

Fokus: faglig bruk, effekt, ønskede resultater, og hvem som skal bruke tjenesten. Velg/juster til 4–5 i den individuelle runden; resten kan brukes i paroppgavene.

1. **Verdi tidlig:** «I hvilken fase av planarbeidet ville et naturportrett vært mest nyttig?» (enkeltvalg: tidlig idé / oppstart regulering / utredning / høring / byggefase)
2. **Beslutningsstøtte:** «Hvilken konkret beslutning bør et naturportrett hjelpe til med å ta?» (fritekst)
3. **Effekt på arbeidet:** «Hva ville et godt naturportrett endret i måten du/dere jobber med natur i planarbeidet?» (fritekst)
4. **Ønsket resultat:** «Hva er det viktigste resultatet du håper tjenesten gir?» (enkeltvalg: bedre naturhensyn i planer / raskere avklaringer / mer forutsigbarhet / bedre faglig dialog / annet)
5. **Innholdsprioritet (faglig):** «Hva er viktigst at portrettet inneholder?» (rangering: rødlistearter / naturtyper / fremmede arter / økologiske funksjoner / forvaltningsråd)
6. **Faglig tillit:** «Hva må til for at du faglig stoler nok på portrettet til å bruke det?» (rangering: usikkerhet synliggjort / sporbare kilder / kjent avsender / fagfellevurdert)
7. **Format/leveranse:** «Hvordan vil du helst motta portrettet?» (enkeltvalg: nettside / PDF-rapport / kartlag / integrert i sakssystem)
8. **Hvem skal bruke det:** «Hvem mener du bør være hovedbruker?» (enkeltvalg: kommunal saksbehandler / privat konsulent / forslagsstiller-utvikler / alle)
9. **Risiko:** «Hva bekymrer deg mest faglig ved en slik tjeneste?» (fritekst — f.eks. falsk trygghet, at den erstatter feltarbeid)
10. **Bruksterskel:** «Hva er den største barrieren for at du faktisk tar dette i bruk?» (fritekst)
11. **Videre deltakelse:** «Vil du bidra videre (testbruker / faglig referansegruppe)?» (flervalg)

### 3b. Tilpassede spørsmålsbanker per etat/stilling

Forhåndsbygget. Nøkkel = `{etat, stilling}`. Eksempler under — utvides før møtet når du kjenner navnelisten.

**Bymiljøetaten — naturforvalter / biolog (fagekspertene på natur)**

- I hvilke saker ville et naturportrett endret hva du anbefaler eller krever av registrering/utredning?
- Hvordan bør usikkerhet vises faglig, slik at portrettet *utløser* feltarbeid der det trengs i stedet for å gi falsk trygghet?
- Hvilket faglig innhold er avgjørende for at du tar portrettet på alvor (rødliste, naturtyper, økologiske funksjoner, fremmede arter)?
- Hvor går grensen mellom å støtte din faglige vurdering og å erstatte den?

**Eiendoms- og byfornyelsesetaten — eiendomsutvikler / prosjektleder**

- Ville tidlig naturinnsikt endret hvilke tomter/prosjekter dere går videre med — og når i løpet?
- Hva er ønsket resultat for dere: færre overraskelser sent, raskere avklaring, bedre dialog med PBE?
- Hvordan unngår vi at tidlig naturinnsikt oppleves som en «brems» i stedet for en hjelp?
- Hvem hos dere ville faktisk brukt dette, og i hvilken situasjon?

**Oslobygg KF — byggherre / prosjekterende**

- Hvor i et byggeprosjekt ville et naturportrett gitt mest verdi (tomtevalg, prosjektering, uteområde)?
- Kunne portrettet hjulpet med bevisste natur-/plantekonsepter? Hva må det da inneholde?
- Hvem hos dere er rett bruker, og hva skal til for å gå fra å «vite om» natur til å *prosjektere for* den?

**Klimaetaten — rådgiver**

- Hvor ser du faglige synergier mellom naturportrettet og klima-/naturbaserte løsninger (blågrønn struktur, overvann, karbon)?
- Bør portrettet eksplisitt koble naturverdier til klimatilpasning? Hvordan?
- Hva er ønsket resultat fra deres ståsted?

**Plan- og bygningsetaten — saksbehandler / planrådgiver**

- Ville portrettet styrket dine faglige krav og vurderinger i en plansak? Hvordan?
- Hjelper det å sikre likebehandling på tvers av saker?
- Hvor er grensen mellom beslutningsstøtte og at saksbehandleren fortsatt må vurdere selv?

**(Ev.) VAV — Vann- og avløpsetaten**

- Hvor møtes vann/overvann og biologisk mangfold faglig i portrettet, og hva trenger dere der?

> Felles for de tilpassede bankene: 4–6 spørsmål, samme svartyper som over. I pausen kan Claude **promotere** spørsmål som plenum faktisk var opptatt av (tagget med tema), og legge til 1–2 ferske.

---

## 4. Workshop-oppgaver (30 min, par)

Parene jobber sammen og leverer **strukturert, sammenliknbart** output (ikke fri prat). Tre oppgaver, ~10 min hver — eller velg to og gå dypere. Output lagres i samme app.

**Oppgave A — «Plasser tjenesten i din arbeidsflyt».**
Paret tegner/markerer hvor i sin planprosess et naturportrett gir verdi, og hvilken *konkret beslutning* det skal støtte. Leveranse: utfylt mal (fase → beslutning → hva portrettet må vise der). *Formål: avdekker når og hvorfor, på tvers av etater.*

**Oppgave B — «Prioriter innholdet».**
Paret får en liste faglig kandidat-innhold (frø-listen seedes med tema fra plenum) og rangerer hva portrettet *må* ha for å være til å stole på og bruke. Leveranse: rangert topp 5 + én setning begrunnelse per. *Formål: gir direkte prioritering til backlog.*

**Oppgave C — «Drøm og bekymring».**
Hvert par navngir den *ene* funksjonen som ville fått dem til å bruke tjenesten ukentlig, og den *ene* risikoen som ville fått dem til å ikke stole på den. Leveranse: to korte tekster. *Formål: fanger sterkeste signal billig.*

**Valgfri scenario-oppgave (knytter til demoen):**
Gi en konkret Oslo-adresse/plansak. Paret kritiserer hva prototypen viste i demoen: hva manglet, hva var nyttig, hva ville de gjort annerledes. *Formål: konkret, forankret tilbakemelding på selve prototypen.*

---

## 5. Strategi: feedback-loop tilbake i prototypen

Dette er kjernen — hvordan svar blir til utvikling.

1. **Strukturert fangst.** Alt lagres som JSON: `{etat, stilling, spørsmål-id, svar, fritekst, tidsstempel}`. Fritekst og rangering holdes adskilt for analyse.
2. **Syntese etter møtet.** Claude Code tar hele svardatasettet + transkripsjonen og produserer: (a) tematisk oppsummering, (b) en **prioritert backlog mappet mot «Fremtidige forbedringer» i `CLAUDE.md`**, (c) behovsbilde per etat, (d) sitater/bevis bak hvert funn.
3. **Kobling til arkitektur.** Hvert innspill tagges til en del av prototypen — `kunnskapskilder/` (datakilder), `server/prompts/biodiversity.js` (KI-svar), UI/UX, influenssone, eller leveranseformat. Da blir innsikt til konkrete oppgaver Claude Code kan ta fatt på i sommer.
4. **Lukk loopen mot deltakerne.** Send en kort «dette hørte vi / dette gjør vi»-oppsummering. Bygger pipelinen for videre deltakelse (testbrukere, referansegruppe, datadeling).
5. **Gjenbruk.** Samme spørsmålsmotor og svar-schema gjenbrukes i senere sesjoner → du bygger et longitudinelt datasett over tid.

---

## 6. Personvern

- **Ingen navn lagres** i datasettet. Svar merkes kun med etat + stilling (det som trengs for tilpasning og analyse). Lav GDPR-risiko.
- Deltakeren velger selv etat/stilling — ingen forhåndsutfylt personliste i app-en.
- Fritekstsvar: minn deltakerne (kort tekst på startsiden) om å ikke skrive personopplysninger.
- Data lagres lokalt hos deg (ikke ekstern sky-tjeneste) — se del 7.

---

## 7. Teknisk arkitektur (bygges med Claude Code)

Gjenbruk eksisterende stack for konsistens og hastighet: **React 18 + Vite frontend, Express backend, Oslo Punkt-design**. To muligheter — egen route i prototypen, eller en liten frittstående modul. Anbefaling: egen route (`/workshop`) i samme app, så design og oppsett er gjenbrukt.

**Dataflyt:**
startside (velg etat + stilling) → app rendrer generell bolk + matchende tilpasset bolk → svar POSTes til Express → lagres lokalt (JSON-fil eller SQLite).

**Innhold som config (følg `kunnskapskilder/`-mønsteret):**
Spørsmål og oppgaver lever i en JSON/markdown-config, ikke hardkodet. Da er pausenredigeringen = oppdater config-fila; app-en leser den på nytt via et `reload`-endpoint. **Ingen redeploy.**

```
workshop/
  config/
    questions.general.json      → generelle spørsmål
    questions.tailored.json      → tilpassede banker, nøklet på {etat, stilling}
    tasks.json                   → paroppgaver + frø-lister
  responses/                     → innkomne svar (JSON, lokalt)
  prompts/
    tilpasning.md                → prompt for pausen (juster bank mot transkripsjon)
    syntese.md                   → prompt for etterarbeid (svar → backlog)
```

**Endepunkter (Express):**
- `POST /api/workshop/submit` — lagre et svar
- `POST /api/workshop/reload` — les config på nytt (kalles etter pausenredigering)
- `GET /api/workshop/admin` — enkel admin-visning: se forhåndsgodkjente + KI-foreslåtte spørsmål, godkjenn med ett klikk

**Distribusjon i møterommet:**
- Kjør lokalt på din laptop. Del via lokalnett-URL eller en tunnel (ngrok / Cloudflare Tunnel) → generer **QR-kode** deltakerne skanner. Lenken er konstant.
- Deltakerne bruker egne enheter (mobil/laptop).
- **Forhåndstest** dette på samme nett/rom hvis mulig.

**Godkjenningsport:** admin-visningen viser KI-genererte/endrede spørsmål som «pending» til du klikker godkjenn. Først da blir de synlige for deltakerne.

---

## 8. Hva Claude Code skal bygge (neste leveranser)

Konkret liste å generere etter at planen er godkjent:

1. `questions.general.json` + `questions.tailored.json` + `tasks.json` (fyll bankene fra del 3–4; utvid når navnelisten er kjent)
2. React-route `/workshop` med komponenter (startside etat/stilling-valg, spørsmålsvisning, paroppgave-visning) — gjenbruk Punkt + Oslo Sans
3. Express-endepunkter (`submit`, `reload`, `admin`)
4. Lokal lagring (`responses/*.json` eller SQLite)
5. `prompts/tilpasning.md` — pausenprompt: tar transkripsjon, rangerer/justerer bank, foreslår 2–4 spørsmål, returnerer en kort diff
6. `prompts/syntese.md` — etterarbeid: svar + transkripsjon → tematisk syntese + prioritert backlog mot `CLAUDE.md`
7. Admin-godkjenningsvisning
8. QR-/tunnel-runbook for møtedagen + testsjekkliste

---

## 9. Risiko og forhåndstesting

- **Øv på hele pause-pipelinen** med en dummy-transkripsjon før møtet — mål faktisk tidsbruk.
- **Fallback 1 (live feiler):** et komplett, forhåndsgodkjent skjema fungerer alene uten live-trinnet. Det live-genererte er et *pluss*, aldri en avhengighet.
- **Fallback 2 (nett/tunnel feiler):** ha en statisk versjon eller QR til lokal IP klar; i verste fall papir-utskrift av kjernespørsmålene.
- **Tidsboks pausenredigeringen** til diff-godkjenning (maks ~2 min).
- **Test JOJO-eksporten** på forhånd: vet du nøyaktig hvordan du får teksten ut og inn til Claude raskt?
- **Test QR + egen enhet**: skann fra mobil, fyll ut, se at svar lagres.

---

## 10. Åpne avklaringer før bygging

- Endelig navneliste → fyll ut tilpassede banker per faktisk stilling.
- Tunnel-verktøy: ngrok vs. Cloudflare Tunnel (sjekk hva som er greit på kommunens nett).
- Skal paroppgave-svar være anonyme på parnivå eller knyttes til de to etatene/rollene i paret?
- Ønsker du engelsk fallback for noen deltakere? (Antatt: nei, alt på norsk.)
