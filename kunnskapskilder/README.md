# Kunnskapskilder

Denne mappen inneholder konfigurasjonsfiler for datakildene som Naturportrett bruker for å hente informasjon om arter.

## Slik fungerer det

Applikasjonen leser alle `.json`-filer i denne mappen ved oppstart (via `GET /api/sources`). Bare filer med `"enabled": true` er aktive.

## Aktive kilder

| Fil | Kilde | Status |
|-----|-------|--------|
| `inaturalist.json` | iNaturalist | Aktiv |
| `gbif.json` | GBIF | Aktiv |
| `artsdatabanken.json` | Artsdatabanken | Inaktiv (fremtidig) |

## Format

```json
{
  "id": "unik-id",
  "name": "Visningsnavn",
  "description": "Hva kilden inneholder",
  "url": "https://...",
  "enabled": true,
  "type": "api",
  "config": {
    "baseUrl": "https://api.example.com/observations",
    "params": { "quality_grade": "research" },
    "radiusKm": 0.5,
    "maxResults": 100
  },
  "provides": ["observations", "photos", "norwegian_names"]
}
```

Se `sources.schema.json` for full dokumentasjon av alle felter.

## Slik legger du til en ny kilde

1. Kopier `inaturalist.json` som mal
2. Gi den et nytt, unikt `id` (kun bokstaver, tall og bindestrek)
3. Sett `"enabled": false` til du har testet den
4. Restart applikasjonen (`npm run dev:all`)
5. Test at kilden returnerer data
6. Sett `"enabled": true`

## Fremtidige dokumentkilder

Det er planlagt støtte for `"type": "document"` som lar deg peke på lokale PDF- og Word-filer fra `Kunnskapsbase/`-mappen. Disse vil bli indeksert via RAG (Retrieval Augmented Generation) og kan siteres i AI-anbefalingene.

Eksempel (ikke aktivert ennå):
```json
{
  "id": "biotoptak-veileder",
  "name": "Veileder Biotoptak Oslo",
  "type": "document",
  "path": "../Kunnskapsbase/Veileder Biotoptak.pdf",
  "enabled": false,
  "provides": ["guidance_text"]
}
```
