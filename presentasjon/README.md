# Naturportrett — Presentasjon

PowerPoint-presentasjon (20 slides) som forklarer Naturportrett-prototypen for ikke-tekniske ledere.

## Fil

- **`Naturportrett_prototype.pptx`** — selve presentasjonen, åpnes i PowerPoint, Keynote eller LibreOffice Impress
- **`generate_pptx.py`** — Python-skript som genererer PPTen (kan kjøres på nytt etter endringer)

## Slide-oversikt

| # | Slide | Innhold |
|---|---|---|
| 1 | Tittel | Naturportrett — KI-drevet vurdering av biologisk mangfold |
| 2 | Hvorfor? | 3 kort: tidlig naturhensyn, fragmentert kunnskap, KI sammenstiller |
| 3 | Hvem? | Saksbehandler / Arkitekt / Eiendomsutvikler |
| 4 | Produkter | 4 kort: Naturportrett / Naturtype / Arts / Plante |
| 5 | Hva portrettet inneholder | Mockup av artsportrett-layout |
| 6 | Brukerflyt | 5 steg: adresse → naturportrett → portrettype → subjekt → detalj |
| 7 | Demo steg 1 | Adressesøk (Vahls gate 1) |
| 8 | Demo steg 2 | Naturportrett genereres (kart + arts-tabell) |
| 9 | Demo steg 3 | Detaljportrett + PDF (Ringdue) |
| 10 | Arkitektur | Tre-lags: nettleser, server, KI-modell |
| 11 | Datakilder | Hub-and-spoke med 6 datakilder |
| 12 | KI: gjør / gjør ikke | To-kolonne sammenligning + kvalitetssikrings-advarsel |
| 13 | Begrensninger | 4 punkter (rødliste-base, naturtyper, RAG, kvalitetssikring) |
| 14 | Veikart datakilder | Utvidet diagram med fremtidige kilder (grå) |
| 15 | Hva er RAG? | Sammenligning med/uten RAG + eksempel |
| 16 | RAG-arkitektur | 5-trinns flyt fra kunnskapsbase til kildebelagt portrett |
| 17 | Mer presisjon | 3 tiltak (geo, verifisering, fagvurdering) |
| 18 | UKE: arkitektur/drift | 4 sjekkpunkter (skybruk, ID-porten, FIKS, drift) |
| 19 | UKE: sikkerhet | 5 sjekkpunkter (API-nøkler, TLS, OWASP, logging, DPIA) |
| 20 | Neste steg | 4 tidsfestede tiltak + kontaktinfo |

## Regenerere

```bash
python3 presentasjon/generate_pptx.py
```

Krever `python-pptx`:
```bash
pip3 install --user python-pptx
```

## Skjermbilder

Slides 7, 8 og 9 inneholder mockups som etterligner skjermbildene fra live-prototypen. Hvis du ønsker faktiske skjermbilder fra `naturportrett.figurate.studio`:

1. Søk «Vahls gate 1» i prototypen
2. Ta skjermbilder av hvert steg (Cmd+Shift+4 på Mac for utsnitt)
3. Erstatt mockup-bokser i slidene manuelt i PowerPoint/Keynote

## Designprofil

Følger Oslo kommunes visuelle identitet:
- Fargepalett fra `src/index.css`
- Oslo Sans som primær font (med Calibri som fallback)
- Oslo-logo i mørkeblå variant (hvit på mørke slides)

## Tips for presentasjonen

- **Slide 7–9 er hjertet i demoen** — bruk gjerne god tid på å forklare flyten
- **Slide 10–11 forklarer «under panseret»** — det er her du bygger leders forståelse av hvordan ting henger sammen
- **Slide 15–16 er teknisk men viktig** — RAG er nøkkelen til kvalitetssprang
- **Slide 18–19 er praktisk for UKE-dialog** — du kan bruke disse direkte i workshop med UKE
