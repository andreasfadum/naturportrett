import PortrettMetadata from './PortrettMetadata.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import TiltakListe from '../portrait-shared/TiltakListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import SymbioseSeksjon from '../portrait-shared/SymbioseSeksjon.jsx'
import { useT, useSprak } from '../../i18n/index.jsx'
import { formatBuildDate } from '../../utils/buildDate.js'

export default function NaturtypeportrettView({ portrait, subject }) {
  const { sprak } = useSprak()
  const p = portrait || {}
  const t = useT()

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">{t('detalj.naturtypeportrett.tittel')}</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{formatBuildDate(__BUILD_DATE_ISO__, sprak)}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      <section className="portrait-doc__hero">
        <div className="portrait-doc__hero-left">
          <div className="portrait-doc__name-box">{p.navn}</div>
          {p.ninKode && <div className="portrait-doc__sciname-box">{t('tabell.nin-kode')}: {p.ninKode}</div>}
          {p.utbredelse && (
            <div className="portrait-doc__factbox-inline" style={{ marginTop: 'var(--space-3)' }}>
              <strong>{t('portrett.utbredelse')}:</strong> {p.utbredelse}
            </div>
          )}
        </div>
        <div className="portrait-doc__hero-middle">
          <ConservationStatusBadge status={p.rodlisteStatus} />
        </div>
      </section>

      {p.beskrivelse && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.beskrivelse')}</h2>
          <table className="portrait-doc__table portrait-doc__table--label-value">
            <tbody>
              {p.beskrivelse.utseende && <tr><th>{t('portrett.utseende')}</th><td>{p.beskrivelse.utseende}</td></tr>}
              {p.beskrivelse.struktur && <tr><th>{t('portrett.struktur')}</th><td>{p.beskrivelse.struktur}</td></tr>}
              {p.beskrivelse.okologiskSaerpreg && <tr><th>{t('portrett.okologisk-saerpreg')}</th><td>{p.beskrivelse.okologiskSaerpreg}</td></tr>}
              {p.beskrivelse.viktigeElementer && <tr><th>{t('portrett.viktige-elementer')}</th><td>{p.beskrivelse.viktigeElementer}</td></tr>}
            </tbody>
          </table>
        </section>
      )}

      {p.viktigeStrukturer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.viktige-strukturer')}</h2>
          <table className="portrait-doc__table portrait-doc__table--label-value">
            <tbody>
              {p.viktigeStrukturer.vegetasjon && <tr><th>{t('portrett.vegetasjon')}</th><td>{p.viktigeStrukturer.vegetasjon}</td></tr>}
              {p.viktigeStrukturer.hydrologi && <tr><th>{t('portrett.hydrologi')}</th><td>{p.viktigeStrukturer.hydrologi}</td></tr>}
              {p.viktigeStrukturer.substrat && <tr><th>{t('portrett.substrat')}</th><td>{p.viktigeStrukturer.substrat}</td></tr>}
              {p.viktigeStrukturer.topografi && <tr><th>{t('portrett.topografi')}</th><td>{p.viktigeStrukturer.topografi}</td></tr>}
            </tbody>
          </table>
        </section>
      )}

      {p.okologiskeForhold && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.okologiske-forhold')}</h2>
          {Array.isArray(p.okologiskeForhold.typiskeArter) && p.okologiskeForhold.typiskeArter.length > 0 && (
            <div className="portrait-doc__factbox-inline">
              <strong>{t('portrett.typiske-arter')}</strong> {p.okologiskeForhold.typiskeArter.join(', ')}
            </div>
          )}
          {Array.isArray(p.okologiskeForhold.nokkelarter) && p.okologiskeForhold.nokkelarter.length > 0 && (
            <div className="portrait-doc__factbox-inline">
              <strong>{t('portrett.nokkelarter')}</strong> {p.okologiskeForhold.nokkelarter.join(', ')}
            </div>
          )}
          {p.okologiskeForhold.naturtypeFunksjoner && (
            <div className="portrait-doc__factbox-inline">
              <strong>{t('portrett.naturtypefunksjoner')}</strong> {p.okologiskeForhold.naturtypeFunksjoner}
            </div>
          )}
          {p.okologiskeForhold.naturligDynamikk && (
            <div className="portrait-doc__factbox-inline">
              <strong>{t('portrett.naturlig-dynamikk')}</strong> {p.okologiskeForhold.naturligDynamikk}
            </div>
          )}
        </section>
      )}

      {Array.isArray(p.hjemmehorendeArterGronneTak) && p.hjemmehorendeArterGronneTak.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.hjemmehorende-tak')}</h2>
          <ul className="portrait-doc__textblock">
            {p.hjemmehorendeArterGronneTak.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>
      )}

      {p.tidsaspekter && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.tidsaspekter')}</h2>
          {p.tidsaspekter.arstidsvariasjon && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.aarstidsvariasjon')}</strong> {p.tidsaspekter.arstidsvariasjon}</div>
          )}
          {p.tidsaspekter.forstyrrelsesregime && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.forstyrrelsesregime')}</strong> {p.tidsaspekter.forstyrrelsesregime}</div>
          )}
        </section>
      )}

      {p.trussler && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.paavirkningsfaktorer')}</h2>
          {p.trussler.naturlige && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.naturlige-trusler')}</strong> {p.trussler.naturlige}</div>
          )}
          {p.trussler.menneskeskapte && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.menneskeskapte-trusler')}</strong> {p.trussler.menneskeskapte}</div>
          )}
        </section>
      )}

      {p.samspillMedMennesker && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.samspill-mennesker')}</h2>
          {p.samspillMedMennesker.kulturellVerdi && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.kulturell-verdi')}</strong> {p.samspillMedMennesker.kulturellVerdi}</div>
          )}
          {p.samspillMedMennesker.friluftsliv && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.friluftsliv')}</strong> {p.samspillMedMennesker.friluftsliv}</div>
          )}
          {p.samspillMedMennesker.konflikter && (
            <div className="portrait-doc__factbox-inline"><strong>{t('portrett.konflikter')}</strong> {p.samspillMedMennesker.konflikter}</div>
          )}
        </section>
      )}

      {p.kommentarer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.kommentarer')}</h2>
          <div className="portrait-doc__textblock">{p.kommentarer}</div>
        </section>
      )}

      <SymbioseSeksjon items={p.symbioser} />

      <TiltakListe items={p.praktiskeDesigntiltak} />

      <LegalReferences items={p.relevanteLoverEnriched} />

      <DataKvalitetSeksjon items={p.datakvalitet} />

      <FeedbackKnapp
        portretttype="naturtypeportrett"
        kontekst={{ subjekt: p.navn ? `${p.navn}${p.ninKode ? ' (' + p.ninKode + ')' : ''}` : null }}
        seksjoner={[
          t('portrett.beskrivelse'),
          t('portrett.viktige-strukturer'),
          t('portrett.okologiske-forhold'),
          t('portrett.hjemmehorende-tak'),
          t('portrett.trusler'),
          t('portrett.samspill-mennesker'),
          t('tiltak.tittel'),
          t('lov.tittel'),
          t('datakvalitet.tittel'),
        ]}
      />

      <PortrettMetadata referanseprosjekt={p.navn} />
    </article>
  )
}
