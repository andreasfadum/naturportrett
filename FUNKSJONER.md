# Naturportrett — funksjonsoversikt

Levende dokument som beskriver hva prototypen kan gjøre per **24. juni 2026** (etter planportrett, navigasjonsrefactor, mobil-tilpasning og portrett-cache).

Skal du forstå hvordan en konkret funksjon er bygd, se [DEVLOG.md](DEVLOG.md) for kronologisk endringshistorikk og pekere til commit-er.

---

## 1. Hovedflyt

Verktøyet er strukturert som en fire-stegs flyt for å bygge et beslutningsgrunnlag rundt naturhensyn i et planleggings- eller byggesaksprosjekt. **Refactored 24. juni 2026** — naturportrett er ikke lenger et tvunget mellomsteg, men ett av fem portrettvalg på steg 3:

```
1. Adresse  →  2. Influensområde  →  3. Portretttype  →  4. Portrett
```

| Steg | Hva brukeren gjør | Hva verktøyet leverer |
|---|---|---|
| **1 — Adresse** | Skriver inn adresse i Norge (default: Oslo), evt. utvider til hele Norge | Adressesøk via Kartverket, bekreftet adresse vises som «Valgt adresse: X» (uten radius-henvisning) |
| **2 — Influensområde** | Justerer slider 200–2000 m med kart + heatmap-overlay som live forhåndsvisning | Bakgrunns-fetcher artsdata for 200 m så heatmap-overlay fylles raskt. Slider oppdaterer lokal state (ingen species-spam ved drag); først ved bekreft-klikk propageres ny radius |
| **3 — Portretttype** | Velger ETT av fem alternativer: Naturportrett (oversiktsvalg, bredt øverst) eller ett av 4 detaljportretter i 2×2 grid | Bakgrunnen fortsetter å fetche species for valgt radius. Hver type beskrives i et kort |
| **4 — Portrett** | Hvis naturportrett: KI-syntese starter. Hvis arts-/plante-/naturtypeportrett: subject-picker → bekreftelses-modal → KI. Hvis planportrett: intro-skjerm + bekreftelses-modal → KI (ingen subject) | Generert portrett vises. Cache-hit gir instant retur uten loading-spinner |

---

## 2. Adressesøk og influenssone

### Adressesøk
- **Hele Norge støttes.** Default er Oslo (kommunenummer `0301`) — en bryter «Hele Norge» ved siden av adressefeltet skrur av Oslo-filteret.
- Kartverket-API med fuzzy-treff + Fuse.js re-rangering på klientsiden.
- Norske bokstaver (æ/ø/å) normaliseres før API-kallet (ae/oe/aa → æ/ø/å).
- Valg av bryter-status lagres i `localStorage`.

### Influenssone (steg 2)

Egen side med kart + heatmap-overlay + slider. Flyttet ut av adressesteget 24. juni 2026 slik at brukeren ser konsekvensen av radius-valget visuelt før hen går videre.

- Slider styrer radius fra **200 m til 2 km** med 100 m-steg.
- Default: **500 m**, lagret i `localStorage` (min hevet fra 100 til 200 i nav-refactoren).
- Slideren oppdaterer LOKAL state mens brukeren drar — først ved bekreft-klikk propageres ny radius til App. Forhindrer species-spam på hver pixel.
- Bakgrunnsfetching i to faser (transparent for brukeren):
  - Steg 2 mount: artsdata for **200 m** så heatmap-overlay fylles raskt
  - Steg 3+ (etter bekrefting): artsdata for **valgt radius** (KI-input)
- Påvirker etter bekrefting: GBIF + iNaturalist-søk, kart-sirkel/legend, KI-prompten («innenfor X meter»), grønnstruktur-sjekklisten KI får.

### Tospråklighet (NO / EN)

- Pill-bryter med inline SVG-flagg i topp-banneret. Inline SVG sikrer at flagget vises i alle nettlesere (Windows + noen Linux-distros har ikke emoji-flag-rendering).
- Valget lagres i `localStorage` og setter `<html lang>`.
- All UI er oversatt. KI-genererte tekster produseres på valgt språk via en eksplisitt `OUTPUT LANGUAGE`-instruks i system-prompten.
- Lov-sitater fra Lovdata forblir på norsk (de hentes ordrett fra norsk lovkilde) selv når UI-en er på engelsk.
- **Språkbytte etter ferdig portrett** triggerer regenerering på det nye språket. Hvis brukeren har sett denne språkversjonen før, returnerer cache instant (se § 15). Brukeren slipper å gjenta art-/naturtype-valg — `pickedSubject` gjenbrukes.

---

## 3. Naturportrett (steg 2)

KI-syntese basert på Claude (`claude-sonnet-4-6` med fallback til `claude-opus-4-8` → `claude-haiku-4-5`).

### Innhold i portrettet
- **Informasjonsbase-banner** — tydelig avgrensning: portrettet erstatter ikke faglig kvalitetssikring
- **Eiendomskontekst** — 2–5 setninger som spesifikt knytter eiendommen til områdedataene (svarer på R6-innspill fra workshop 17. juni: «forskjellen på hva som handler om eiendom vs. område»). Solid lysbeige bakgrunn med mørkeblå venstre-border.
- **Oversiktskart med heatmap-overlay** — Leaflet med OpenStreetMap-bakgrunn, influenssone som sirkel, markør på adressen. **Heatmap-overlay aktivt som default** (toggle øverst venstre i kartet for av/på, valg lagres i localStorage). Heatmap-dataen er den samme `/heatmap-data.json` som /heatmap-siden bruker — én sannhetskilde, filtrert til bbox rundt eiendommen for ytelse.
- **Naturtyper i området** — tabell med NiN-kode, rødliste, beskrivelse og **avhengige arter** (KI lister konkrete arter som er avhengige av hver naturtype, prioritert fra observasjonslisten med anti-hallusinerings-regel)
- **Registrerte arter av høy økologisk verdi** — KI-utvalg fra de 25 artene med best datakvalitet som ble sendt inn. Hver rad har en datakvalitet-celle (grønn/gul/rød + sist observert dato)
- **Oppsummering under tabellen** — sett i sammenheng: «Av X registrerte arter ble Y sendt til KI, som vurderte Z som høy økologisk verdi». Antallet er nå faktisk (MAX_SPECIES hevet fra 60 til 500 i juni 2026 — tidligere traff vi taket nesten alltid)
- **Kategori-filter** på arts-tabellen vises automatisk når KI-utvalget er > 30
- **Økologiske sammenhenger og barrierer**, **Trusler og fremtidig potensiale**, **Spesielt viktige områder** — fritekst-seksjoner
- **Forvaltningsråd** — konkrete råd sortert etter tidshorisont (Umiddelbart / 1–3 år / Langsiktig)
- **Relevant lovgrunnlag** — paragrafer fra fem indekserte lover/forskrifter, sitert ordrett med Lovdata-lenker. Inline `[§ 12-7](url)`-lenker i sitater renders som klikkbare elementer. UI viser også hvilke paragrafer KI nevnte men som ikke finnes i lovbasen (advarsel om hallusinerte paragrafer).
- **Andre kilder for informasjon om området** — KI-utvalg
- **Datakvalitet per tema** — God / Delvis / Mangelfull-vurdering med foreslått feltarbeid

### Datakildene
| Kilde | Hva | Hvordan |
|---|---|---|
| **GBIF** | Primær artsdata, internasjonal infrastruktur | `occurrence/search`-API, 500 m radius standardvalg |
| **iNaturalist** | Foto, norske navn, peer-verifiserte observasjoner | `observations`-API filtrert på `quality_grade=research` |
| **Artsdatabanken** | Rødlista 2021 + Fremmedartslista 2023 | Lokal datafil i `kunnskapskilder/` |
| **Kartverket** | Norske adresser med koordinater | `adresser/v1/sok` |
| **Lovdata** | Naturmangfoldloven, plan- og bygningsloven, friluftsloven, forvaltningsloven, SAK10 | Indeksert lokalt fra .md-filer i `Kunnskapsbase/` |
| **Anthropic Claude** | KI-syntese | Server-proxy, aldri direkte fra frontend |
| **Oslo-grønnstrukturer** | 30 kuraterte parker, naturreservater, økologiske korridorer | Hardkodet i `src/utils/osloGronnstrukturer.js`, aktiveres kun innenfor Oslos bounding-boks |

### Prioritering og filtrering av arter
Hver art får en **`priorityScore`** mellom 0 og 1:

| Vekt | Signal | Effekt |
|---|---|---|
| 50 % | **Recency** (siste observasjon) | Eksponentiell decay over 3 år. I fjor ≈ 0.72, 3 år siden ≈ 0.37, 10 år ≈ 0.04 |
| 30 % | **Antall observasjoner** | Log-skalert opp til 50 |
| 20 % | **Datakvalitet** | research-grade (peer-verifisert) > GBIF identifisert > uverifisert. +0.1 bonus ved <100 m koordinatpresisjon |

Topp 25 sendes til Claude. Tersklene 0.65 / 0.35 deler i Høy / Middels / Lav (én sannhetskilde delt mellom `speciesAggregator.js`, `NaturportrettView` og picker-filteret).

---

## 4. Detaljportrett (steg 4)

Fire typer detaljportretter med felles bygg-klosser (lovgrunnlag, datakvalitet, tiltakshierarki, feedback-knapp, PDF-eksport):

### Naturtypeportrett

NiN-klassifisert naturtype (T35 Park, T4 Bare rock, T35 Skrotemark osv.). Innhold: beskrivelse, viktige strukturer (vegetasjon/hydrologi/substrat/topografi), økologiske forhold (typiske/nøkkelarter, funksjoner, naturlig dynamikk), tidsaspekter (årstidsvariasjon, forstyrrelsesregime), trusler, samspill med mennesker.

### Artsportrett

Konkret dyreart (fugl, pattedyr, insekt, sopp). Hero-seksjon med navn + foto + rødlistestatus, beskrivelse, foretrukne habitater, **årssyklus-tidslinje**, **næringskilder i 3 grupper med lokal forekomst** (se neste seksjon), attributter (nøkkelart, høy økologisk verdi, ansvarsart osv.), atferdsprofil, symbioser.

### Planteportrett

Konkret plante. Habitatkrav (fuktighet, klimasone, lysforhold, vindtoleranse, jord, pH), spredning og livssyklus, tilknyttede arter, pollinator-verdi, erfaringsgrunnlag i Norge, anbefalt samplanting, vedlikeholdsbehov, særskilte hensyn, symbioser med pollinatorer/mykorrhiza/spredere.

### Planportrett (NYTT — juni 2026)

Beslutningsstøtte for naturmangfold i plansak. Bygd etter [PLANPORTRETT-SPEC.md](PLANPORTRETT-SPEC.md). Gjelder eiendommen/influensområdet som helhet — **tar ikke et subject**. Subject-picker hoppes over og brukeren ser i stedet en intro-skjerm med modul-oversikt + «Generér»-knapp.

Strukturert etter fem moduler:

- **A** Naturmangfold-avsnitt (utkast etter nml §§ 8–12, jf. § 7) — kunnskapsgrunnlag, føre-var, samlet belastning, forvaltningsmål
- **B** Viktig-natur-screening (lav/middels/høy med fargekodet badge + punktvis begrunnelse)
- **C** Bestemmelsesforslag (tema + materielt behov + kandidat-hjemmel + skisseOrdlyd med `[klamme]`-markører + obligatorisk «⚖ Må avklares med jurist»-banner per oppføring + Lovdata-lenke til kandidat-hjemmel)
- **D** KU-screening (indikasjon + momenter til vurdering — aldri konklusjon)
- **E** Underlag til område- og prosessavklaring (komprimert sammendrag for oppstartsfasen)

**Skjerpet anti-hallusinering** for planportrett (juridisk grense): «kan tale for KU», aldri «er KU-pliktig»; bestemmelser er temaer + skisse, aldri ferdig ordlyd; hjemmel er hypotese til verifisert mot Lovdata. **Ikke-overlapp-regel**: KI skal IKKE foreslå bestemmelser som allerede er sikret av annet lovverk (nml § 53, vassdragsvern, artsfredning).

### Subject-picker — felles for arts- og planteportrett

- **Kategori-filter** (Fugl / Plante / Insekt / Sopp / Annet)
- **Verne-status-filter** (Alle / Rødlistet / Svartelistet / Ikke vurdert)
- **Datakvalitet-filter** (Alle / Høy / Middels / Lav)
- Alle tre filtre er kombinable — alle må gi treff
- **Forkortelse-forklaring** som åpningsbar boks: LC/NT/VU/EN/CR + SE/HI/PH/LO/NK/NR
- **Bekreftelses-modal** før KI-igangsettelse: «Generér portrett for X? Genereringen tar gjerne under ett minutt, men varigheten påvirkes av størrelsen på influensområdet og mengden artsdata.» (kostnad er ikke nevnt for brukeren)

### Bilde-oppløsninger
- Tabellbilder (SpeciesCard): `photoMediumUrl` (~500 px)
- Hero-bilder i view: `photoLargeUrl` (~1024 px) med fallback til medium → square
- iNaturalist-mapping utleder ulike størrelser fra basis-URL hvis API-en ikke leverer alle felter

---

## 5. Tiltakshierarki

Per portrett genereres 3–6 **praktiske designtiltak**, hvert merket som:

- **«Lovstyrt krav»** — kan stilles som vilkår i en lovstyrt prosess. Krever `hjemmel`-felt med lov + paragraf, og lov-ID-en må samsvare med en av lovene listet under «Relevant lovgrunnlag» (ingen smyg av nye lover bare i hjemmel-feltet).
- **«Frivillig forbedring»** — naturforbedrende tiltak uten lovhjemmel.

Hvert tiltak har også et **fase**-felt: Tidligfase / Reguleringsplan / Utomhusplan / Gjennomføring.

---

## 6. Næringskilder med lokal forekomst (kun artsportrett)

Tre tabeller — Plantebaserte næringskilder, Habitatstøttende planter, Dyrebaserte næringskilder — har hver fire kolonner:

| Kolonne | Innhold |
|---|---|
| Art/plantetype/dyretype | Hva slags art |
| Detaljer | Hva som spises eller hva planten gir |
| **Lokal forekomst** | Finnes/mangler hvor i influenssonen, basert på observerte arter + grønnstrukturer (eller «ikke kjent fra lokale registreringer») |
| **Handling på eiendommen** | Bevare X / styrke Y / introdusere Z |

Under hver tabell renderes en kort **synteseblokk** (italic, blå venstre-border) — «Oppsummering: hva må prioriteres ved drift/forvaltning av eiendommen».

Layout: de tre tabellene stacker vertikalt (én under én) for å gi 4-kolonners tabeller nok plass. `table-layout: fixed` + `overflow-wrap: break-word` på alle portrett-tabeller forhindrer overflow ved lange tekstceller.

---

## 7. Symbioser og økologiske avhengigheter

Nytt felt i alle tre detaljportretter (artsportrett, planteportrett, naturtypeportrett). Hver oppføring beskriver **dokumenterte gjensidige avhengigheter**, ikke generelle økosystem-koblinger.

### Anti-hallusinerings-regel
Dette er prototypens viktigste integritetsregel og injiseres tidlig i alle tre system-prompts:

> KI-troverdighet er den viktigste verdien tjenesten har. Brukerne er fagfolk som vil oppdage spekulasjoner. Når et felt har risiko for fabulasjon — særlig symbioser, gjensidige avhengigheter og lokale forekomster — er det BEDRE å returnere en tom liste eller «ikke kjent» enn å gjette.

Når symbioser-feltet er tom liste, viser UI eksplisitt **«Ingen artsspesifikke symbioser med tilstrekkelig dokumentasjon å vise. Generelle økosystem-koblinger er bevisst utelatt.»** Dette synliggjør at KI vurderte feltet, ikke at det er glemt.

### Felter per symbiose
- **type** — mutualisme / kommensalisme / predator-bytte / parasittisme / konkurranse / indikator-relasjon (hver med egen fargekode)
- **partnerart** — norsk + latinsk navn
- **forklaring** — 1–2 setninger om relasjonen
- **lokalRelevans** — er partner-arten kjent i området?
- **evidensgrunnlag** — obligatorisk: «dokumentert i kilde X» eller «generelt akseptert økologisk relasjon»

---

## 8. Lovgrunnlag

Indeksert lokalt fra Lovdata-eksporterte markdown-filer i `Kunnskapsbase/`:

| Lov / forskrift | Paragrafer indeksert |
|---|---|
| Naturmangfoldloven | 84 |
| Plan- og bygningsloven | 243 |
| Friluftsloven | 31 |
| Forvaltningsloven | 26 |
| Byggesaksforskriften (SAK10) | 45 |

Build-script `scripts/build-lover-index.js` regenererer indekser fra .md-filene. Paragrafer siteres ordrett i UI med klikkbare Lovdata-lenker.

KI-genererte tekster om jus blir aldri «tolket» — paragrafene siteres slik de står, og kvalifisert vurdering må gjøres av saksbehandler. Hvis KI nevner en paragraf vi ikke har indeksert, dukker den opp som en eksplisitt advarsel i UI.

---

## 9. Eksport og deling

### PDF
- Print-knapp på alle portretter bruker `window.print()`
- Print-CSS gir A4 med 15 mm marginer, nullstilling av flex-stacken for å unngå tom førsteside
- Typografi optimert: 10.5pt body, 18/13/11pt overskrifter, page-break-inside avoid på lov-blokker, kart, tabeller, eiendomskontekst og symbiose-kort
- Feedback-knapp og portrait-nav skjules
- Dev-banner beholdes (med ryddig papir-styling) som påminnelse om at portrettet er fra testversjon

### Heatmap-side (`/heatmap`)
- Egen helsides-visualisering av alle arts-registreringer i Oslo som leaflet.heat heatmap (samme datakilde som overlay-en i naturportrett-kartet)
- Intensitet beregnes fra 100 m grid-celler
- Brukerstyrt artsgruppe-filter
- Dynamisk radius som skalerer med zoom-nivå
- Lenke til siden ligger ikke lenger i footer (siden heatmap er integrert i naturportrettet) — direkte-URL fortsatt tilgjengelig

### Workshop-app (`/workshop_01`)
- Underapp brukt på workshop 17. juni 2026 for å samle inn brukerinnspill
- Passordbeskyttet rådata-eksport

---

## 10. Tilbakemeldinger fra brukere

Hver portretttype har en **«Si fra om feil eller mangler»**-knapp som åpner en modal med:
- Type (Feil / Mangler / Hallusinasjon / Tekstforslag / Annet)
- Seksjon (valgfri dropdown av portretts hovedseksjoner)
- Fritekst
- E-post (valgfri)

Tilbakemeldinger lagres på Railway-volumet og sendes som e-post via Resend med emnefelt-prefiks `[Naturportrett tilbakemelding]`. E-postformatet er ren markdown så Andreas kan Cmd+A → kopiere → lime inn i Claude.

Admin-side `/admin/feedback` (passordbeskyttet) viser alle innslag + nedlasting som JSON.

---

## 11. Drift og kostnadssporing

### Modell-fallback
`claude-sonnet-4-6` (default) → `claude-opus-4-8` (hvis sonnet er deprecated) → `claude-haiku-4-5` (hvis opus er deprecated). Brukbart fra `server/routes/claude.js` ved 404 / model_not_found.

### Token- og kostnadssporing
Hvert Claude-kall logges som én linje i `claude-usage.jsonl` på Railway-volumet med:
- Tidspunkt, klient-IP, kontekst (`portrait:naturportrett` etc.), modell
- Input/output/cache-tokens
- Estimert USD-kost basert på Anthropic prisliste (sonnet $3/$15, opus $15/$75, haiku $1/$5 per million tokens)

Admin-side `/admin/usage` (passordbeskyttet) viser totaler, fordeling per modell og kontekst, sessions (unik IP innenfor 30 min) og snitt USD per session.

---

## 12. Internasjonalisering

- Sentral oversettelseskatalog i `src/i18n/translations.js`
- `useT()`-hook + `<SprakProvider>` på rotnivå
- 150+ oversatte strenger på norsk og engelsk
- KI-genererte tekster oversettes via system-prompt-instruks; KI-feltnavn forblir norske (matche tilbake til UI-mappings)

---

## 13. Designsystem

- Oslo kommunes visuelle identitet (Oslo Sans, Punkt CSS, Oslo-paletten via `--oslo-*` CSS-variabler)
- Inline SVG-flagg for språkbryteren (vises i alle nettlesere inkludert Windows)
- Konsistent spacing-mønster på alle innholdsseksjoner: h2-tittel → intro-tekst (med ramme) → liste/kort med `margin-top: var(--space-4)` og `gap: var(--space-4)`. Gjelder forvaltningsråd, praktiske designtiltak, symbioser og datakvalitet — én sannhetskilde for vertikal rytme.
- Prototype-banner («Prototype under utvikling — sist oppdatert {dato}» / «Prototype under development — last updated {dato}») ligger i footer som dempet linje, ikke som topbanner. Skjules i print.
- Designreferanse: [designmanual.oslo.kommune.no](https://designmanual.oslo.kommune.no)

---

## 14. Sentrale arkitektur-beslutninger

| Beslutning | Begrunnelse |
|---|---|
| Server-proxy for Anthropic | API-nøkkel aldri eksponert i frontend |
| Hardkodet Oslo-grønnstruktur-liste | Sikrer at KI får faktisk geo-data (ikke spekulerer på lokaliteter), kun aktivert i Oslo-bounding-boks |
| `priorityScore` med tre vekter | Replikerbart, lett å justere, samme terskel i picker og portrett |
| Anti-hallusinering som overordnet prinsipp | Brukerne er fagfolk som vil oppdage spekulasjoner; falsk informasjon ødelegger tilliten |
| Tom liste vises eksplisitt i UI | Synliggjør at KI vurderte feltet, ikke at det er glemt |
| Lovsitater alltid norske | Lovdata er norsk kilde; oversettelse skader presisjon |
| Bekreftelses-modal uten kostnadsinformasjon | Brukerønske — kostnad er drift-perspektiv, ikke bruker-perspektiv |
| Heatmap som overlay i naturportrett-kart (default på) | Gir umiddelbar visuell kontekst om datatetthet uten å kreve at brukeren navigerer til egen side. Toggle av/på hvis ønsket. |
| MAX_SPECIES = 500 (ikke 60) | Tidligere kappet alltid på 60 så oppsummeringen viste samme tall. iNaturalist + GBIF gir teoretisk maks ~200, så 500 er bare safety-net. |
| Prototype-banner i footer, ikke topp | Mindre påtrengende i den faktiske brukerflyten; informerer fortsatt om status uten å konkurrere med Oslo-banneret |

---

## 15. Portrett-cache (24-timers TTL)

Implementert juni 2026 etter brukerobservasjon at språkbytte frem og tilbake regenererte portrettet hver gang (sløsing av tokens).

KI-output (alle portretttyper) cachees i `localStorage` med 24-timers TTL. `usePortraitGeneration.generate()` sjekker cache **før** fetch — hit gir instant retur uten loading-spinner og uten KI-kostnad.

| Scenario | Atferd |
|---|---|
| Generere et portrett første gang | Vanlig SSE-fetch + lagring i cache |
| Bytte språk NO → EN → NO | Andre returrunde er cache-hit (sparer ett KI-kall) |
| Tilbake til steg 3 → annet valg → tilbake til første | Cache-hit (sparer KI-kall) |
| Refresh side / cross-tab | Cache-hit innen TTL |
| Etter 24 timer | Cache invalidert, ny generering |

Cache-nøkkel: `lagCacheNokkel(portraitType, payload)` bygger nøkkel av (koordinater 5 desimaler, radius, språk, subject-id/NiN-kode). Prefiks `naturportrett.portrett-cache.*`.

`cleanupExpired()` kjøres ved app-start og rydder utløpte entries. Ved `QuotaExceededError` ryddes utløpte først, deretter ny forsøk; til slutt hopper vi cache-lagring stille (generering fungerer fortsatt).

Personvern: lagrer koordinater + radius + språk + subject-ID. Ingen personlig identifiserbar info.

---

## 16. Mobil-tilpasning

Brukere er primært på desktop, men prototypen må kunne leses på mobiltelefon **uten horisontal scroll**.

### `useIsMobile()`-hook
Terskel 720 px. Brukes for JSX-betinget rendering (f.eks. `<ResponsiveTable>` velger mellom tabell og card-layout).

### `<ResponsiveTable>`-komponent
Multikol-tabeller (3+ kolonner) bytter til card-layout på mobil: hver rad blir et eget kort med felt-label over verdi. Brukt i bl.a. naturtype-tabellen, næringskilde-tabeller, tilknyttede arter.

### `.portrait-doc__table--label-value`-klasse
Label-value-tabeller (én `<th>` + én `<td>` per rad — vanlig i beskrivelse, habitatkrav, spredning, viktige strukturer) stacker hver rad vertikalt på mobil: liten label-overskrift over verdi.

### `<ExpandableText>`-komponent
Lange tekstavsnitt forkortes til ~220 tegn på mobil (kuttet ved nærmeste setningsbrudd) med «Vis mer»-knapp. På desktop vises hele teksten alltid.

### Andre mobil-grep
- Arts-tabellen i naturportrettet: skjuler kategori- og datakvalitet-kolonnene på mobil (kategori vises som badge under norsk navn)
- Lovsitater alltid kollaps som default (`<details>`) på både mobil og desktop — JS-handler åpner alle ved `beforeprint` så PDF får sitatene
- Heatmap-effekt forsterket på mobil: radius 22 → 45 px, blur 28 → 55 px, minOpacity 0.35 → 0.6
- Header-logo 50 % større, kollisjon-håndtering med `flex-wrap`
- Konsistent 1100 px max-width på alle steg

Alle endringene er gated bak `@media (max-width: 720px)` eller `useIsMobile` — desktop er uendret.

---

## 17. Hva som ikke er implementert ennå

Roadmap-emner som er notert men ikke realisert (oppdateres når noe begynner):

- **RAG-integrasjon for Kunnskapsbase-PDF-ene** — planlagt juli 2026
- **Naturbase-integrasjon** (Miljødirektoratets habitat-data) — vil heve viktig-natur- og KU-screeningen i planportrettet fra «observasjonsbasert» til «forvaltningsdatabasert»
- **Artsdatabanken-API** for live rødliste/fremmedartsliste (i dag lokal datafil)
- **Polygon/areal-input** som alternativ til punkt + radius (særlig viktig for planportrett — en plansak har en avgrensning, ikke et punkt)
- **Brukerautentisering** — i dag åpen tjeneste, admin-passord på admin-endepunkt
- **Lagring og eksport av vurderinger** som strukturert data (i tillegg til PDF) + «Eksport til saksmappe»-knapp for planportrett
- **Filtrering av arter til PDF-eksport** — i dag eksporterer PDF det som vises i nettleseren
- **Versjonering** av planportretter med dato slik at et portrett kan «fryses» som vedlegg til en bestemt saksfremstilling

---

## Endringshistorikk

Se [DEVLOG.md](DEVLOG.md) for full kronologisk historikk over iterasjoner siden mai 2026.
