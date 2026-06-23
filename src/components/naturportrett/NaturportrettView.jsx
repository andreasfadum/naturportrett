import { useMemo, useState } from 'react'
import PortrettMetadata from '../detail-portrait/PortrettMetadata.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import ForvaltningsradListe from '../portrait-shared/ForvaltningsradListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import AreaMap from './AreaMap.jsx'
import ResponsiveTable from '../portrait-shared/ResponsiveTable.jsx'
import ExpandableText from '../portrait-shared/ExpandableText.jsx'
import { useIsMobile } from '../../hooks/useIsMobile.js'
import { useT, useSprak } from '../../i18n/index.jsx'

const ANTALL_TIL_KI = 25
const TERSKEL_KATEGORI_FILTER = 30

function formatRadius(meter) {
  if (meter >= 1000) {
    const km = meter / 1000
    return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meter} m`
}

function formatObsDato(iso, sprak) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const maaneder = sprak === 'en'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']
  return `${maaneder[d.getMonth()]} ${d.getFullYear()}`
}

export default function NaturportrettView({ portrait, address, species = [], speciesByCategory = {}, zoneRadiusM = 500 }) {
  const p = portrait || {}
  const t = useT()
  const { sprak } = useSprak()
  const erMobil = useIsMobile()
  const radiusTekst = formatRadius(zoneRadiusM)

  // Berik KI-utvalg ("høy økologisk verdi"-arter) med datakvalitet fra species-pipelinen
  const arterMedKvalitet = useMemo(() => {
    const lookup = new Map()
    for (const sp of species) {
      const key = (sp.scientificNameDisplay || sp.scientificName || '').toLowerCase().trim().split(' ').slice(0, 2).join(' ')
      if (key) lookup.set(key, sp)
    }
    const ki = Array.isArray(p.arterAvHoyOkologiskVerdi) ? p.arterAvHoyOkologiskVerdi : []
    return ki.map(a => {
      const key = (a.vitenskapelig || '').toLowerCase().trim().split(' ').slice(0, 2).join(' ')
      const match = lookup.get(key)
      return {
        ...a,
        _lastObservedDate: match?.lastObservedDate || null,
        _priorityScore: typeof match?.priorityScore === 'number' ? match.priorityScore : null,
      }
    })
  }, [p.arterAvHoyOkologiskVerdi, species])

  const antallTotalt = species.length
  const antallIPortrett = arterMedKvalitet.length
  const antallTilKI = Math.min(ANTALL_TIL_KI, antallTotalt)

  // Kategori-filter aktiveres når KI-utvalget er stort
  const visKategoriFilter = antallIPortrett > TERSKEL_KATEGORI_FILTER
  const [valgtKategori, setValgtKategori] = useState('alle')
  const kategorierIArter = useMemo(() => {
    const counts = {}
    for (const a of arterMedKvalitet) {
      if (a.kategori) counts[a.kategori] = (counts[a.kategori] || 0) + 1
    }
    return counts
  }, [arterMedKvalitet])
  const filtrerteArter = useMemo(() => {
    if (!visKategoriFilter || valgtKategori === 'alle') return arterMedKvalitet
    return arterMedKvalitet.filter(a => a.kategori === valgtKategori)
  }, [arterMedKvalitet, valgtKategori, visKategoriFilter])

  const visOppsummering = antallTotalt > ANTALL_TIL_KI || antallIPortrett > 0

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      {/* Header */}
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">{t('naturportrett.tittel')}</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      {/* Prosjektområde */}
      <section className="portrait-doc__section">
        <div className="portrait-doc__fact-grid">
          <FactBox label={t('fact.prosjektnavn')} value={p.prosjektnavn} />
          <FactBox label={t('fact.lokasjon')} value={p.lokasjon} />
          <FactBox label={t('fact.antall-verdifulle')} value={p.antallVerdifulleNaturomrader} />
        </div>
      </section>

      {/* Slik knytter dette seg til eiendommen — R6-innspill 17. juni */}
      {p.eiendomsKontekst && (
        <section className="eiendomskontekst">
          <h2 className="eiendomskontekst__tittel">{t('naturportrett.eiendomskontekst.tittel')}</h2>
          <ExpandableText className="eiendomskontekst__brodtekst">{p.eiendomsKontekst}</ExpandableText>
          <p className="eiendomskontekst__forklaring">
            {t('naturportrett.eiendomskontekst.forklaring', { radius: radiusTekst })}
          </p>
        </section>
      )}

      {/* Oversiktskart */}
      <section className="portrait-doc__section">
        <h2 className="portrait-doc__h2">{t('naturportrett.oversiktskart', { radius: radiusTekst })}</h2>
        <AreaMap
          lat={address.representasjonspunkt?.lat}
          lon={address.representasjonspunkt?.lon}
          radiusM={zoneRadiusM}
          label={p.prosjektnavn || address.adressenavn}
        />
      </section>

      {/* Naturtyper */}
      {Array.isArray(p.naturtyper) && p.naturtyper.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('naturportrett.naturtyper', { radius: radiusTekst })}</h2>
          <ResponsiveTable
            headers={[
              t('tabell.naturtype'),
              t('tabell.nin-kode'),
              t('tabell.rodliste'),
              t('tabell.beskrivelse'),
              t('tabell.avhengige-arter'),
            ]}
            rows={p.naturtyper.map(nt => [
              <strong>{nt.navn}</strong>,
              nt.ninKode || '–',
              nt.rodlisteStatus || '–',
              nt.beskrivelse,
              nt.avhengigeArter || '–',
            ])}
          />
        </section>
      )}

      {/* Arter */}
      {antallIPortrett > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('naturportrett.arter-hoy-verdi', { radius: radiusTekst })}</h2>

          {visKategoriFilter && (
            <div className="arter-kategori-filter">
              <p className="arter-kategori-filter__intro">{t('arter.kategori.intro')}</p>
              <div className="arter-kategori-filter__pills">
                <button
                  type="button"
                  className={`arter-kategori-pill${valgtKategori === 'alle' ? ' arter-kategori-pill--aktiv' : ''}`}
                  onClick={() => setValgtKategori('alle')}
                >
                  {t('arter.kategori.alle')} ({antallIPortrett})
                </button>
                {Object.entries(kategorierIArter)
                  .sort((a, b) => b[1] - a[1])
                  .map(([kat, n]) => (
                    <button
                      key={kat}
                      type="button"
                      className={`arter-kategori-pill${valgtKategori === kat ? ' arter-kategori-pill--aktiv' : ''}`}
                      onClick={() => setValgtKategori(kat)}
                    >
                      {kat} ({n})
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* På mobil: skjul kategori- og datakvalitet-kolonnene via CSS.
              Kategori vises i stedet som et lite badge under norsk navn
              (kun mobil) — desktop forblir uendret med 5 kolonner. */}
          <table className="portrait-doc__table arts-tabell--kompakt-pa-mobil">
            <thead>
              <tr>
                <th>{t('tabell.norsk-navn')}</th>
                <th>{t('tabell.vitenskapelig')}</th>
                <th className="arts-tabell__kategori-kolonne">{t('tabell.kategori')}</th>
                <th>{t('tabell.status')}</th>
                <th className="arts-tabell__datakvalitet-kolonne">{t('arter.tabell.datakvalitet')}</th>
              </tr>
            </thead>
            <tbody>
              {filtrerteArter.map((a, i) => (
                <tr key={i}>
                  <td>
                    <strong>{a.navn}</strong>
                    {erMobil && a.kategori && (
                      <span className="arts-tabell__kategori-badge">{a.kategori}</span>
                    )}
                  </td>
                  <td><em>{a.vitenskapelig}</em></td>
                  <td className="arts-tabell__kategori-kolonne">{a.kategori}</td>
                  <td>{a.status}</td>
                  <td className="arts-tabell__datakvalitet-kolonne">
                    <DatakvalitetCelle score={a._priorityScore} dato={a._lastObservedDate} sprak={sprak} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visOppsummering && (
            <div className="arter-oppsummering">
              <p className="arter-oppsummering__tekst">
                {t('arter.oppsummering.kort', {
                  antallTotalt,
                  antallTilKI,
                  antallIPortrett,
                })}
              </p>
              <div className="arter-oppsummering__fordeling">
                <strong>{t('arter.oppsummering.fordeling')}</strong>
                {Object.entries(speciesByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([kat, n]) => (
                    <span key={kat} className="arter-oppsummering__pill">
                      {kat}: {n}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tekstseksjoner — ExpandableText forkorter på mobil */}
      <TextSection title={t('seksjon.okologiske-sammenhenger')} body={p.okologiskeSammenhenger} />
      <TextSection title={t('seksjon.trusler')} body={p.trusler} />
      <TextSection title={t('seksjon.spesielt-viktige')} body={p.spesieltViktigeOmrader} />
      {/* TextSection bruker ExpandableText internt (oppdatert nederst i filen) */}

      <ForvaltningsradListe items={p.forvaltningsrad} />

      <LegalReferences items={p.relevanteLoverEnriched} />

      <TextSection title={t('seksjon.andre-kilder')} body={p.andreKilder} />

      <DataKvalitetSeksjon items={p.datakvalitet} />

      <FeedbackKnapp
        portretttype="naturportrett"
        kontekst={{
          adresse: `${address.adressenavn || ''}${address.nummer ? ' ' + address.nummer : ''}${address.postnummer ? ', ' + address.postnummer : ''}`.trim(),
          koordinater: address.representasjonspunkt ? [address.representasjonspunkt.lat, address.representasjonspunkt.lon] : null,
          subjekt: p.prosjektnavn || null,
        }}
        seksjoner={[
          t('seksjon.naturtyper-feedback'),
          t('seksjon.arter-feedback'),
          t('seksjon.okologiske-feedback'),
          t('seksjon.trusler-feedback'),
          t('seksjon.spesielt-feedback'),
          t('seksjon.forvaltning-feedback'),
          t('seksjon.lovgrunnlag-feedback'),
          t('seksjon.datakvalitet-feedback'),
        ]}
      />

      <PortrettMetadata referanseprosjekt={p.prosjektnavn || address.adressenavn} />
    </article>
  )
}

function FactBox({ label, value }) {
  if (!value) return null
  return (
    <div className="portrait-doc__factbox">
      <div className="portrait-doc__factbox-label">{label}</div>
      <div className="portrait-doc__factbox-value">{value}</div>
    </div>
  )
}

/**
 * Liten celle med fargekode for datakvalitet + sist-observert-dato.
 * Score-tersklene 0.65 og 0.35 stemmer med beregnPriorityScore() — grønn
 * = research-grade nylig, gul = brukbart, rød = gammelt / få observasjoner.
 */
function DatakvalitetCelle({ score, dato, sprak, t }) {
  let nivaa = 'ukjent'
  let nivaaLabel = t('arter.datakvalitet.ukjent')
  if (typeof score === 'number') {
    if (score >= 0.65) { nivaa = 'hoy'; nivaaLabel = t('arter.datakvalitet.hoy') }
    else if (score >= 0.35) { nivaa = 'mid'; nivaaLabel = t('arter.datakvalitet.middels') }
    else { nivaa = 'lav'; nivaaLabel = t('arter.datakvalitet.lav') }
  }
  const datoTekst = formatObsDato(dato, sprak) || t('arter.datakvalitet.ingen-dato')
  return (
    <span className={`dk-celle dk-celle--${nivaa}`} title={nivaaLabel}>
      <span className="dk-celle__dot" aria-hidden="true" />
      <span className="dk-celle__tekst">{datoTekst}</span>
    </span>
  )
}

function TextSection({ title, body }) {
  if (!body) return null
  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{title}</h2>
      <ExpandableText className="portrait-doc__textblock">{body}</ExpandableText>
    </section>
  )
}
