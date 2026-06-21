import PortrettMetadata from './PortrettMetadata.jsx'
import YearCycleTimeline from './YearCycleTimeline.jsx'
import AttributeChecklist from './AttributeChecklist.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import TiltakListe from '../portrait-shared/TiltakListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'

export default function PlanteportrettView({ portrait, subject }) {
  const p = portrait || {}

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      {/* Header */}
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">Planteportrett</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      {/* Toppblokk */}
      <section className="portrait-doc__hero">
        <div className="portrait-doc__hero-left">
          <div className="portrait-doc__name-box">{p.folkenavn}</div>
          <div className="portrait-doc__sciname-box"><em>{p.vitenskapelig}</em></div>
          <div className="portrait-doc__h3" style={{ marginTop: 'var(--space-5)' }}>Karakteristikker</div>
          {p.artsfamilie && <FactBox label="Artsfamilie" value={p.artsfamilie} />}
          {p.utbredelse && <FactBox label="Utbredelse" value={p.utbredelse} />}
          {p.lokaliteterVedProsjektomrade && <FactBox label="Lokaliteter ved prosjektområde" value={p.lokaliteterVedProsjektomrade} />}
        </div>
        <div className="portrait-doc__hero-middle">
          <ConservationStatusBadge status={p.rodlisteStatus} />
        </div>
        <div className="portrait-doc__hero-right">
          {subject?.photoSquareUrl && (
            <img src={subject.photoSquareUrl} alt={p.folkenavn} className="portrait-doc__hero-photo" />
          )}
        </div>
      </section>

      {/* Beskrivelse + Foretrukne naturtyper */}
      <section className="portrait-doc__two-col">
        <div>
          <h2 className="portrait-doc__h2">Beskrivelse</h2>
          <table className="portrait-doc__table">
            <tbody>
              {p.beskrivelse?.plantetype && <tr><th>Plantetype</th><td>{p.beskrivelse.plantetype}</td></tr>}
              {p.beskrivelse?.storrelse && <tr><th>Størrelse</th><td>{p.beskrivelse.storrelse}</td></tr>}
              {p.beskrivelse?.farger && <tr><th>Farger</th><td>{p.beskrivelse.farger}</td></tr>}
              {p.beskrivelse?.vekstform && <tr><th>Vekstform</th><td>{p.beskrivelse.vekstform}</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="portrait-doc__h2">Foretrukne naturtyper</h2>
          <div className="portrait-doc__textblock">{p.foretrukneNaturtyper}</div>
        </div>
      </section>

      {/* Blomstringstid */}
      {Array.isArray(p.blomstringstid) && (
        <section className="portrait-doc__section">
          <YearCycleTimeline
            title="Blomstringstid"
            rows={[{ label: 'Blomstring', activeMonths: p.blomstringstid }]}
          />
        </section>
      )}

      {/* Habitatkrav + Spredning/livssyklus */}
      <section className="portrait-doc__two-col">
        {p.habitatkrav && (
          <div>
            <h2 className="portrait-doc__h2">Habitatkrav</h2>
            <table className="portrait-doc__table">
              <thead><tr><th>Krav</th><th>Detaljer</th></tr></thead>
              <tbody>
                {p.habitatkrav.fuktighet && <tr><th>Fuktighet</th><td>{p.habitatkrav.fuktighet}</td></tr>}
                {p.habitatkrav.klimasone && <tr><th>Klimasone</th><td>{p.habitatkrav.klimasone}</td></tr>}
                {p.habitatkrav.hardforhet && <tr><th>Hardførhet</th><td>{p.habitatkrav.hardforhet}</td></tr>}
                {p.habitatkrav.lysforhold && <tr><th>Lysforhold</th><td>{p.habitatkrav.lysforhold}</td></tr>}
                {p.habitatkrav.vindtoleranse && <tr><th>Vindtoleranse</th><td>{p.habitatkrav.vindtoleranse}</td></tr>}
                {p.habitatkrav.jordtype && <tr><th>Jordtype og dybde</th><td>{p.habitatkrav.jordtype}</td></tr>}
                {p.habitatkrav.ph && <tr><th>pH</th><td>{p.habitatkrav.ph}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {p.spredningOgLivssyklus && (
          <div>
            <h2 className="portrait-doc__h2">Spredning og livssyklus</h2>
            <table className="portrait-doc__table">
              <tbody>
                {p.spredningOgLivssyklus.frospredning && <tr><th>Frøspredning</th><td>{p.spredningOgLivssyklus.frospredning}</td></tr>}
                {p.spredningOgLivssyklus.etableringsvilkar && <tr><th>Etableringsvilkår</th><td>{p.spredningOgLivssyklus.etableringsvilkar}</td></tr>}
                {p.spredningOgLivssyklus.levetid && <tr><th>Levetid</th><td>{p.spredningOgLivssyklus.levetid}</td></tr>}
                {p.spredningOgLivssyklus.overvintringsevne && <tr><th>Overvintringsevne</th><td>{p.spredningOgLivssyklus.overvintringsevne}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Tilknyttede arter + Trusler */}
      <section className="portrait-doc__two-col">
        {Array.isArray(p.tilknyttedeArter) && p.tilknyttedeArter.length > 0 && (
          <div>
            <h2 className="portrait-doc__h2">Tilknyttede arter</h2>
            <table className="portrait-doc__table portrait-doc__table--small">
              <thead><tr><th>Arter</th><th>Detaljer</th></tr></thead>
              <tbody>
                {p.tilknyttedeArter.map((r, i) => <tr key={i}><td>{r.art}</td><td>{r.detaljer}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
        {p.trussler && (
          <div>
            <h2 className="portrait-doc__h2">Trusler</h2>
            <div className="portrait-doc__textblock">{p.trussler}</div>
          </div>
        )}
      </section>

      {/* Pollinator + Samspill */}
      <section className="portrait-doc__two-col">
        {p.pollinatorVerdi && (
          <div>
            <h2 className="portrait-doc__h2">Pollinator-verdi</h2>
            <table className="portrait-doc__table">
              <thead><tr><th>Kvalitet</th><th>Detaljer</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>{p.pollinatorVerdi.kvalitet}</strong></td>
                  <td>{p.pollinatorVerdi.detaljer}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {p.samspillMedMennesker && (
          <div>
            <h2 className="portrait-doc__h2">Samspill med mennesker</h2>
            <div className="portrait-doc__textblock">{p.samspillMedMennesker}</div>
          </div>
        )}
      </section>

      {/* Attributter */}
      {p.attributter && (
        <section className="portrait-doc__section">
          <AttributeChecklist items={[
            { label: 'Nøkkelart', value: p.attributter.nokkelart },
            { label: 'Art av høy økologisk verdi', value: p.attributter.hoyOkologiskVerdi },
            { label: 'Ansvarsart', value: p.attributter.ansvarsart },
            { label: 'Art av nasjonal forvaltningsinteresse', value: p.attributter.nasjonalForvaltningsinteresse },
            { label: 'Hjemmehørende i norsk natur', value: p.attributter.hjemmehorende },
            { label: 'Finnes i norsk produksjon', value: p.attributter.finnesINorskProduksjon },
            { label: 'Matplante for dyr (bær/frø/frukt/nøtter)', value: p.attributter.matplanteForDyr },
            { label: 'Finnes i norsk natur', value: p.attributter.finnesINorskNatur },
          ]} />
        </section>
      )}

      {/* Erfaring + samplanting */}
      {p.erfaringsgrunnlagINorge && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Erfaringsgrunnlag i Norge</h2>
          <div className="portrait-doc__textblock">{p.erfaringsgrunnlagINorge}</div>
        </section>
      )}
      {p.anbefaltSamplanting && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Anbefalt samplanting</h2>
          <div className="portrait-doc__textblock">{p.anbefaltSamplanting}</div>
        </section>
      )}
      {p.vedlikeholdsbehov && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Vedlikeholdsbehov</h2>
          <div className="portrait-doc__textblock">{p.vedlikeholdsbehov}</div>
        </section>
      )}
      {p.saerskilteHensyn && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Særskilte hensyn</h2>
          <div className="portrait-doc__textblock">{p.saerskilteHensyn}</div>
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
        portretttype="planteportrett"
        kontekst={{
          subjekt: p.folkenavn && p.vitenskapelig ? `${p.folkenavn} (${p.vitenskapelig})` : (p.folkenavn || p.vitenskapelig || null),
        }}
        seksjoner={[
          'Rødlistestatus', 'Utbredelse', 'Beskrivelse', 'Foretrukne naturtyper',
          'Habitatkrav', 'Spredning og livssyklus', 'Tilknyttede arter',
          'Praktiske designtiltak', 'Relevant lovgrunnlag', 'Datakvalitet',
        ]}
      />

      <PortrettMetadata referanseprosjekt={p.folkenavn} />
    </article>
  )
}

function FactBox({ label, value }) {
  if (!value) return null
  return (
    <div className="portrait-doc__factbox-inline">
      <strong>{label}</strong> {value}
    </div>
  )
}
