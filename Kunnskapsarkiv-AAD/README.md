# Kunnskapsarkiv — bygningsintegrert Animal-Aided Design (AAD)

Bibliotek av eksempler på **bygningsintegrerte natur-/biodiversitetstiltak** som Naturportrett-prototypen kan vise til. Hensikten (per Tore): prototypen skal **ikke finne på egne fysiske tiltak**, men **peke på eksisterende prosjekter og produkter** med dokumentasjon.

Omfang: **realiserte prosjekter + tilgjengelige produkter/standardløsninger**. Geografi: primært Nord-Europa (Storbritannia, Nederland, Tyskland, Belgia, Norden), men andre områder med Norge-likt klima kan tas med.

## Mappestruktur (etter tiltaks-/bygningselement)
- `01-fasade-integrert-reir-og-hulrom/` — integrerte reir/hulrom i fasade/vegg (swift bricks, spurvepensjonat, svalereir, integrerte flaggermus-tilganger m.m.). ID-prefiks **FAS**
- `02-biotop-og-biodiverse-tak/` — biotop-/biodiverse/brune tak med habitatelementer. ID-prefiks **TAK**
- `03-gronne-og-levende-fasader/` — grønne/levende fasader og klatreplantesystemer med biodiversitetsfunksjon. ID-prefiks **GFA**
- `04-sokkel-mur-og-bakkenaere-tiltak/` — gabioner, tørrmurer, sokkel-/bakkenære tiltak for krypdyr/amfibier/insekter. ID-prefiks **MUR**
- `05-frittstaende-integrerte-strukturer/` — frittstående integrerte strukturer (habitat-skulpturer, tårnseiler-tårn, integrerte insektstrukturer). ID-prefiks **STR**
- `06-helhetlige-utbygginger-flere-tiltak/` — bygge-/byutviklingsprosjekter som integrerer flere tiltak. ID-prefiks **HEL**
- `07-andre-bygningsintegrerte-losninger/` — bee bus stops, fuglevennlig glass, grønne støyskjermer, integrerte reir i infrastruktur, flaggermusvennlig belysning. ID-prefiks **OVR**
- `_bilder/` — nedlastede bildefiler (når lisens tillater), navngitt `<ID>-1.jpg`, `<ID>-2.jpg`
- `_galleri/` — `galleri.html` (bla visuelt), `vurdering.html` (vurder Ja/Nei + relevans), `INDEX.md` ligger i rota

## Vurderingsverktøy (`_galleri/vurdering.html`)
Standalone HTML som Tore, student og BYM kan åpne i nettleser for å filtrere biblioteket: per kort settes **Ja/Nei** + en **relevans-slider (0–5)**. Valg lagres lokalt (localStorage), og «Eksporter JSON/CSV» laster ned vurderingen som sendes tilbake. Flere runder kan kjøres; eksempler som gjennomgående får Nei/lav relevans lukes ut. Filtrer på kategori, dyregruppe, type, klimasone, verifiseringsnivå og om det finnes løsningsbilde.

## Metadata per oppføring (beriket)
I tillegg til grunnfeltene: `tiltakstype` (kontrollert tag), `klimasone` (nordisk/nord-europa/annet-temperert), `verifiseringsnivaa` (høy/middels/lav), og per bilde et `motiv`-flagg (`viser-løsning`/`delvis`/`mennesker-seremoni`/`logo-diagram`/`mangler`/`usikker`) — slik at bilder som ikke viser selve løsningen kan filtreres vekk.

Produkter ligger i den mest relevante element-mappa og merkes `type: produkt` i metadata.

## ID- og foto-konvensjon
- Hver oppføring har en unik ID: `<PREFIKS>-NNN` (f.eks. `FAS-001`).
- Filnavn på md-fil: `<ID>-kort-navn.md`.
- Foto knyttes til oppføringen via filnavn `<ID>-1.jpg` / `<ID>-2.jpg`. Selv når bildet ennå ikke er lastet ned, refererer md-fila til forventet filnavn + kilde-URL.

## Lisens-/tillatelsesflagg (viktig)
Hvert bilde merkes med `tillatelse:`
- `fri` — fritt lisensiert (f.eks. CC0/CC BY/CC BY-SA) eller offentlig — kan vises/lastes ned med kreditering
- `må avklares` — opphavsrettsbeskyttet eller uklar lisens — tillatelse må innhentes før visning
- `ukjent` — lisens ikke fastslått ennå

> Bildefiler er i denne omgang **ikke lastet ned** (teknisk begrensning). Md-filene og galleriet refererer til verifiserte bilde-URL-er, slik at utvalget kan vurderes visuelt før nedlasting/klarering.

## Mal for en oppføring (kopier ved nye eksempler)
```markdown
---
id: FAS-001
navn: <prosjekt-/produktnavn>
type: prosjekt | produkt
kategori: fasade-integrert-reir-og-hulrom
bygningselement: <f.eks. yttervegg/isolasjonssjikt, takfot, sokkel>
malarter: [<f.eks. tårnseiler>]
dyregruppe: [fugl | flaggermus | insekter | amfibier/krypdyr | flere]
sted: <by, land>
land: <land>
aar: <år eller ukjent>
status: realisert | produkt-tilgjengelig | ukjent
verifisering: <hvor sikker; hva som er usikkert>
kilder:
  - <URL>
bilder:
  - fil: FAS-001-1.jpg
    url: <verifisert bilde-URL>
    kreditering: <fotograf/eier>
    lisens: <CC BY-SA 4.0 | opphavsrettsbeskyttet | ukjent>
    tillatelse: fri | må avklares | ukjent
tags: [<swift-brick>, <integrert-reir>]
---

# <Navn>

2–4 setninger: hva tiltaket er, hvilken art, hvordan det er integrert i bygget.

## Tiltaket
Detalj om det bygningsintegrerte tiltaket (mål, materiale, plassering).

## Relevans for Naturportrett
Hvorfor dette er et godt eksempel å peke til (eksisterende prosjekt/produkt/dok).

## Kilder
- <URL med tittel>
```

## Status
**300 oppføringer** i 7 kategorier (verifisert i tre research-bølger). 123 har et verifisert bilde som viser selve løsningen; resten har kilde-lenke og er flagget `mangler`/`usikker` til bilde kan bekreftes. Verifiseringsnivå: 143 høy, 100 middels, 17 lav, 40 (de første) uten felt. Lisens: 2 frie, resten «må avklares»/`ukjent` før visning. Neste steg: filtreringsrunder i `vurdering.html`, deretter bildeklarering for utvalget som beholdes.
