# Naturportrett — CLAUDE.md

## Prosjektbeskrivelse

Naturportrett er en webapplikasjon for Oslo kommune som hjelper arkitekter, eiendomsutviklere og saksbehandlere i Plan- og bygningsetaten med å identifisere biologisk mangfold innenfor influensområdet til en eiendom under utvikling.

## Teknisk stack

- **Frontend**: React 18 + Vite (port 5173)
- **Backend**: Express.js API-proxy (port 3001)
- **Designsystem**: Oslo kommune Punkt CSS + Oslo Sans (selvhostet WOFF2)
- **Primær artsdata**: iNaturalist API (norske navn + kvadratbilder)
- **Sekundær artsdata**: GBIF API
- **Adressesøk**: Kartverket API (`kommunenummer=0301`, `fuzzy=true`)
- **AI**: Anthropic Claude `claude-sonnet-4-6` (via server-proxy, aldri direkte fra frontend)

## Start prosjektet

```bash
npm install
cp .env.example .env
# Legg inn ANTHROPIC_API_KEY i .env
npm run dev:all
```

Åpne http://localhost:5173

## Prosjektstruktur

```
src/
  components/
    layout/       → AppHeader, AppFooter, StepIndicator
    address/      → AddressSearch, AddressSuggestions, InfluenceZoneInfo
    species/      → SpeciesSection, SpeciesCard, SpeciesFilter, SpeciesLoadingState
    recommendations/ → RecommendationsSection, RecommendationPanel, etc.
  hooks/          → useAddressSearch, useSpeciesSearch, useRecommendations
  services/       → kartverket, inaturalist, gbif, speciesAggregator
  utils/          → norwegianText, speciesCategories
server/
  index.js        → Express app (port 3001)
  routes/         → claude.js (POST /api/claude), sources.js (GET /api/sources)
  prompts/        → biodiversity.js (system prompt + user prompt builder)
kunnskapskilder/  → JSON-filer som definerer datakilder (brukerkonfigurerbar)
public/
  fonts/          → Oslo Sans WOFF2
  icons/          → Utvalgte Oslo SVG-ikoner
```

## Designregler

**Følg alltid Oslo kommunes visuelle identitet:**
- Bruk kun farger fra Oslo-paletten definert i `src/index.css` (CSS custom properties `--oslo-*`)
- Bruk Oslo Sans for all tekst
- Oslo-logoens mørkeblå (#2A2859) brukes som primærfarge
- Referanse: https://designmanual.oslo.kommune.no

## Adressesøk

- Alltid begrens til Oslo med `kommunenummer=0301`
- Bruk alltid `fuzzy=true` på Kartverket-API-kallet
- `norwegianText.js` normaliserer ae→æ, oe→ø, aa→å FØR API-kallet
- Fuse.js re-rangerer resultater på klientsiden

## AI-anbefalinger

- Aldri kall Anthropic API direkte fra frontend
- Bruk alltid server-proxyen: `POST /api/claude`
- Systemsprompt er i `server/prompts/biodiversity.js` — oppdater den for bedre svar
- Svaret strømmes via SSE (Server-Sent Events)

## Kunnskapskilder

- `kunnskapskilder/`-mappen inneholder JSON-konfigurasjoner for datakilder
- Les `kunnskapskilder/README.md` for format og instruksjoner
- Bare `enabled: true`-filer er aktive

## Kodekonvensjoner

- Funksjonelle React-komponenter og hooks (ingen klassekomponenter)
- Norsk tekst i all UI (labels, meldinger, knapper)
- Engelske variabel- og funksjonsnavn i kode
- Ingen TypeScript for nå (planlagt i v2)
- CSS custom properties fra `--oslo-*` paletten, ikke hardkodede farger

## Fremtidige forbedringer (ikke implementer ennå)

- Kartvisning med Leaflet og Oslo-basiskart
- RAG-integrasjon for Kunnskapsbase-PDF-ene (`pdf-parse` + Claude Haiku reranking)
- Konfigurerbar influenssone-radius (50m / 100m / 200m / 500m)
- Rødlistestatus fra Artsdatabanken
- Brukerautentisering
- Lagring og eksport av vurderinger
