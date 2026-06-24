/**
 * Bygger en Lovdata-URL fra en kandidat-hjemmel-streng som
 *   "pbl § 12-7 nr. 4"  →  https://lovdata.no/dokument/NL/lov/2008-06-27-71/§12-7
 *   "nml § 8"           →  https://lovdata.no/dokument/NL/lov/2009-06-19-100/§8
 *
 * Brukes for planportrettets bestemmelsesforslag, der KI returnerer
 * kandidat-hjemmelen som tekst (ikke et strukturert objekt). Vi tar
 * det første paragrafnummeret og bygger URL — Lovdata-siden ruller
 * brukeren til riktig sted via fragment-id-en (§12-7).
 *
 * Returnerer null hvis ingen kjent lov eller ingen paragraf funnet.
 */

const LOV_URL_BASE = {
  pbl: 'https://lovdata.no/dokument/NL/lov/2008-06-27-71',
  nml: 'https://lovdata.no/dokument/NL/lov/2009-06-19-100',
  friluftsloven: 'https://lovdata.no/dokument/NL/lov/1957-06-28-16',
  forvaltningsloven: 'https://lovdata.no/dokument/NL/lov/1967-02-10',
  sak10: 'https://lovdata.no/dokument/SF/forskrift/2010-03-26-488',
}

export function lovdataLenke(kandidatHjemmel) {
  if (typeof kandidatHjemmel !== 'string') return null
  const tekst = kandidatHjemmel.toLowerCase()

  let lovId = null
  for (const id of Object.keys(LOV_URL_BASE)) {
    if (tekst.includes(id)) { lovId = id; break }
  }
  if (!lovId) return null

  // Match første paragrafnummer: § eller "paragraf" + tall(-tall valgfritt)
  // Eksempler vi vil treffe: "§ 8", "§ 12-7", "§ 4-2", "§ 12-7 nr. 6"
  const m = kandidatHjemmel.match(/§\s*(\d+(?:-\d+[a-z]?)?)/i)
  if (!m) return `${LOV_URL_BASE[lovId]}` // fall tilbake til lov-rot
  return `${LOV_URL_BASE[lovId]}/§${m[1]}`
}
