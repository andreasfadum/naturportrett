# Naturportrett — Workshop-app (møte 17. juni)

Separat under-app for spørreskjema + workshop. **Rører ikke Naturportrett-prototypen.** Egne porter (web 5174, api 3002), eget datalager (`data/`).

## Kjør lokalt (utvikling)
```bash
cd workshop-app
npm install
cp .env.example .env        # legg inn ANTHROPIC_API_KEY (eller la den arves fra ../.env)
npm run dev:all             # web på http://localhost:5174, api på http://localhost:3002
```

## Publiser for live-test (én port via tunnel)
```bash
npm run build               # bygger frontend til dist/
npm start                   # Express serverer dist/ + API på port 3002
# i et eget terminalvindu — eksponer KUN port 3002:
npx cloudflared tunnel --url http://localhost:3002
# vis QR av tunnel-URL-en:
npx qrcode-terminal https://DIN-URL.trycloudflare.com
```
Deltakerne skanner QR → fyller ut på mobil. Andreas styrer Steg 2 (generer) og oppsummering fra Administrator-fanen.

## Flyt
1. **Spørreskjema** — etat/stilling → generelle + tilpassede spørsmål (multiple choice + fritekst).
2. **Generer** (admin) — lager 5 workshop-oppgaver fra svarene (~2 min; reserve-fallback ved feil).
3. **Workshop** — grupper (2 og 2) velger selv hvilke oppgaver de besvarer, digitalt eller på papir.
4. **Avslutt – oppsummer** (admin) — kort oppsummering + sortert arkiv av alle svar.

## Personvern
Ingen navn lagres. Etat + stilling for analyse. E-post lagres **kun** for dem som aktivt velger å bidra (samtykke).

## Isolasjon / trygghet
- Jobb på egen gren: `git checkout -b workshop-app`.
- Alt ligger i `workshop-app/`. `git status` skal kun vise denne mappa.
- Slett appen ved å fjerne mappa — prototypen er urørt.
