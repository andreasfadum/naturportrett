# Naturportrett — Utviklingslogg

> **Formål:** Denne loggen er en referanseressurs for hvordan prosjektet er bygget — arkitekturvalg, problemer vi har løst, og driftsoppsett. Den påvirker ikke kjøretid (ren dokumentasjon). Bruk den ved feilsøk, onboarding, eller når historikk trengs. Oppdateres ved milepæler, ikke ved hver endring.

Sist oppdatert: 22. mai 2026

---

## 1. Hva prosjektet er

Webapplikasjon for Oslo kommune (Plan- og bygningsetaten) som hjelper arkitekter, eiendomsutviklere og saksbehandlere med å identifisere biologisk mangfold innenfor influensområdet (500 m) til en eiendom under utvikling.

**Live:** https://naturportrett.figurate.studio
**Repo:** github.com/andreasfadum/naturportrett

Tjenesten lager fire produkttyper:
- **Naturportrett** — områdeoversikt (auto-generert etter adressesøk)
- **Naturtypeportrett**, **Artsportrett**, **Planteportrett** — detaljutdypninger man kan generere fra naturportrettet

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
| 21. jun 2026 | (denne commit) | **Iterasjon 9** — Pbl-paragrafer viste rå Lovdata-markdown i UI: markdown-lenker `[tekst](url)` ble vist som plaintekst og tabellrader/separatorer (`| --- | --- |`, `\| 0 \| Endret ved lover...\|`) lekket inn i sitatet. Fix: ny `cleanSitat()` i `scripts/build-lover-index.js` fjerner tabell-separatorer + endringshistorikk-rader og konverterer nummererte tabellrader til lesbar prosa. Ny `renderSitat()`-helper i `LegalReferences.jsx` konverterer markdown-lenker til klikkbare `<a>`-elementer (target=_blank). |

Presentasjon laget separat i `presentasjon/` (genereres med `python-pptx` via `generate_pptx.py`) — ikke en del av selve appen.

**Rollback-anker:** `v1-presentasjon-2026-06-17` (annotert tag på commit `3ac8f25`) er den versjonen som ble brukt 17. juni. Bruk denne hvis senere iterasjoner svikter:

```sh
git checkout v1-presentasjon-2026-06-17   # lokalt
# eller: Railway-konsoll → Redeploy commit 3ac8f25
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
- Naturtyper foreslås av KI, ikke hentet fra autoritativ database (NiN) — må kvalitetssikres.
- Ingen RAG ennå — KI kan hallusinere detaljer. Alle portretter må kvalitetssikres av fagperson.
- Ingen TypeScript (planlagt v2). Norsk i all UI, engelske variabelnavn i kode.

---

## 8. Planlagt videre (per mai 2026)

- **Juli 2026:** RAG-system (sporbarhet mot Oslo kommunes dokumenter), flere datakilder, bedre output-format, vurdere brukertesting.
- **Etter sommeren:** møte med UKE om implementering i kommunens systemer (eller at UKE bygger system med denne prototypen som skisse).
