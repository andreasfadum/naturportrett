import PortrettMetadata from './PortrettMetadata.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import TiltakListe from '../portrait-shared/TiltakListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'

export default function NaturtypeportrettView({ portrait, subject }) {
  const p = portrait || {}

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">Naturtypeportrett</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      <section className="portrait-doc__hero">
        <div className="portrait-doc__hero-left">
          <div className="portrait-doc__name-box">{p.navn}</div>
          {p.ninKode && <div className="portrait-doc__sciname-box">NiN-kode: {p.ninKode}</div>}
          {p.utbredelse && (
            <div className="portrait-doc__factbox-inline" style={{ marginTop: 'var(--space-3)' }}>
              <strong>Utbredelse:</strong> {p.utbredelse}
            </div>
          )}
        </div>
        <div className="portrait-doc__hero-middle">
          <ConservationStatusBadge status={p.rodlisteStatus} />
        </div>
      </section>

      {p.beskrivelse && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Beskrivelse</h2>
          <table className="portrait-doc__table">
            <tbody>
              {p.beskrivelse.utseende && <tr><th>Utseende</th><td>{p.beskrivelse.utseende}</td></tr>}
              {p.beskrivelse.struktur && <tr><th>Struktur</th><td>{p.beskrivelse.struktur}</td></tr>}
              {p.beskrivelse.okologiskSaerpreg && <tr><th>Økologisk særpreg</th><td>{p.beskrivelse.okologiskSaerpreg}</td></tr>}
              {p.beskrivelse.viktigeElementer && <tr><th>Viktige elementer</th><td>{p.beskrivelse.viktigeElementer}</td></tr>}
            </tbody>
          </table>
        </section>
      )}

      {p.viktigeStrukturer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Viktige strukturer/elementer</h2>
          <table className="portrait-doc__table">
            <tbody>
              {p.viktigeStrukturer.vegetasjon && <tr><th>Vegetasjon</th><td>{p.viktigeStrukturer.vegetasjon}</td></tr>}
              {p.viktigeStrukturer.hydrologi && <tr><th>Hydrologi</th><td>{p.viktigeStrukturer.hydrologi}</td></tr>}
              {p.viktigeStrukturer.substrat && <tr><th>Substrat</th><td>{p.viktigeStrukturer.substrat}</td></tr>}
              {p.viktigeStrukturer.topografi && <tr><th>Topografi</th><td>{p.viktigeStrukturer.topografi}</td></tr>}
            </tbody>
          </table>
        </section>
      )}

      {p.okologiskeForhold && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Økologiske forhold</h2>
          {Array.isArray(p.okologiskeForhold.typiskeArter) && p.okologiskeForhold.typiskeArter.length > 0 && (
            <div className="portrait-doc__factbox-inline">
              <strong>Typiske arter:</strong> {p.okologiskeForhold.typiskeArter.join(', ')}
            </div>
          )}
          {Array.isArray(p.okologiskeForhold.nokkelarter) && p.okologiskeForhold.nokkelarter.length > 0 && (
            <div className="portrait-doc__factbox-inline">
              <strong>Nøkkelarter:</strong> {p.okologiskeForhold.nokkelarter.join(', ')}
            </div>
          )}
          {p.okologiskeForhold.naturtypeFunksjoner && (
            <div className="portrait-doc__factbox-inline">
              <strong>Naturtypefunksjoner:</strong> {p.okologiskeForhold.naturtypeFunksjoner}
            </div>
          )}
          {p.okologiskeForhold.naturligDynamikk && (
            <div className="portrait-doc__factbox-inline">
              <strong>Naturlig dynamikk:</strong> {p.okologiskeForhold.naturligDynamikk}
            </div>
          )}
        </section>
      )}

      {Array.isArray(p.hjemmehorendeArterGronneTak) && p.hjemmehorendeArterGronneTak.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Hjemmehørende arter relevant for grønne tak</h2>
          <ul className="portrait-doc__textblock">
            {p.hjemmehorendeArterGronneTak.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>
      )}

      {p.tidsaspekter && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Tidsaspekter</h2>
          {p.tidsaspekter.arstidsvariasjon && (
            <div className="portrait-doc__factbox-inline"><strong>Årstidsvariasjon:</strong> {p.tidsaspekter.arstidsvariasjon}</div>
          )}
          {p.tidsaspekter.forstyrrelsesregime && (
            <div className="portrait-doc__factbox-inline"><strong>Forstyrrelsesregime:</strong> {p.tidsaspekter.forstyrrelsesregime}</div>
          )}
        </section>
      )}

      {p.trussler && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Påvirkningsfaktorer og trusler</h2>
          {p.trussler.naturlige && (
            <div className="portrait-doc__factbox-inline"><strong>Naturlige trusler:</strong> {p.trussler.naturlige}</div>
          )}
          {p.trussler.menneskeskapte && (
            <div className="portrait-doc__factbox-inline"><strong>Menneskeskapte trusler:</strong> {p.trussler.menneskeskapte}</div>
          )}
        </section>
      )}

      {p.samspillMedMennesker && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Samspill med mennesker</h2>
          {p.samspillMedMennesker.kulturellVerdi && (
            <div className="portrait-doc__factbox-inline"><strong>Kulturell verdi / historisk bruk:</strong> {p.samspillMedMennesker.kulturellVerdi}</div>
          )}
          {p.samspillMedMennesker.friluftsliv && (
            <div className="portrait-doc__factbox-inline"><strong>Friluftsliv:</strong> {p.samspillMedMennesker.friluftsliv}</div>
          )}
          {p.samspillMedMennesker.konflikter && (
            <div className="portrait-doc__factbox-inline"><strong>Konflikter / utfordringer:</strong> {p.samspillMedMennesker.konflikter}</div>
          )}
        </section>
      )}

      {p.kommentarer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Kommentarer</h2>
          <div className="portrait-doc__textblock">{p.kommentarer}</div>
        </section>
      )}

      <TiltakListe items={p.praktiskeDesigntiltak} />

      <LegalReferences items={p.relevanteLoverEnriched} />

      <DataKvalitetSeksjon items={p.datakvalitet} />

      <FeedbackKnapp
        portretttype="naturtypeportrett"
        kontekst={{ subjekt: p.navn ? `${p.navn}${p.ninKode ? ' (' + p.ninKode + ')' : ''}` : null }}
        seksjoner={[
          'Beskrivelse', 'Viktige strukturer', 'Økologiske forhold',
          'Hjemmehørende arter på grønne tak', 'Trusler', 'Samspill med mennesker',
          'Praktiske designtiltak', 'Relevant lovgrunnlag', 'Datakvalitet',
        ]}
      />

      <PortrettMetadata referanseprosjekt={p.navn} />
    </article>
  )
}
