# Naturportrett — Utviklingslogg

> **Formål:** Denne loggen er en referanseressurs for hvordan prosjektet er bygget — arkitekturvalg, problemer vi har løst, og driftsoppsett. Den påvirker ikke kjøretid (ren dokumentasjon). Bruk den ved feilsøk, onboarding, eller når historikk trengs. Oppdateres ved milepæler, ikke ved hver endring.

Sist oppdatert: 24. juni 2026

---

## 1. Hva prosjektet er

Webapplikasjon for Oslo kommune (Plan- og bygningsetaten) som hjelper arkitekter, eiendomsutviklere og saksbehandlere med å identifisere biologisk mangfold innenfor influensområdet (500 m) til en eiendom under utvikling.

**Live:** https://naturportrett.figurate.studio
**Repo:** github.com/andreasfadum/naturportrett

Tjenesten lager fem produkttyper (per juni 2026):

- **Naturportrett** — generell oversikt over influensområdet
- **Naturtypeportrett**, **Artsportrett**, **Planteportrett** — detaljutdypning for én konkret naturtype/art/plante
- **Planportrett** — beslutningsstøtte for naturmangfold i plansak (fem moduler etter nml §§ 8–12 + KU-screening + kandidat-bestemmelser)

Brukerflyt etter nav-refactor 24. juni 2026: `Adresse → Influensområde → Portretttype → Portrett`. Naturportrett er ikke lenger et tvunget mellomsteg, men ett av fem valg på portretttype-skjermen.

---

## 2. Teknisk arkitektur

| Lag | Teknologi | Notat |
|-----|-----------|-------|
| Frontend | React 18 + Vite (port 5173) | Funksjonelle komponenter + hooks |
| Backend | Express.js (port 3001) | Kun proxy — skjuler API-nøkkel |
| Kart | Leaflet + OpenStreetMap | Gratis, ingen nøkkel |
| Design | Oslo kommune Punkt + Oslo Sans (selvhostet WOFF2) | Palett i `src/index.css` (`--oslo-*`) |
| AI | Anthropic Claude `claude-sonnet-4-6` | Via server-proxy, SSE for vurdering / JSON for portretter |

**Datakilder:**
- Kartverket — adresser/koordinater (`kommunenummer=0301`, `fuzzy=true`)
- iNaturalist — arter, foto, norske navn (primær)
- GBIF — arter, foto (sekundær/backup)
- Artsdatabanken — rødliste/fremmedartsliste (planlagt: ~150 vanlige Oslo-arter statisk; senere API)
- OpenStreetMap — bakgrunnskart
- Anthropic Claude — sammenstiller informasjonen (eneste betalte kilde, < 0,15 USD/full sesjon)

**Dataflyt:** Adresse (Kartverket) → koordinater → arter (iNaturalist + GBIF parallelt via `Promise.allSettled`, dedup i `speciesAggregator.js`) → naturportrett (Claude) → detaljportretter (Claude).

**Sikkerhet:** `ANTHROPIC_API_KEY` ligger kun server-side (Railway-variabler / lokal `.env` i `.gitignore`). Aldri eksponert i frontend. All Claude-trafikk via `POST /api/claude/*`.

---

## 3. Utviklingstidslinje

| Dato | Commit | Milepæl |
|------|--------|---------|
| 11. apr 2026 | `439ee35` | Første prototype (adresse → arter → vurdering-flyt) |
| 15. mai 2026 | `f0ec1a5` | Innholdsoppdateringer fra kollega-tilbakemelding (Om tjenesten-boks, «natur og arter», 4 tiltakskategorier, lovsitat) |
| 15. mai 2026 | `ba82f7c` | **Restrukturering** til portrettbasert flyt (4 produkttyper) |
| 15. mai 2026 | `60503e7` | Leaflet-kart erstattet placeholder (markør + 500 m sone) |
| 15. mai 2026 | `4e92dcd`–`401a7bd` | ProgressBar med stage-tekster |
| 15. mai 2026 | `d174d1c` | Robust JSON-håndtering for portretter |
| 15. mai 2026 | `5019de8` | Fjernet assistant-prefill (Sonnet 4.6 støtter ikke) |
| 22. mai 2026 | `eb3fd89` | Fersk redeploy etter Railway-krasj |
| 22. mai 2026 | `b982bf3` | Auto-retry på forbigående KI-feil |
| 9. jun 2026 | `9a61d6e` | Strukturert lovgrunnlag (sitat fra Lovdata istedenfor KI-tolkning) |
| 14. jun 2026 | `c379325` | Sentralisert KI-modellkonfig + auto-fallback ved deprecation |
| 14. jun 2026 | `3ac8f25` | Workshop-admin: rådata-nedlasting + frossen backup av spørreskjema |
| 17. jun 2026 | (tagget `v1-presentasjon-2026-06-17`) | **Brukerundersøkelse med 9 deltakere** etter presentasjon for kollegaer |
| 17. jun 2026 | `9db04f7` | **Iterasjon 1** — datakvalitet-indikator + informasjonsbase-banner basert på funn fra brukerundersøkelsen (`svar-radata/analyse-2026-06-17.md` lokalt, ikke i git) |
| 17. jun 2026 | `8d1c661` | **Iterasjon 2** — tiltakskategorisering: praktiske designtiltak merkes som lovstyrt_krav vs frivillig_forbedring med hjemmel + prosjektfase (R2-innspill). Ny TiltakListe-komponent + planteportrett får praktiskeDesigntiltak-felt for første gang |
| 17. jun 2026 | `939ce0d` | **Iterasjon 3** — forvaltningsråd som egen seksjon i naturportrett, med tidshorisont (umiddelbart/mellom/langsiktig) og begrunnelse per råd. Adresserer g4-innspill (4 av 8 prioriterte forvaltningsråd i v1) |
| 20. jun 2026 | `8e0b1d6` (+ `54df6cb`, `9521b90` for synlighet- og zoom-fikser) | **Iterasjon 4** — Heatmap-side på `/heatmap` som visualiserer kartleggings-tetthet i Oslo via GBIF-observasjoner. Bruker leaflet.heat + ny `scripts/build-heatmap-data.js` (kjøres med `npm run build:heatmap-data`, ~5 min). Adresserer R7-innspill: «sier ikke noe om hva vi IKKE får informasjon om» — heatmapet viser eksplisitt hvor det er kunnskapshull. Dynamisk radius basert på zoom-nivå |
| 21. jun 2026 | `114788b` | **Iterasjon 5** — Konsistens-fiks: naturtypeportrettet får også `praktiskeDesigntiltak` med samme kategorisering (lovstyrt vs frivillig) som artsportrett og planteportrett fikk i iter 2. Tilpasset prompt for naturtype-kontekst (kantsoneverning, hensynssoner, utvalgte naturtyper) |
| 21. jun 2026 | `f676c2a` | **Iterasjon 6** — Tilbakemeldings-mekanisme per portrett (R7-innspill). Ny `POST /api/feedback`-endepunkt med `feedback.json` på persistent volum. FeedbackKnapp-komponent nederst i alle fire portretttyper med modal: type (feil/mangel/hallusinasjon/forslag), valgfri seksjon, fritekst, valgfri e-post, klient-ID for dedup. Admin-side på `/admin/feedback` med passordbeskyttelse, fordeling per portretttype, JSON-nedlasting |
| 21. jun 2026 | `40e2a97` + hotfix `adb5fc9` | **Iterasjon 7** — Områdedata vs eiendomsdata (R6-innspill). Nytt `eiendomsKontekst`-felt i naturportrett-prompten med 1-3 setninger som spesifikt beskriver hvordan eiendommen forholder seg til områdedataene. Ny topp-seksjon i NaturportrettView. Tydeligere overskrifter: «Naturtyper i området (innenfor 500 m)» og «Oversiktskart — 500 m influenssone» |
| 21. jun 2026 | `d98fc8e` | **Iterasjon 8** — To prod-observasjoner: (a) KI nevner kun ikoniske parker (Akerselva, Birkelunden) og hopper over Tøyenparken/Botanisk hage. Fix: ny `src/utils/osloGronnstrukturer.js` med 30 kuraterte Oslo-grønnstrukturer + Haversine-utility som klienten kjører for å gi KI en eksplisitt sjekkliste i user-prompten. (b) UI viste advarsel «KI foreslo paragrafer som ikke finnes i lovbasen: §1-8, §11-9, §12-6, §12-7» fordi pbl bare var stubbet med kun § 3-1. Fix: full pbl-indeks (243 paragrafer) bygget fra `plan-og-bygningsloven.md`; parser utvidet til å håndtere pbl-format med `***tema***` etter `**§ N-N.**`. |
| 21. jun 2026 | `96f140b` | **Iterasjon 9** — Pbl-paragrafer viste rå Lovdata-markdown i UI: markdown-lenker `[tekst](url)` ble vist som plaintekst og tabellrader/separatorer (`| --- | --- |`, `\| 0 \| Endret ved lover...\|`) lekket inn i sitatet. Fix: ny `cleanSitat()` i `scripts/build-lover-index.js` fjerner tabell-separatorer + endringshistorikk-rader og konverterer nummererte tabellrader til lesbar prosa. Ny `renderSitat()`-helper i `LegalReferences.jsx` konverterer markdown-lenker til klikkbare `<a>`-elementer (target=_blank). |
| 21. jun 2026 | `9895488` | **Iterasjon 10** — PDF-eksport-rydding. Brukerobservasjon: «Last ned som PDF» genererte en tom førsteside (kun nettleserens topptekst) før portrettet kom på side 2. Rotårsak: `.app-container` er flex column med `min-height: 100vh` som i print-modus oppfattes som «én A4 høyde» og forskyver innholdet. Fix: ny `@page A4`-regel med 15 mm marginer + nullstilling av flex-stacken (`.app-container`, `.main-content`, `.portrait-screen`) i `@media print`. Lagt til typografi for trykk (10.5pt body, 18/13/11pt overskrifter), smartere sideskift på lov-blokker / kart / eiendomskontekst / tabeller, skjul av feedback-knapp og portrait-nav i print. Dev-banner beholdes (brukerønske) men med ryddig papir-styling (mørkeblå border, hvit bakgrunn). |
| 21. jun 2026 | `799036f` + `e31acfb` | **Iterasjon 11** — Feedback-routing til e-post via Resend. Nå sendes hver tilbakemelding til `FEEDBACK_RECIPIENT_EMAIL` (default `andreas.haugstad@pbe.oslo.kommune.no`) med emne-prefiks `[Naturportrett tilbakemelding]`. Sendt fra `onboarding@resend.dev` så domeneverifisering ikke kreves. `replyTo` settes til brukerens e-post hvis oppgitt. Fire-and-forget — klient venter ikke på Resend. Mail-formatet er en kopierbar markdown-blokk (overskrifter + felter + Innspill-seksjon + Kontekst-liste) som lar mottaker Cmd+A → Cmd+C → lime inn i Claude. |
| 21. jun 2026 | `e90a41f` | **Iterasjon 12** — Token- og kostnadssporing for Claude-kall. Logges som JSONL på Railway-volumet; admin-side `/admin/usage` viser totaler, fordeling per modell og kontekst, sessions (unik IP innenfor 30 min) og snitt USD/kall. |
| 22. jun 2026 | (commit) | **Iterasjon 13** — To utvidelser i forberedelse til Ebbe Nielsen Challenge-søknad og bredere bruk: (a) Kartverket-adressesøk dekker nå hele Norge (`kommunenummer=0301`-filteret er fjernet); Oslo-grønnstrukturer-listen aktiveres kun innenfor Oslos bounding-boks slik at andre kommuner ikke får feil sjekkliste. (b) Ny i18n-infrastruktur (`src/i18n/`) med norske/engelske oversettelser, `useT()`-hook og `<SprakProvider>` på rotnivå. `<LanguageSwitcher>` (NO/EN-pill med flagg) plassert i AppHeader, valg lagres i localStorage. KI-prompter forblir norske i denne iterasjonen — kun UI-strenger er oversatt; engelsk førsteutkast skal korrekturleses av Andreas (PBE) i `src/i18n/translations.js`. |
| 23. jun 2026 | `b0fbb9c` m.fl. | **Iterasjon 14 — mobil-tilpasning + Oslo-logo + heatmap-tilpasning.** Header-kollisjon på mobil fikset (flex-wrap, kommune-tekst skjult < 640 px). Oslo-logo brukt korrekt (hvit på mørk header, mørkeblå på portretter) iht. designmanualen, «Oslo kommune»-tilleggstekst fjernet (logoen inneholder «Oslo» selv). Logo 50 % større. Avstander rapporteres i km med 0,1 km-presisjon, ikke meter (eiendom er et areal, ikke et punkt) — `formatAvstandKm()`-helper + `AVSTAND_INSTRUKS` i prompt. Heatmap-effekt forsterket: radius 22→35, blur 28→45, minOpacity 0,35→0,55. Konsistent 1100 px max-width på alle steg. |
| 23. jun 2026 | `4e640ef` m.fl. | **Iterasjon 15 — mobil-tilpasning runde 2: tabeller responsive + lange tekster forkortet.** Ny `useIsMobile()`-hook (terskel 720 px). Ny `<ResponsiveTable>` rendrer card-layout på mobil for multikol-tabeller (naturtype-tabell, næringskilde-tabeller, tilknyttede arter, pollinator-verdi). Ny CSS-klasse `.portrait-doc__table--label-value` stacker `<th>` + `<td>` vertikalt på mobil for label-value-tabeller (beskrivelse, habitatkrav, spredning, viktige strukturer i alle detaljportretter). Ny `<ExpandableText>` forkorter lange tekstavsnitt til ~220 tegn på mobil med «Vis mer»-knapp. Arts-tabellen skjuler kategori + datakvalitet-kolonner på mobil (kategori vises som badge under norsk navn). Lovsitater alltid kollaps som default (`<details>`) på begge plattformer — JS-handler åpner alle ved `beforeprint` så PDF får sitatene. Forrige iterasjons «overflow-x: auto»-tilnærming var feil — den krevde horisontal scroll. Ny strategi: **ingen horisontal scroll på mobil**, all tilpasning via card-layout og vertikal stacking. |
| 23.–24. jun 2026 | `e5bdc48`, `3f3ce21` | **Iterasjon 16 — Planportrett (fjerde detaljportretttype).** Implementert etter [PLANPORTRETT-SPEC.md](PLANPORTRETT-SPEC.md) som beslutningsstøtte for naturmangfold i plansak. Fem moduler: (A) Naturmangfold-avsnitt etter nml §§ 8–12, jf. § 7; (B) Viktig-natur-screening (lav/middels/høy med fargekodet badge); (C) Bestemmelsesforslag (tema + materielt behov + kandidat-hjemmel + `[klamme]`-skisseOrdlyd + obligatorisk «⚖ Må avklares med jurist»-banner per oppføring); (D) KU-screening (momenter, aldri konklusjon); (E) Underlag til område- og prosessavklaring. **Arkitektonisk forskjell** fra øvrige detaljportretter: tar IKKE et subject — gjelder eiendommen som helhet. Subject-picker hoppes over. **Skjerpet anti-hallusinering** for juridisk grense: KI sammenstiller aldri konkluderer; «kan tale for KU», aldri «er KU-pliktig»; ikke-overlapp-regel (foreslår ikke bestemmelser som allerede er sikret av annet lovverk). Server: ny `server/prompts/planportrett.js` registrert i `PORTRAIT_MODULES`. Klient: nye komponenter `PlanportrettView`, `BestemmelsesforslagListe`, `KuScreeningSeksjon`, `ViktigNaturFlagg`. Ny `src/utils/lovdataLenke.js` bygger Lovdata-URL fra kandidat-hjemmel-streng (`pbl § 12-7 nr. 4` → `https://lovdata.no/.../§12-7`). Bug-fix: `LegalReferences` i planportrett brukte `relevanteLover` (rådata) i stedet for `relevanteLoverEnriched` (beriket med sitater fra Kunnskapsbase/) — alle andre views bruker `Enriched`-varianten. |
| 24. jun 2026 | `v0.9-pre-nav-refactor` (tag) | **Backup-anker** før navigasjonsrefactoren. Tag peker på commit `3f3ce21` (siste stabile versjon med 4-stegsflyt der naturportrett var tvunget mellomsteg). Rull tilbake med `git checkout v0.9-pre-nav-refactor` hvis nav-refactoren skaper problemer. |
| 24. jun 2026 | `8409a47`, `d6f3e7f` | **Iterasjon 17 — navigasjonsrefactor + 2×2 portrett-grid.** Slider for influensområde flyttet ut av adressesøket til nytt eget steg 2 med kart + heatmap. Min-radius hevet fra 100 til **200 m**. Portrettype-velger har nå 5 alternativer: naturportrett som **bredt kort øverst** (oversiktsvalget, lysgrønn bakgrunn) + 4 detaljportretter i **2×2 grid** under (`.portrait-type-grid--2x2`). På mobil stacker alle 5 vertikalt. Stegene er nå `Adresse → Influensområde → Portretttype → Portrett`. **Bakgrunnsfetching av species i to faser**: `useSpeciesSearch` løftet til `App.jsx`, henter 200 m straks adressen er valgt (steg 2) og full radius straks brukeren bekrefter (steg 3). Slik er data klart når steg 4 starter generering. **Språkbytte regenererer KI-tekst** automatisk (`sisteGenererSprak.current` i `useRef`). Tre etterslep fra refactoren rettet: (a) InfluenceZoneInfo viste hardkodet «Søker innenfor 500 m» — endret til «Valgt adresse: X» (radius velges på neste steg); (b) modal-teksten «ca. 20 sekunder» var misvisende — endret til vagt formulering med varighetsfaktor-forklaring; (c) språkbytte oppdaterte ikke KI-innhold — fikset via re-generering på sprak-endring. **Per-radius-metrikk** i `/admin/usage`: viser om token-forbruk øker med influensområde (bin på 100 m). |
| 24. jun 2026 | `d96b581` | **Iterasjon 18 — portrett-cache i localStorage (24-timers TTL).** Brukerproblem: språkbytte NO→EN→NO regenererte portrettet hver gang — sløsing av tokens. Også navigering tilbake til et portrett man hadde sett før kostet ny generering. Løsning: ny `src/utils/portraitCache.js` med `lagCacheNokkel()`, `getCache()`, `setCache()`, `cleanupExpired()`. `usePortraitGeneration.generate()` sjekker cache før fetch — hit gir instant retur uten loading-spinner og uten KI-kostnad. Cache-nøkkel bygges av (koordinater 5 desimaler, radius, språk, subject-id/NiN-kode). Prefiks `naturportrett.portrett-cache.*`. `cleanupExpired()` kjøres ved app-start fra `App.jsx`. Ved `QuotaExceededError` ryddes utløpte først, deretter ny forsøk; til slutt hopper vi cache-lagring stille. **Effekt**: språkbytte frem og tilbake bruker cache, navigering tilbake til sett portrett er instant, refresh/cross-tab beholder portrettet innen TTL. Cachen lagrer kun KI-output; species-data hentes fortsatt av `useSpeciesSearch` ved adresse-/radiusendring. |

Presentasjon laget separat i `presentasjon/` (genereres med `python-pptx` via `generate_pptx.py`) — ikke en del av selve appen.

**Rollback-ankre:**

- `v1-presentasjon-2026-06-17` (annotert tag på commit `3ac8f25`) — versjonen brukt på presentasjonen 17. juni
- `v0.9-pre-nav-refactor` (annotert tag på commit `3f3ce21`) — siste stabile versjon før navigasjonsrefactoren 24. juni. Bruk hvis nav-flyt-endringer skaper problemer

```sh
git checkout v0.9-pre-nav-refactor       # lokalt
# eller: Railway-konsoll → Redeploy commit 3f3ce21
```

---

## 4. Problemer vi har løst (feilsøk-referanse)

### 4.1 Anthropic 401 «invalid x-api-key»
**Årsak:** Anthropic-klienten ble opprettet ved modulinnlasting, før `.env` var lest. Senere: nøkkelen var ikke en gyldig nøkkel.
**Løsning:** Opprett klienten *inne i* request-handleren (`new Anthropic({...})` per kall), og bruk en fersk gyldig nøkkel fra console.anthropic.com.

### 4.2 EADDRINUSE port 3001
**Årsak:** Gamle server-prosesser kjørte fortsatt.
**Løsning:** `lsof -ti:5173,3001 | xargs kill -9` før restart. (`killall node` er mindre pålitelig.)

### 4.3 JSON parse-feil / HTTP 502 ved portrett-generering
**Årsak:** Claude returnerte ugyldig/avkortet JSON — særlig naturtypeportrett (mange felter), der svaret ble kuttet ved `max_tokens`.
**Løsning (i `server/routes/claude.js`):**
- `max_tokens` hevet 4000 → **8000**
- `extractBalancedJson()` — teller braces korrekt (ignorerer `}` inne i strenger), salvager avkortet JSON
- `autoFixJson()` — fjerner trailing commas, parser på nytt
- Feilmelding skiller på `stop_reason === 'max_tokens'` (avkortet) vs. annen parse-feil

### 4.4 «This model does not support assistant message prefill»
**Årsak:** Et forsøk på å tvinge JSON-start med `{ role: 'assistant', content: '{' }`. Claude Sonnet 4.6 krever at samtalen *avsluttes med en user-melding* (400 invalid_request).
**Løsning:** Fjernet prefill. Strammet i stedet inn JSON-instruksen i `server/prompts/shared.js` (`JSON_OUTPUT_RULES`).

### 4.5 ProgressBar satt fast på 84 %
**Årsak:** Eksponentialkurve med asymptote på 92 % nådde bare 84 % ved forventet varighet.
**Løsning:** Lineær 0–95 % over forventet varighet, deretter asymptotisk 95–99 %, hopp til 100 % ved fullføring. Stage-tekster i hverdagsspråk (ikke «JSON»/«KI-modell»).

### 4.6 Railway 502 «Application failed to respond» (KRITISK — 22. mai)
**Symptom:** Live-siden (og direkte Railway-URL) ga HTTP 502 med `server: railway-edge` + `x-railway-fallback: true`. Containeren svarte ikke.
**Diagnose:** Deploy-loggen viste at appen startet feilfritt 15. mai og kjørte i 5 dager, så fikk **`SIGTERM`** 20. mai og ble liggende død. **Ikke kodefeil** (verifisert: starter feilfritt lokalt) og **ikke billing** (forbruk $0,19 av $5,00 inkludert).
**Løsning:** En **fersk redeploy** (ny commit → full rebuild). ⚠️ **Viktig gotcha:** Railway sin **«Restart»** restarter bare den samme døde containeren — den fikser ikke en krasjet deploy. Bruk **«Redeploy»** (de tre prikkene `⋯` på deploymenten) eller push en commit for full rebuild.

### 4.7 «Midlertidig feil hos KI-leverandøren»
**Årsak:** Anthropic returnerte 5xx (typisk 529 «overloaded») under høy last. Forbigående.
**Løsning:** `createWithRetry()` i `server/routes/claude.js` — inntil 2 gjenforsøk med økende backoff (1,5 s, 3 s) på 5xx/429. Andre feil (401, 400) kastes umiddelbart.
**Merk:** Under høy last hos Anthropic kan portrett-generering ta 60–90 s (normalt 15–30 s). Progressbaren når ~95 % og kryper til den fullfører — forventet oppførsel.

---

## 5. Deployment

**Plattform:** Railway (Hobby-plan, usage-basert). Auto-deployer ved push til `main`.

**`railway.toml`:**
```toml
[build]
buildCommand = "npm run build:prod"
[deploy]
startCommand = "npm start"
```
`npm start` → `node server/index.js`. Serveren serverer `dist/` (bygget frontend) + API-ruter. Lytter på `process.env.PORT` (Railway setter 8080).

**Miljøvariabel:** `ANTHROPIC_API_KEY` settes i Railway → Variables (ikke i `.env`, som er gitignored og aldri pushes).

**Eget domene (domeneshop.no, kun DNS):**
- CNAME: `naturportrett` → `b86agxgc.up.railway.app` (Railways custom-domain-mål — IKKE den genererte `*-production.up.railway.app`)
- TXT: `_railway-verify.naturportrett` → `railway-verify=…` (verifisering)
- HTTPS-sertifikat utstedes automatisk (Let's Encrypt). Cert-feil `NET::ERR_CERT_COMMON_NAME_INVALID` rett etter oppsett = sertifikatet er ikke ferdig utstedt ennå; vent 5–30 min.

---

## 6. Driftshåndbok (runbook)

**Lokal utvikling:**
```bash
npm install
cp .env.example .env   # legg inn ANTHROPIC_API_KEY
npm run dev:all        # Vite (5173) + Express (3001) parallelt
```

**Bygg:** `npm run build` → `dist/`

**Deploy:** push til `main` → Railway bygger og deployer automatisk.

**Feilsøk «siden er nede» (502):**
1. `curl -s https://naturportrett.figurate.studio/api/health` → forventer `{"status":"ok",...}`
2. Hvis 502 med `x-railway-fallback: true` → containeren er nede.
3. Sjekk Railway → Deployments. Krasjet? → bruk **Redeploy** (ikke Restart), eller push en commit.
4. Sjekk Railway → Usage hvis Redeploy ikke hjelper (kreditt brukt opp?).
5. Verifiser at koden er frisk lokalt: `PORT=3009 node server/index.js` → skal logge «API-server kjører».

**Backup for demo:** Kjør `npm run dev:all` lokalt → `http://localhost:5173`. Fungerer fullt ut (inkl. KI) uavhengig av Railway.

---

## 7. Kjente begrensninger / å huske

- Rødliste/fremmedarts-status dekker kun et utvalg arter (statisk liste), ikke hele Artsdatabanken.
- Naturtyper foreslås av KI, ikke hentet fra autoritativ database (NiN/Naturbase) — må kvalitetssikres.
- Ingen RAG ennå — KI kan hallusinere detaljer. Alle portretter må kvalitetssikres av fagperson.
- Planportrettets kandidat-hjemmel og bestemmelses-skisser er kandidater til verifisering, ikke ferdige juridiske formuleringer.
- Portrett-cache med 24-timers TTL: planportrettets `uttrekksdato`-felt viser opprinnelig dato selv om cache vises neste dag. Akseptabelt for prototype.
- Ingen TypeScript (planlagt v2). Norsk i all UI, engelske variabelnavn i kode.

---

## 8. Planlagt videre (per juni 2026)

- **Juli 2026:** RAG-system (sporbarhet mot Oslo kommunes dokumenter), flere datakilder, bedre output-format, vurdere brukertesting.
- **Naturbase-integrasjon** (Miljødirektoratet) — vil heve viktig-natur- og KU-screeningen i planportrettet fra «observasjonsbasert» til «forvaltningsdatabasert».
- **Artsdatabanken-API** for live rødliste/fremmedartsliste (i dag lokal datafil).
- **Polygon/areal-input** som alternativ til punkt + radius (særlig viktig for planportrett — en plansak har en avgrensning, ikke et punkt).
- **Etter sommeren:** møte med UKE om implementering i kommunens systemer (eller at UKE bygger system med denne prototypen som skisse).
