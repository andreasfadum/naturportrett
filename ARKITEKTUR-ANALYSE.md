# Arkitekturanalyse — Naturportrett

> Vurdering av logiske svakheter, effektiviseringspotensial og forbedringsmuligheter i kildekoden, gjennomført 25. juni 2026. Dokumentet er et beslutningsgrunnlag — det utfører ingen endringer.

---

## Sammendrag

Naturportrett er bygget som en pragmatisk prototype med solid kjernearkitektur — modell-fallback, prompt-komposisjon fra `shared.js`, rene cache-utility-er og en flat steg-flyt — men har vokst raskt og samler nå svakheter som vil tynge videreutviklingen. De fire mest alvorlige funnene er **manglende input-validering på `/api/claude/portrait`**, **fraværende rate-limiting på admin-endepunkter**, **DetailPortraitSection.jsx (527 linjer) som har vokst over én komponents ansvar**, og **ingen automatiserte tester**.

Estimert arbeid for å lukke kritiske og middels svakheter: **~20 timer**. Ingen av funnene er showstoppere, men en innsats nå reduserer både drifts- og videreutviklingsrisiko betydelig.

| Sett kategori | Funn | Anbefalt rekkefølge |
|---|---|---|
| 🔴 Kritisk | 4 | Først (~6 t) |
| 🟡 Middels | 7 | Deretter (~10 t) |
| 🟢 Lav | 5 | Når det passer (~4 t) |

---

## Metode

To parallelle analyser dekket henholdsvis:

1. **Frontend** — `src/`: state-arkitektur, hooks, komponentstørrelse, ytelse, CSS, type-sikkerhet, tester, bygg
2. **Backend + prompts + sikkerhet** — `server/`: routing, KI-prompts, input-validering, sikkerhet, drift, modell-fallback

Funnene er prioritert etter forventet konsekvens × sannsynlighet × kostnad å fikse.

---

## Styrker (det vi skal beholde)

- **Modell-fallback-kjede** Sonnet → Opus → Haiku ved 404 + retry med backoff på 5xx/429 i [server/routes/claude.js:245-287](server/routes/claude.js#L245-L287) er robust.
- **Prompt-komposisjon fra `shared.js`** — alle portretttyper bygger system-prompt fra delte konstanter (`ANTI_HALLUSINERING`, `SYMBIOSE_FIELD`, `TILTAK_FIELD`, …). Ingen copy-paste. [server/prompts/shared.js](server/prompts/shared.js).
- **Cache-arkitektur** i `portraitCache.js` og `speciesCache.js` har konsistent TTL + quota-håndtering + cleanup ved app-start. Stabil base som kan abstraheres videre.
- **i18n-systemet** (`useT()` + `<SprakProvider>` + `BADGE_LABEL_KEYS`) holder norsk som intern stabil ID og engelsk som visningslag — godt skille mellom data og presentasjon.
- **Lovbase-pipelinen** sentralisert (`server/lover/index.js` med in-memory cache, 412 KB total). Riktig modell — KI får aldri tolke jus.
- **CORS-policy** restriktiv (whitelist, ingen wildcard) i [server/index.js](server/index.js).
- **Subject-/portrett-cache + species-cache** sikrer at navigering mellom portretter ikke koster tokens. Korrekt mønster.

---

## 🔴 Kritiske funn (gjør først)

### K1 — Ingen input-validering på `/api/claude/portrait`

**Filsti:** [server/routes/claude.js:96-107](server/routes/claude.js#L96-L107)

Endepunktet validerer kun at `portraitType` er kjent. `payload` slippes gjennom uten typesjekk, størrelsessjekk eller verdigrenser. Konkret risiko:

- `zoneRadiusM` er ubegrenset. En klient kan sette 50 000 m og generere ~50× normal token-bruk per kall.
- Manglende `address.representasjonspunkt` gir kryptisk feil dypt i pipelinen, ikke 400.
- Egen-skrevne `observedSpecies` med vilkårlig innhold kan gi prompt-injeksjon (selv om risikoen er moderat siden Claude er resistent).

**Konsekvens:** Token-/USD-eksplosjon ved misbruk, dårlig feilmelding ved feilbruk.

**Anbefaling:** Zod- eller Yup-schema for payload per portretttype:
- `zoneRadiusM`: integer 200–2000
- `address.representasjonspunkt`: { lat: -90..90, lon: -180..180 }
- `lang`: enum ['no', 'en']
- `species.id` (for arts-/planteportrett): string max 64 tegn
- Returner 400 med klar feilmelding

### K2 — `express.json()` uten størrelsesgrense

**Filsti:** [server/index.js:29](server/index.js#L29)

Default Express-grensen er 100 KB, men ikke satt eksplisitt. En klient kan sende en stor payload som spiser server-minne før den ankommer claude-routen.

**Anbefaling:** `app.use(express.json({ limit: '5mb' }))` (satt 25. juni 2026).

⚠️ **IKKE senk grensen til 10 KB / 100 KB.** Den opprinnelige anbefalingen («10 KB er romslig, payload-en er 1–3 KB») var feil: portrett-flyten sender HELE den sammenslåtte artslista i `topSpecies` (`NaturportrettSection.jsx` → `usePortraitGeneration.js`). Med GBIF- og iNaturalist-limit på 200 hver, og fire foto-URLer per art (~700 byte/art), passerer payloaden 100 KB allerede ved ~140 arter — vanlig for influensområder på 500 m+ i Oslo. Default-grensen ga derfor HTTP 413 (Payload Too Large) i produksjon. 5 MB dekker selv de største artslistene med god margin. Vil man stramme inn igjen, må man først flytte arts-payloaden ut av request-body (f.eks. la serveren hente arter selv ut fra koordinater + radius) — ellers gjeninnføres 413.

### K3 — Ingen rate-limiting på admin-endepunkter

**Filsti:** [server/routes/feedback.js:147](server/routes/feedback.js#L147), [server/routes/usage.js](server/routes/usage.js)

Etter dagens sikkerhetsforbedring krever admin-rutene env-passord (503 hvis ikke satt). Men hvis passordet er satt, har vi ingen vern mot brute-force. Repoet er offentlig — angriper kan se nøyaktig hvilket header-format (`x-workshop-admin`) som forventes.

**Anbefaling:** `express-rate-limit`-middleware: maks 10 forsøk per IP per 15 min på admin-rutene. Vurder IP-lockout etter 30 feilforsøk.

### K4 — DetailPortraitSection.jsx er gått ut over sitt ansvar (527 linjer)

**Filsti:** [src/components/detail-portrait/DetailPortraitSection.jsx](src/components/detail-portrait/DetailPortraitSection.jsx)

Komponenten håndterer:
- Subject-picker for tre typer (arter, planter, naturtyper) + planportrett-intro
- Tre filter-akser (kategori, status, datakvalitet)
- Bekreftelses-modal med Esc-håndtering
- Auto-trigger av regenerering ved språkbytte
- Cache-hit-logikk ved «allerede laget»-klikk
- Routing til fire view-komponenter (Arts/Plante/Naturtype/Plan)

Konsekvens: hver endring i én av disse risikerer å påvirke de andre. Bug-flåten i siste uker (auto-trigger-bug, picker-skjules-bug, glemmer-subject-bug) er direkte symptom på dette.

**Anbefaling:** Ekstraher tre komponenter:
- `<SpeciesPicker>` — filtrering + grid + markering
- `<ConfirmationModal>` — modal med Esc + autofocus
- `<DetailPortraitRouter>` — velger riktig view basert på `portraitType`

DetailPortraitSection blir igjen tynnere orchestrator. Estimat 2 t, men reduserer fremtidig bug-risiko markant.

---

## 🟡 Middels-funn (gjør deretter)

### M1 — Ingen automatiserte tester

**Status:** Ingen `*.test.js`, ingen Vitest/Jest-konfig.

For et prosjekt på 4 600+ linjer komponentkode + server-pipeline med cache, fallback og SSE er testfri kode en betydelig risiko. Hver refactor er manuell verifikasjon, og regresjoner (som auto-trigger-bug forrige uke) oppdages først av brukeren.

**Topp-5 test-kandidater (rangert etter ROI):**
1. **`speciesAggregator.js`** — `priorityScore`-beregning + deduplisering (pålitelighetsgrunnlag for hele tjenesten)
2. **`portraitCache.js` + `speciesCache.js`** — TTL-logikk + cleanup + quota-fallback
3. **`usePortraitGeneration` SSE-parsing** — frame-deteksjon + portrait/error-handling
4. **`useSpeciesSearch` cache-flyt** — cache-hit instant, miss kjører fetch
5. **`server/routes/claude.js extractBalancedJson + autoFixJson`** — avkortet JSON-salvage (kritisk når Claude treffer max_tokens)

**Anbefaling:** Vitest + React Testing Library. Start med utils-laget (`portraitCache`, `speciesAggregator`, `lovdataLenke`) — billigst og raskest.

### M2 — IP-adresser lagret uanonymisert i usage-logg

**Filsti:** [server/usage/index.js](server/usage/index.js)

`claude-usage.jsonl` lagrer brukerens IP per kall. I GDPR-sammenheng er full IP en personopplysning. Filen vokser også ubegrenset uten rotasjon.

**Anbefaling:**
- Anonymiser ved logging: hash IP eller fjern siste oktet (`192.168.1.x`)
- Innfør rotasjon: arkiver eller slett innslag eldre enn 90 dager
- Vurder å logge en sesjons-ID i stedet for IP (genereres frontend per sesjon)

### M3 — Duplisering mellom portrett-view-komponentene

**Filsti:** [src/components/detail-portrait/Arts/Plante/Naturtype/PlanportrettView.jsx](src/components/detail-portrait)

Alle fire har identisk boilerplate:
- `<InformasjonsbaseBanner />`
- `<header>` med tittel + dato + logo
- Plassering av `<PortrettMetadata>`, `<LegalReferences>`, `<FeedbackKnapp>`

**Anbefaling:** `<PortraitLayout title subject portrait>{children}</PortraitLayout>`-wrapper. Vil halvere boilerplate-kode og gjøre fremtidige endringer (f.eks. ny banner-tekst) til én-fil-endring.

### M4 — Cache-mønstret duplisert mellom hooks

**Filsti:** [src/hooks/usePortraitGeneration.js:30-36](src/hooks/usePortraitGeneration.js) og [src/hooks/useSpeciesSearch.js:24-31](src/hooks/useSpeciesSearch.js)

Begge implementerer samme «sjekk cache → hvis hit returner instant; ellers fetch → lagre»-mønster.

**Anbefaling:** Generisk `useCachedFetch(key, fetcher, cacheModule)`-hook i `src/hooks/`. Reduserer fremtidig vedlikehold og gjør det enkelt å legge til nye cachede ressurser.

### M5 — Ingen runtime-typevalidering av KI-respons eller eksterne API-er

KI-output mappes til UI uten validering. Endring i prompt eller modell-oppførsel kan gi `undefined`-felter som krasjer view-komponenter.

**Anbefaling:** Zod-schema for hver portretttype + GBIF/iNaturalist-responsen. Hvis validering feiler, vis tydelig feilmelding med fallback i stedet for krasj.

Lavere terskel-løsning: PropTypes på toppnivå-komponentene. JS-tools får da minimal type-feedback uten å migrere til TypeScript.

### M6 — `src/index.css` 3 921 linjer i én fil

**Filsti:** [src/index.css](src/index.css)

BEM-konvensjonen følges godt, men én monolittisk fil bremser navigering og PR-reviewen. Mindre risiko isolert sett, men signifikant friksjon over tid.

**Anbefaling:** Splitt i `styles/`-katalog: `base.css` (variabler + reset), `components/portrait.css`, `species-card.css`, `modal.css`, `layout/`, `responsive.css`. Import alle fra index.css. Kan gjøres gradvis.

### M7 — SSE-stream cleanup ved client-disconnect ikke verifisert

**Filsti:** [server/routes/claude.js:245-287](server/routes/claude.js#L245-L287)

Når en klient kobler ned midt i streamingen, er det uklart om Anthropic-streamen aborteres på serversiden. Hvis den fortsetter, fortsetter token-forbruket etter at brukeren forlot siden.

**Anbefaling:** Legg eksplisitt `req.on('close', () => stream.abort?.())`-handler. Verifiser i Anthropic SDK at stream.abort eksisterer eller bruk AbortController.

---

## 🟢 Lav-funn (når det passer)

### L1 — Eldre `/api/claude/`-endpoint potensielt ubrukt

**Filsti:** [server/routes/claude.js:28-87](server/routes/claude.js#L28-L87)

Den eldre vurderings-rute som brukte `biodiversity.SYSTEM_PROMPT`. `RecommendationsSection` på frontend bruker den fortsatt, men flyten er ikke synlig i hovedbruken.

**Anbefaling:** Sjekk om noen sti i UI fortsatt aktivt bruker den. Hvis ikke: marker deprecated, fjern i neste større refactor.

### L2 — `fuse.js` i `package.json` ikke synlig brukt

Frontend-rapporten fant ingen aktive importer av `fuse.js`. Den ble lagt inn for klientside-re-rangering av adressesøk-resultater.

**Anbefaling:** Verifiser med `grep -rn "from 'fuse.js'" src/` — fjern fra `package.json` hvis dødt.

### L3 — `SpeciesCard` mangler `React.memo`

Listene har potensielt mange kort (top 25 species). Hver re-render bygger nye onClick-closures.

**Anbefaling:** Wrap i `React.memo()`. Lav prioritet siden listen er liten, men billig fix.

### L4 — `vite.config.js` mangler manualChunks-konfig

Bygg-output gir advarsel om chunk-størrelse. Hovedbundle er ~500 KB.

**Anbefaling:** Splitt Leaflet/leaflet.heat i egen chunk siden den er stor og bare brukes på enkelte sider.

### L5 — Health-endepunkt eksponerer modell-fallback-kjede

**Filsti:** [server/index.js](server/index.js)

`GET /api/health` returnerer `{ status, model, modelChain }`. Modell-navn er offentlig info uansett, men angriper kan forutsi når fallback aktiveres.

**Anbefaling:** Returner bare `{ status: 'ok' }` på offentlig health-endepunkt. Behold detaljer i en passordbeskyttet variant.

---

## Effektivisering (ytelse + drift)

| Område | Status nå | Forbedringspotensial |
|---|---|---|
| **Portrett-cache** | localStorage 24t TTL — fungerer godt | Vurder cross-device-cache (server-side opt-in) i v2 |
| **Species-cache** | localStorage 24t TTL — fungerer godt | Samme |
| **Lovbase** | In-memory på serveren, 412 KB | Akseptabel; TTL eller `fs.watch` for hot reload kan vurderes |
| **Bundle** | 500 KB JS + 80 KB CSS | Leaflet i egen chunk; lazy-load HeatmapPage |
| **Modell-fallback** | Robust, men hver fallback koster ekstra rundtid | Lavere prioritet — fungerer som det skal |
| **SSE-heartbeat** | Hver ~500 ms — holder Railway-proxy levende | Akseptabel; ingen endring nødvendig |
| **Token-/USD-sporing** | Lagrer per kall — gir god innsikt | Mangler rotasjon (M2-funn) |

**Konkret ytelseseffekt forventet hvis alle anbefalinger implementeres:**

- Bundle ~500 KB → ~350 KB hovedchunk + 150 KB lazy (Leaflet/heatmap kun ved behov)
- Server-RAM-fotavtrykk uendret (lovbase + node ≈ 200 MB)
- Klient-rendrer-ytelse: lite endring (er allerede god)

Effektivisering er **ikke** hovedgevinsten — vedlikeholdbarhet og sikkerhet er det.

---

## Anbefalt handlingsplan

### Fase 1 (~6 timer) — kritiske

1. K2: `express.json({ limit: '10kb' })` (5 min)
2. K1: Zod-schema-validering på `/api/claude/portrait` (2 t)
3. K3: `express-rate-limit` på admin-endepunkter (1 t)
4. K4: Ekstraher SpeciesPicker + ConfirmationModal fra DetailPortraitSection (3 t)

**Resultat:** Token-budget beskyttet, admin-brute-force-vanskelig, en av de mest bug-utsatte komponentene splittet.

### Fase 2 (~10 timer) — middels

1. M1: Vitest + 5 unit tests på utils-laget (4 t)
2. M3: `<PortraitLayout>` for de fire detalj-views (2 t)
3. M2: IP-anonymisering + 90-dagers rotasjon på `claude-usage.jsonl` (1 t)
4. M4: `useCachedFetch`-hook (1,5 t)
5. M7: SSE-cleanup-handler ved client-disconnect (0,5 t)
6. M5: Zod på portrett-respons fra KI (1 t)

**Resultat:** Kontinuerlig integrasjon mulig, halvert boilerplate i view-laget, GDPR-trygg logg.

### Fase 3 (~4 timer) — lav prioritet

1. L1: Fjern eldre `/api/claude/`-endepunkt
2. L2: Verifiser/fjern `fuse.js`
3. L3: `React.memo(SpeciesCard)`
4. L4: Vite manualChunks
5. L5: Skjul modelChain fra health-endepunkt
6. M6: Splitt index.css i moduler

---

## Konklusjon

Naturportrett er bygget med god dømmekraft — kjernekonseptene er solide og ingen del er fundamentalt feil. Men prosjektet er nå i en overgang fra prototyp til verktøy som flere mennesker bruker, og de samme valgene som var smarte i prototyp-fasen (én DetailPortraitSection, ingen tester, generøse defaultverdier) blir gradvis vedlikeholdsbyrde.

**Mitt råd:** prioriter Fase 1 før GBIF-juryen åpner repoet etter innlevering fredag. Fase 2 i juli–august parallelt med RAG-arbeidet. Fase 3 ved naturlige anledninger.

Av alle funn er **mangelen på tester** den eneste som vil ramme deg gjentatte ganger fremover. Det er også den enkleste å starte med — én utils-test på `portraitCache.js` i kveld vil oppleves som lite arbeid, og åpner døren for flere når de trengs.
