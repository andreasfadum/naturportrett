# Naturportrett

Webapplikasjon for Oslo kommune (Plan- og bygningsetaten) som hjelper arkitekter, eiendomsutviklere og saksbehandlere med å identifisere biologisk mangfold innenfor influensområdet (default 500 m, konfigurerbart 100 m – 2 km) til en eiendom under utvikling.

**Live:** https://naturportrett.figurate.studio

## For hvem

- Arkitekter og eiendomsutviklere
- Saksbehandlere i Plan- og bygningsetaten og andre Oslo-etater
- Reguleringsplanleggere
- Faglige rådgivere som skal bygge naturhensyn inn i tidligfase

## Hva prototypen gjør

Verktøyet bygger et beslutningsgrunnlag i fire steg:

1. **Adresse** — søk i hele Norge (default Oslo), justér influenssone med slider
2. **Naturportrett** — KI-syntese av eiendomskontekst, naturtyper, observerte arter, økologiske sammenhenger, lovgrunnlag, forvaltningsråd og datakvalitets-vurderinger
3. **Portretttype** — velg naturtype, dyreart eller plante for fordypning
4. **Detaljportrett** — spesifikk gjennomgang med tiltakshierarki (lovstyrt krav vs. frivillig forbedring), næringskilder med lokal forekomst, symbioser og praktiske designtiltak

Se [FUNKSJONER.md](FUNKSJONER.md) for en fullstendig oversikt over hva som ligger i prototypen.

## Tekniske egenskaper

- **Tospråklig** (norsk/engelsk) med språkbryter i toppen
- **GBIF og iNaturalist** som primære artskilder, sortert etter datakvalitet (recency + observasjonsantall + verifiseringsnivå)
- **Heatmap-overlay** i naturportrettets kart (default på, toggle av/på) — viser tetthet av arts-observasjoner i området rundt eiendommen
- **Naturtype-tabell med avhengige arter** — KI lister konkrete arter som er avhengige av hver naturtype, med anti-hallusinerings-regel
- **Lokalt indeksert lovbase** med 5 lover/forskrifter (naturmangfoldloven, plan- og bygningsloven, friluftsloven, forvaltningsloven, SAK10) — paragrafer siteres ordrett fra Lovdata
- **Anti-hallusinering** som overordnet KI-prinsipp — utelat heller enn å gjette
- **Modell-fallback-kjede** (Sonnet → Opus → Haiku) for robusthet ved modell-deprekering
- **Token- og kostnadssporing** med admin-side
- **Brukerinnspill-system** med e-postrouting via Resend
- **PDF-eksport** med A4-tilpasset print-CSS

## Installasjon

**Forutsetning:** Node.js 20 eller nyere.

```bash
npm install
cp .env.example .env
# Legg inn ANTHROPIC_API_KEY i .env
npm run dev:all
```

Åpne http://localhost:5173.

## Miljøvariabler

| Variabel | Beskrivelse | Påkrevd |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API-nøkkel fra console.anthropic.com | Ja |
| `PORT` | Express-port (default 3001) | Nei |
| `RESEND_API_KEY` | For e-post-routing av tilbakemeldinger | Nei |
| `FEEDBACK_RECIPIENT_EMAIL` | Mottaker for brukerinnspill | Nei |
| `WORKSHOP_ADMIN_PASSWORD` | Passord for `/admin/feedback` og `/admin/usage` | Nei (default: `naturportrett`) |
| `WORKSHOP_DATA_DIR` | Path for persistent lagring (Railway: `/data`) | Nei |

## Prosjektstruktur

```
src/
  components/        React-komponenter (address, naturportrett, detail-portrait, portrait-shared, layout, feedback, admin, legal)
  hooks/             React-hooks (useAddressSearch, useSpeciesSearch, usePortraitGeneration)
  services/          API-klienter (kartverket, inaturalist, gbif, speciesAggregator)
  utils/             Hjelpefunksjoner (norwegianText, osloGronnstrukturer, speciesCategories)
  i18n/              Tospråklighet (translations.js + useT-hook + SprakProvider)
  pages/             Heatmap-side
server/
  routes/            Express-routere (claude, sources, feedback, usage)
  prompts/           KI-prompts pr portretttype + shared.js med anti-hallusinerings-prinsipp
  lover/             Berikelse av paragrafreferanser med Lovdata-sitater
  usage/             Token- og kostnadssporing
Kunnskapsbase/       Lovdata-markdown-filer + indekserte JSON-filer
kunnskapskilder/     JSON-konfigurasjon for datakilder
samarbeid-BYM/       Korrespondanse med Bymiljøetaten
samarbeid-KLI/       Korrespondanse med Klimaetaten
samarbeid-GBIF/      Vurdering av Ebbe Nielsen Challenge-søknad
workshop-app/        Underapp brukt på workshop 17. juni 2026
workshop/            Møtereferat og brukerinnspill fra workshops
svar-radata/         Frossen rådata fra spørreskjemaer (gitignored)
presentasjon/        Slide-materiale
```

## Sentrale dokumenter

- **[FUNKSJONER.md](FUNKSJONER.md)** — komplett funksjonsoversikt
- **[DEVLOG.md](DEVLOG.md)** — kronologisk endringshistorikk
- **[CLAUDE.md](CLAUDE.md)** — instruksjoner for KI-assistenter som jobber på prosjektet

## Designsystem

Følger Oslo kommunes visuelle identitet:
- [designmanual.oslo.kommune.no](https://designmanual.oslo.kommune.no)
- Oslo Sans (selvhostet WOFF2)
- Oslo-palett som CSS-variabler (`--oslo-*` i `src/index.css`)

## API-nøkler / eksterne tjenester

| Tjeneste | Nøkkel nødvendig | Brukes til |
|---|---|---|
| Anthropic Claude | **Ja** | KI-syntese av portretter |
| Resend | Nei (anbefales) | E-post-routing av brukerinnspill |
| Kartverket adresse-API | Nei | Adressesøk i hele Norge |
| iNaturalist | Nei | Foto, norske navn, peer-verifiserte artsobservasjoner |
| GBIF | Nei | Primær artsdata |
| OpenStreetMap | Nei | Kart-tile i Leaflet |

## Teknologi

React 18 · Vite · Express.js · Anthropic SDK · Leaflet + leaflet.heat · Fuse.js · Resend
