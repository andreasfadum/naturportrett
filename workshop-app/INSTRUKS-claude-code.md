# Byggeinstruks til Claude Code — Workshop-app (møte 17. juni)

Separat **under-app** for spørreskjema + workshop, i mappa `workshop-app/`. Skal **publiseres og testes live i morgen**.

## STATUS: skjelettet er allerede bygd ✅
Hele appen er ferdig kodet (React + Vite + Express) og syntaks-validert. Filene ligger i `workshop-app/`. Din jobb er **ikke** å bygge fra bunnen, men å **kjøre, verifisere og publisere**:
1. `git checkout -b workshop-app`
2. `cd workshop-app && npm install`
3. Sørg for `ANTHROPIC_API_KEY` (egen `.env` eller arves fra `../.env`).
4. `npm run dev:all` → test lokalt (web 5174, api 3002). Fyll ut skjema, kjør «Generer» og «Avslutt – oppsummer» i Administrator-fanen.
5. Publiser: `npm run build` → `npm start` → `npx cloudflared tunnel --url http://localhost:3002` → QR med `npx qrcode-terminal <url>`.
6. Sjekk akseptansekriteriene nederst. Verifiser at prototypen er urørt (`git status` skal kun vise `workshop-app/`).

Hvis noe må endres/utvides (f.eks. Steg 1 «spiss spørsmål», eller justert design), bruk resten av dette dokumentet som spesifikasjon. Ellers er det meste klart til kjøring.

---

## (Referanse) Hva som er bygd og hvorfor

## 0. Viktigst av alt: IKKE ødelegg Naturportrett-prototypen
- **Additivt only.** All ny kode skal ligge i `workshop-app/`. Ikke endre filer utenfor denne mappa (ikke `src/`, `server/`, rot-`package.json`, `vite.config`, osv.).
- **Egen git-gren:** `git checkout -b workshop-app` før du starter. Ikke commit til hovedgrenen.
- **Egne porter:** frontend `5174`, backend `3002` (prototypen bruker 5173/3001 — ikke kollider).
- **Eget datalager:** `workshop-app/data/*.json`. Ikke rør prototypens data.
- **Eneste tillatte gjenbruk fra rot:** les `ANTHROPIC_API_KEY` fra rot-`.env` (read-only), og kopier `public/oslo-logo.svg` inn i appen. Ikke endre rot-`.env`.
- Når du er ferdig: appen skal kunne slettes ved å fjerne `workshop-app/` uten spor i prototypen.

## 1. Kilder (sannhetskilde for innhold — IKKE finn opp på nytt)
Hent alt innhold herfra:
- **`workshop/10-skjema-generering-FINAL.md`** — flyt, spørsmål (Del A), genererings-prompt (Del B), reserve-oppgaver (Del C), Claude Code-arkitektur (Del E), oppsummerings-prompt (Del F).
- **`workshop/demo-naturportrett-workshop.html`** — en **fungerende referanse-implementasjon**. Spørsmål, tilpassede bolker per rolle, de 5 workshop-oppgavene, genererings-prompt (`PROMPT_TEXT`) og oppsummerings-prompt (`SUMMARY_PROMPT`) ligger ferdig i `<script>`. **Port denne logikken** til React; ikke skriv om spørsmålene.
- **`public/oslo-logo.svg`** (mørkeblå) / den hvite Oslo-logoen i `Oslo visuell identitet/...Oslo-logo-hvit-RGB.svg` — bruk hvit på mørk header.
- **`src/index.css`** i prototypen — gjenbruk Oslo-paletten (`--oslo-*`) og Oslo Sans hvis enkelt; ellers bruk fargene fra demoen (`--oslo:#2A2859`).

## 2. Teknisk oppsett
```
workshop-app/
  package.json            # egne avhengigheter, egne scripts
  vite.config.js          # base: './', server.port 5174, proxy /api -> http://localhost:3002
  index.html
  src/                    # React-frontend (Vite)
    main.jsx, App.jsx
    components/  (Skjema, Workshop, Admin, Header)
    data/questions.js     # generelle + tilpassede spørsmål (fra demoen)
    data/tasks.js         # de 5 workshop-oppgavene
  server/
    index.js              # Express på 3002, serverer API + (i prod) dist/
    claude.js             # kall mot Anthropic via ANTHROPIC_API_KEY
    prompts.js            # generate- og summarize-prompt (fra Del B/F)
  data/                   # innsamlede svar (gitignored)
    responses.json, answers.json
  public/oslo-logo-hvit.svg
  .gitignore              # node_modules, data/, dist/
  README.md               # hvordan kjøre + publisere
```
- Frontend: **React + Vite**, port 5174. Vite-proxy `/api` → `http://localhost:3002`.
- Backend: **Express**, port 3002. Filbasert lagring i `data/` (ingen database).
- I produksjon/live-test: Express serverer den bygde frontenden (`dist/`) **og** API-et på samme port (3002), slik at bare **én port** må eksponeres via tunnel.

## 3. Datamodell
```js
// responses.json — ett objekt per deltaker
{ tidspunkt, etat, stilling, epost: string|null, svar: [{ spørsmål, svar }] }
// answers.json — ett objekt per gruppe
{ tidspunkt, gruppe, besvarelser: [{ oppgave, besvart: bool, svar }] }
```
Personvern: **ingen navn**. Etat + stilling for analyse. **E-post lagres kun** for dem som aktivt krysser av for å bidra (påkrevd da), og brukes bare til oppfølging.

## 4. Endepunkter (Express, port 3002)
- `POST /api/submit` → lagre én deltakerbesvarelse i `responses.json`.
- `POST /api/answers` → lagre én gruppes workshop-svar i `answers.json`.
- `GET /api/admin` → returner antall + lister (for admin-siden).
- `POST /api/generate` → **Steg 2:** bygg generings-prompten (Del B / demoens `PROMPT_TEXT`) + alle `responses`, kall Claude (`claude-sonnet`, maks ~700 tokens, timeout 90 s), returner markdown med **5** paroppgaver. Ved feil/timeout: returner **reserve-oppgavene** (Del C). 
- `POST /api/summarize` → **Del F:** bygg oppsummerings-prompten + alle `responses` + alle `answers`, kall Claude, returner (a) kort oppsummering og (b) sortert arkiv (tema, «savnet/oversett», kontaktliste m/e-post, workshop).
- `POST /api/sharpen` (valgfritt, Steg 1) → ta plenums-transkripsjon, foreslå spissede spørsmål (tilpasningslogikk i `04-...` Del 4). Vis som forslag til godkjenning; baseline står hvis droppet. *Kan utelates for v1 hvis tiden er knapp.*
- `POST /api/reset` (kun lokalt/admin) → tøm `data/`.

## 5. Sider/UI (port 5174 i dev)
**Header (alle sider):** hvit Oslo-logo + «Oslo kommune / Plan- og bygningsetaten» + tydelig **«TIDLIG PILOTFASE»**-merkelapp + én linje om at prosjektet er i tidlig pilotfase. (Se demoens header.)

**1 · Spørreskjema (deltaker):**
- Velg **etat** + **stilling** → vis generelle spørsmål + **tilpasset bolk med dynamisk overskrift «Tilpassede spørsmål — \<rolle\>»** og en linje om at spørsmålene gjelder valgt rolle.
- 10–15 spørsmål, multiple choice + valgfri fritekst. Inkluder det frie feltet «Hva har vi oversett, eller hva savner du?».
- Spørsmålet om idéer: bruk formuleringen **«inspirasjon vs. normativ anbefaling»** (se demoen) — ikke «KI-genererte ideer (ikke anbefalinger)».
- «Vil du bidra videre?» → hvis avkrysset, **e-post påkrevd** før innsending.
- Send inn → POST `/api/submit`.

**2 · Workshop (gruppe, 2 og 2):**
- Vis **5 oppgaver** (fra Steg 2-generering hvis tilgjengelig, ellers reserve). **Gruppene velger selv** hvilke de besvarer — kryss av per oppgave.
- Hver valgt oppgave: digitalt svarfelt **eller** notér at de løste den på papir.
- Send inn → POST `/api/answers`.

**Admin (Andreas):**
- Antall skjemasvar + tabell; antall som la igjen e-post.
- Knapp **«Generer workshop-oppgaver»** → POST `/api/generate` → vis de 5 oppgavene (≤ ~2 min; spinner). Reserve vises alltid som fallback.
- Antall workshop-svar + tabell.
- Knapp **«Avslutt – oppsummer»** → POST `/api/summarize` → vis oppsummering + arkiv; mulighet for nedlasting (JSON + markdown).
- Reserve-oppgaveliste (5) alltid synlig.

## 6. To KI-steg (oppsummert)
- **Steg 1 (valgfritt):** transkripsjon → spiss spørsmålene før utfylling.
- **Steg 2 (kjernen):** svar → generer 5 workshop-oppgaver, **ingen pause**, mål ~2 min, reserve-fallback.
- **Avslutning:** alle svar → oppsummering + sortert arkiv (komplette svar + kort oppsummering av hva det kom mest inn på og hva som savnes).

## 7. Publisering for live-test i morgen
1. `cd workshop-app && npm install`
2. Sørg for at `ANTHROPIC_API_KEY` finnes (les fra rot-`.env`, eller egen `workshop-app/.env`).
3. Bygg frontend: `npm run build` (Vite → `dist/`).
4. Start server som serverer `dist/` + API: `npm start` (Express på 3002).
5. Eksponer **kun port 3002** via tunnel (ingen konto kreves):
   `npx cloudflared tunnel --url http://localhost:3002`  (alternativt `ngrok http 3002`)
6. Lag QR av tunnel-URL-en: `npx qrcode-terminal <https://...trycloudflare.com>` og vis på skjerm.
7. Test: åpne URL på mobil, fyll ut, sjekk at svar lagres i `data/`, kjør «Generer» og «Avslutt – oppsummer».
- Fallback hvis tunnel/nett feiler: kjør lokalt og bruk den statiske demoen + manuell innliming i Claude. Reserve-oppgavene gjør at workshopen aldri står uten innhold.

## 8. Akseptansekriterier (sjekk før møtet)
- [ ] Prototypen kjører fortsatt uendret (start den og verifiser — `workshop-app` skal ikke ha rørt den).
- [ ] Skjema viser Oslo-logo + PBE + pilot-merking.
- [ ] Tilpasset bolk har dynamisk rolle-overskrift.
- [ ] E-post kreves når man velger å bidra; ellers ikke.
- [ ] «Generer» gir 5 oppgaver innen ~2 min, og reserve vises ved feil/timeout.
- [ ] «Avslutt – oppsummer» gir kort oppsummering + sortert arkiv med komplette svar.
- [ ] Ingen navn lagres; e-post kun ved samtykke.
- [ ] Appen er på egen git-gren; rot-filer urørt (`git status` viser kun `workshop-app/`).

## 9. Generings- og oppsummerings-prompt
Bruk ordrett prompten i `workshop/10-skjema-generering-FINAL.md` Del B (5 oppgaver) og Del F (oppsummering), eventuelt `PROMPT_TEXT` og `SUMMARY_PROMPT` fra demoen. Krav: norsk, kort, forankret i faktiske svar, ingen oppdiktede sitater, reserve-fallback.
