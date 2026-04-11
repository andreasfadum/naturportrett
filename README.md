# Naturportrett

Webapplikasjon for identifisering av biologisk mangfold i influensområdet til eiendomsutviklingsprosjekter i Oslo.

## For hvem

- Arkitekter og eiendomsutviklere
- Saksbehandlere i Plan- og bygningsetaten
- Reguleringsplanleggere

## Funksjonalitet

1. **Adressesøk** — Skriv inn norsk adresse (Oslo), systemet tolererer skrivefeil og manglende husnummer
2. **Artsvisning** — Se hvilke planter, insekter, fugler og dyr som er registrert innenfor 500 m
3. **Artutvalg** — Velg relevante arter via avkrysningsliste med bilder
4. **Faglig vurdering** — Få AI-generert veiledning om naturhensyn basert på naturmangfoldloven

## Installasjon

**Forutsetning:** Node.js 18 eller nyere. Last ned fra [nodejs.org](https://nodejs.org).

```bash
# Installer avhengigheter
npm install

# Sett opp miljøvariabler
cp .env.example .env
# Åpne .env og legg inn din Anthropic API-nøkkel

# Start applikasjonen
npm run dev:all
```

Åpne http://localhost:5173 i nettleseren.

## Miljøvariabler

| Variabel | Beskrivelse | Påkrevd |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Nøkkel fra console.anthropic.com | Ja |
| `PORT` | Port for Express-serveren (standard: 3001) | Nei |

## Konfigurasjon av datakilder

Se [kunnskapskilder/README.md](kunnskapskilder/README.md) for å legge til eller endre datakilder.

## API-nøkler

| Tjeneste | Nøkkel nødvendig |
|----------|-----------------|
| Anthropic Claude | **Ja** — kreves for AI-vurderinger |
| Kartverket adresse-API | Nei — gratis og åpen |
| iNaturalist | Nei — gratis og åpen |
| GBIF | Nei — gratis og åpen |

## Designsystem

Følger Oslo kommunes visuelle identitet:
- [designmanual.oslo.kommune.no](https://designmanual.oslo.kommune.no)
- Oslo Sans fonter (selvhostet WOFF2)
- Oslo fargepalett

## Teknologi

React 18 · Vite · Express.js · Anthropic SDK · Fuse.js
