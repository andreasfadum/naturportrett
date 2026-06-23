import PortrettMetadata from '../detail-portrait/PortrettMetadata.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import ForvaltningsradListe from '../portrait-shared/ForvaltningsradListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import AreaMap from './AreaMap.jsx'
import { useT } from '../../i18n/index.jsx'

function formatRadius(meter) {
  if (meter >= 1000) {
    const km = meter / 1000
    return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meter} m`
}

export default function NaturportrettView({ portrait, address, species, zoneRadiusM = 500 }) {
  const p = portrait || {}
  const t = useT()
  const radiusTekst = formatRadius(zoneRadiusM)

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
          <p className="eiendomskontekst__brodtekst">{p.eiendomsKontekst}</p>
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
          <table className="portrait-doc__table">
            <thead>
              <tr>
                <th>{t('tabell.naturtype')}</th>
                <th>{t('tabell.nin-kode')}</th>
                <th>{t('tabell.rodliste')}</th>
                <th>{t('tabell.beskrivelse')}</th>
              </tr>
            </thead>
            <tbody>
              {p.naturtyper.map((nt, i) => (
                <tr key={i}>
                  <td><strong>{nt.navn}</strong></td>
                  <td>{nt.ninKode || '–'}</td>
                  <td>{nt.rodlisteStatus || '–'}</td>
                  <td>{nt.beskrivelse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Arter */}
      {Array.isArray(p.arterAvHoyOkologiskVerdi) && p.arterAvHoyOkologiskVerdi.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('naturportrett.arter-hoy-verdi', { radius: radiusTekst })}</h2>
          <table className="portrait-doc__table">
            <thead>
              <tr>
                <th>{t('tabell.norsk-navn')}</th>
                <th>{t('tabell.vitenskapelig')}</th>
                <th>{t('tabell.kategori')}</th>
                <th>{t('tabell.status')}</th>
              </tr>
            </thead>
            <tbody>
              {p.arterAvHoyOkologiskVerdi.map((a, i) => (
                <tr key={i}>
                  <td><strong>{a.navn}</strong></td>
                  <td><em>{a.vitenskapelig}</em></td>
                  <td>{a.kategori}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Tekstseksjoner */}
      <TextSection title={t('seksjon.okologiske-sammenhenger')} body={p.okologiskeSammenhenger} />
      <TextSection title={t('seksjon.trusler')} body={p.trusler} />
      <TextSection title={t('seksjon.spesielt-viktige')} body={p.spesieltViktigeOmrader} />

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

function TextSection({ title, body }) {
  if (!body) return null
  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{title}</h2>
      <div className="portrait-doc__textblock">{body}</div>
    </section>
  )
}
