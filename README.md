# Naturportrett

> Turning GBIF occurrence data into legally-grounded, AI-synthesised
> nature portraits for land-use decisions.

A web application built for the City of Oslo, Agency for Planning and Building
Services (Plan- og bygningsetaten), that helps planners, architects, developers
and case handlers identify the biological diversity in the **influence zone**
(200 m–2 km, default 500 m) of a development site — and connects it to the
exact Norwegian legal paragraphs that apply.

- **Live:** <https://naturportrett.figurate.studio>
- **License:** MIT (see [LICENSE](LICENSE))
- **Status:** prototype, in active development by the City of Oslo

This README is in English so jurors of the GBIF Ebbe Nielsen Challenge 2026 and
international readers can follow it. Internal documentation aimed at Norwegian
contributors is in [FUNKSJONER.md](FUNKSJONER.md), [DEVLOG.md](DEVLOG.md) and
[CLAUDE.md](CLAUDE.md).

---

## What it does

Naturportrett implements a four-step flow for building a legally-grounded
biodiversity assessment around a Norwegian address:

```
1. Address  →  2. Influence zone  →  3. Portrait type  →  4. Portrait
```

| Step | What the user does | What the system delivers |
|---|---|---|
| **1 — Address** | Enters a Norwegian address (default Oslo; toggle for all of Norway) | Fuzzy address search via the Norwegian Mapping Authority (Kartverket) |
| **2 — Influence zone** | Adjusts a 200–2 000 m slider over a map with a heatmap overlay of nearby observations | Background-fetches species data for 200 m so the heatmap appears quickly; full radius fetched after confirmation |
| **3 — Portrait type** | Chooses one of five portrait types | Nature portrait (overview) as a wide card on top, four detailed portraits in a 2×2 grid below |
| **4 — Portrait** | Reads, prints or downloads the generated portrait | AI-synthesised, source-grounded portrait with verbatim legal paragraphs, management measures and data-quality assessments |

### The five portrait types

| Type | Scope | Primary audience |
|---|---|---|
| **Nature portrait** | The whole influence zone | Anyone surveying a site |
| **Habitat portrait** | One specific NiN-classified habitat type | Ecologists, designers of green roofs/areas |
| **Species portrait** | One specific animal species | Architects, developers, biologists |
| **Plant portrait** | One specific plant | Landscape architects |
| **Plan portrait** | Decision support for a planning case under Norwegian Nature Diversity Act §§ 8–12, cf. § 7 | Case handlers in regulatory planning |

The **Plan portrait** is structured around five modules: a biodiversity-section
draft (§§ 8–12), an important-nature screening, an EIA screening, candidate
themes for zoning provisions (always with a `[bracket]`-marked draft wording
and a mandatory "must be clarified with a lawyer" notice), and material for
early-phase area/process clarification. See
[PLANPORTRETT-SPEC.md](PLANPORTRETT-SPEC.md) for the full design rationale.

---

## How GBIF data is used

Every portrait begins with a real-time call to the
**[GBIF Occurrence Search API](https://www.gbif.org/developer/occurrence)** for
the chosen coordinates and radius. GBIF is the foundational species-data layer:

- The query covers a circle of 200–2 000 m around the address
- Results are deduplicated with iNaturalist research-grade observations (which
  add Norwegian common names and photos where GBIF lacks them)
- Each species is enriched with Norwegian Red List 2021 / Alien Species List
  2023 status from a local index
- A transparent priority score (recency 50 % + observation count 30 % + data
  quality 20 %) ranks species; the top 25 are sent to the AI synthesis

GBIF occurrence density is also rendered as a **heatmap layer** in the portrait's
map view, so the user can see at a glance where GBIF data is dense and where it
is sparse around the site.

Without GBIF, the tool does not exist.

---

## Technical architecture

| Layer | Stack | Notes |
|---|---|---|
| Frontend | React 18 + Vite (port 5173) | Functional components + hooks. No TypeScript yet. |
| Backend | Express.js (port 3001) | Proxy — hides the AI API key from the client |
| Map | Leaflet + leaflet.heat + OpenStreetMap | No API key required |
| Design | Oslo Punkt CSS + Oslo Sans (self-hosted WOFF2) | [designmanual.oslo.kommune.no](https://designmanual.oslo.kommune.no) |
| AI | Anthropic Claude `claude-sonnet-4-6` with fallback to `claude-opus-4-8` → `claude-haiku-4-5` | Server-side only |
| i18n | Custom `useT()` hook + `<SprakProvider>` | NO and EN |
| Cache | localStorage with 24-hour TTL on AI output | Reduces token cost on language toggle and back-navigation |

### Data sources

| Source | Purpose | How |
|---|---|---|
| GBIF | Primary species occurrence data | `api.gbif.org/v1/occurrence/search` |
| iNaturalist | Photos, Norwegian names, research-grade observations | `inaturalist.org/observations` with `quality_grade=research` |
| Norwegian Mapping Authority (Kartverket) | Address resolution to coordinates | `ws.geonorge.no/adresser/v1/sok` with `fuzzy=true` |
| Lovdata | Verbatim Norwegian legal texts | Indexed locally from official markdown exports in `Kunnskapsbase/` (429 paragraphs across five laws/regulations) |
| Anthropic Claude | AI synthesis | Via server proxy — the AI key is never exposed to the frontend |
| OpenStreetMap | Base map tiles | Via Leaflet |

---

## Quick start

**Requirements:** Node.js 20 or newer. An Anthropic API key from
<https://console.anthropic.com>.

```bash
git clone https://github.com/andreasfadum/naturportrett.git
cd naturportrett
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev:all
```

Open <http://localhost:5173>.

`npm run dev:all` runs Vite (5173) and Express (3001) concurrently.

### Build for production

```bash
npm run build       # builds dist/
npm start           # serves dist/ + API on process.env.PORT
```

### Other useful scripts

```bash
npm run build:lover-index   # regenerate legal indices from Kunnskapsbase/ markdown files
npm run build:heatmap-data  # rebuild /public/heatmap-data.json from GBIF (slow, ~5 min)
npm run check-models        # verify which Claude models are currently available
```

### Environment variables

| Variable | Description | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key | **Yes** |
| `PORT` | Express port (default 3001) | No |
| `RESEND_API_KEY` | For routing user feedback as email | No |
| `FEEDBACK_RECIPIENT_EMAIL` | Recipient address for user feedback | No |
| `WORKSHOP_ADMIN_PASSWORD` | Password for `/admin/feedback` and `/admin/usage` | No (default: `naturportrett`) |
| `WORKSHOP_DATA_DIR` | Path for persistent storage (Railway: `/data`) | No |

---

## Adapting Naturportrett to another jurisdiction

The architecture is **not Norway-specific** — only the *content* of the legal
corpus, the address source and the green-structure list. Replacing these for
another city or country is intended to be straightforward.

### 1. Swap the legal corpus

The whole verbatim-quoting legal layer is loaded from JSON indices in
`Kunnskapsbase/index/` and generated from markdown files in `Kunnskapsbase/`
by `scripts/build-lover-index.js`.

**To adapt:**

1. Export the relevant laws and regulations as markdown (one file per law)
   into `Kunnskapsbase/your-country/`.
2. Update `Kunnskapsbase/index/index.json` to point to your new law files with
   short codes (e.g. `bauNVZ`, `planAct`, `epa`).
3. Run `npm run build:lover-index`.
4. Update the prompt files in `server/prompts/` so the AI uses your new law
   short codes when filling the `relevanteLover` field — the validation rule
   (a quoted paragraph's `lov` ID must match the corpus) ensures the model
   cannot smuggle in laws that are not indexed.

### 2. Swap the address source

`src/services/kartverket.js` is the only place that talks to the Norwegian
Mapping Authority. Replace it with a wrapper that takes a string and returns
`{ lat, lon, displayName }`. Any geocoder works (Nominatim, Mapbox, Google
Geocoding, etc.).

### 3. Swap the green-structure list

`src/utils/osloGronnstrukturer.js` is a curated list of 30 Oslo parks,
nature reserves and ecological corridors with names, types, coordinates and a
bounding box. The list is used to give the AI a concrete checklist of nearby
named places so it does not invent locations.

**To adapt:**

1. Replace the array with your own list (city parks, reserves, biodiversity
   corridors, etc.). Each entry needs `navn`, `type`, `lat`, `lon`.
2. Update the bounding box at the top of the file so the helper only activates
   when the user is within your city.
3. Update the `kunnskapskilder/` JSON if you have additional curated sources.

### 4. Translate the UI

`src/i18n/translations.js` has a flat key-value map with `no` and `en`
variants. Add your language code (e.g. `de`, `fr`) as a third variant per
entry, then extend the `<SprakProvider>` and `<LanguageSwitcher>` with the new
choice. KI-generated text follows the user's UI language via an explicit
`OUTPUT LANGUAGE` instruction at the top of every system prompt.

### 5. (Optional) Swap the AI provider

`server/routes/claude.js` is the only file that imports the Anthropic SDK.
The portrait endpoint receives a `payload` and returns a structured JSON
result — the contract is provider-agnostic. To use a different model
(OpenAI, Google, local Llama, etc.), replace `createWithRetry()` and the
`MODEL_CHAIN` import. The prompt files in `server/prompts/` are plain
template literals you can keep as is.

---

## License and attribution

This project is released under the **[MIT License](LICENSE)**.

The verbatim Norwegian legal texts indexed in `Kunnskapsbase/` are sourced from
Lovdata (<https://lovdata.no>) and remain subject to Lovdata's terms.

Species occurrence data is fetched in real time from
[GBIF](https://www.gbif.org) and [iNaturalist](https://www.inaturalist.org).

The conceptual lineage of the species, plant and habitat portrait formats
traces back to the **Animal-Aided Design** framework developed by Thomas
Hauck and Wolfgang W. Weisser at TU Munich.

---

## Sentral dokumentasjon (på norsk)

- **[FUNKSJONER.md](FUNKSJONER.md)** — komplett funksjonsoversikt
- **[DEVLOG.md](DEVLOG.md)** — kronologisk endringshistorikk
- **[CLAUDE.md](CLAUDE.md)** — instruksjoner for KI-assistenter som jobber på prosjektet
- **[PLANPORTRETT-SPEC.md](PLANPORTRETT-SPEC.md)** — spesifikasjon for Planportrett-typen
- **[SAKSBEHANDLING-ANALYSE-OG-ITERASJONER.md](SAKSBEHANDLING-ANALYSE-OG-ITERASJONER.md)** — analyse av saksbehandler-behov
- **[samarbeid-GBIF/](samarbeid-GBIF/)** — arbeidet rundt Ebbe Nielsen Challenge-søknaden
