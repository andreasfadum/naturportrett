import PortrettMetadata from './PortrettMetadata.jsx'
import YearCycleTimeline from './YearCycleTimeline.jsx'
import AttributeChecklist from './AttributeChecklist.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'

export default function ArtsportrettView({ portrait, subject }) {
  const p = portrait || {}

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      {/* Header */}
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">Artsportrett</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      {/* Toppblokk: navn + bilde + status */}
      <section className="portrait-doc__hero">
        <div className="portrait-doc__hero-left">
          <div className="portrait-doc__name-box">{p.folkenavn}</div>
          <div className="portrait-doc__sciname-box"><em>{p.vitenskapelig}</em></div>
          <div className="portrait-doc__h3" style={{ marginTop: 'var(--space-5)' }}>Karakteristikker</div>
          {p.artsfamilie && <FactBox label="Artsfamilie" value={p.artsfamilie} />}
          {p.utbredelse && <FactBox label="Utbredelse" value={p.utbredelse} />}
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

      {/* Beskrivelse + Foretrukne habitater */}
      <section className="portrait-doc__two-col">
        <div>
          <h2 className="portrait-doc__h2">Beskrivelse</h2>
          <table className="portrait-doc__table">
            <tbody>
              {p.beskrivelse?.storrelse && <tr><th>Størrelse</th><td>{p.beskrivelse.storrelse}</td></tr>}
              {p.beskrivelse?.farger && <tr><th>Farger</th><td>{p.beskrivelse.farger}</td></tr>}
              {p.beskrivelse?.hannkjonn && <tr><th>Hannkjønn</th><td>{p.beskrivelse.hannkjonn}</td></tr>}
              {p.beskrivelse?.hunnkjonn && <tr><th>Hunnkjønn</th><td>{p.beskrivelse.hunnkjonn}</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="portrait-doc__h2">Foretrukne habitater</h2>
          <div className="portrait-doc__textblock">{p.foretrukneHabitater}</div>
        </div>
      </section>

      {/* Årssyklus */}
      {p.arssyklus && (
        <section className="portrait-doc__section">
          <YearCycleTimeline
            title="Årssyklus"
            rows={[
              { label: 'Avl og oppvekst', activeMonths: p.arssyklus.avlOgOppvekst || [] },
              { label: 'Voksen', activeMonths: p.arssyklus.voksen || [] },
              { label: 'Overvintring', activeMonths: p.arssyklus.overvintring || [] },
            ]}
          />
        </section>
      )}

      {/* Næringskilder */}
      <section className="portrait-doc__three-col">
        <DetailTable title="Plantebaserte næringskilder" rows={p.plantebaserteNaeringskilder} colA="Art/plantetype" colB="Detaljer" keyA="art" keyB="detaljer" />
        <DetailTable title="Habitatstøttende planter" rows={p.habitatStottendePlanter} colA="Art/plantetype" colB="Detaljer" keyA="art" keyB="detaljer" />
        <DetailTable title="Dyrebaserte næringskilder" rows={p.dyrebasertNaeringskilder} colA="Art/dyretype" colB="Detaljer" keyA="art" keyB="detaljer" />
      </section>

      {/* Trusler + Samspill */}
      <section className="portrait-doc__two-col">
        {p.trusslerOgPredatorer && (
          <div>
            <h2 className="portrait-doc__h2">Trusler og predatorer</h2>
            <div className="portrait-doc__textblock">{p.trusslerOgPredatorer}</div>
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
          ]} />
        </section>
      )}

      {/* Atferdsprofil */}
      {p.atferdsprofil && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Atferdsprofil</h2>
          {p.atferdsprofil.parringsatferd && (
            <SubSection title="Parringsatferd, avl og oppvekst" body={p.atferdsprofil.parringsatferd} />
          )}
          {p.atferdsprofil.voksen && (
            <SubSection title="Voksen" body={p.atferdsprofil.voksen} />
          )}
          {p.atferdsprofil.romligeForhold && (
            <SubSection title="Romlige forhold og overvintring" body={p.atferdsprofil.romligeForhold} />
          )}
        </section>
      )}

      {/* Praktiske designtiltak */}
      {Array.isArray(p.praktiskeDesigntiltak) && p.praktiskeDesigntiltak.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Praktiske designtiltak</h2>
          <ul className="portrait-doc__textblock">
            {p.praktiskeDesigntiltak.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      )}

      {/* Kommentarer */}
      {p.kommentarer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Kommentarer</h2>
          <div className="portrait-doc__textblock">{p.kommentarer}</div>
        </section>
      )}

      <LegalReferences items={p.relevanteLoverEnriched} />

      {/* Lenke */}
      {p.lenkeBildeEllerLyd && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Lenke til bilde/lyd</h2>
          <div className="portrait-doc__textblock"><a href={p.lenkeBildeEllerLyd}>{p.lenkeBildeEllerLyd}</a></div>
        </section>
      )}

      <DataKvalitetSeksjon items={p.datakvalitet} />

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

function DetailTable({ title, rows, colA, colB, keyA, keyB }) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  return (
    <div>
      <h3 className="portrait-doc__h3">{title}</h3>
      <table className="portrait-doc__table portrait-doc__table--small">
        <thead>
          <tr><th>{colA}</th><th>{colB}</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r[keyA]}</td>
              <td>{r[keyB]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SubSection({ title, body }) {
  return (
    <div className="portrait-doc__subsection">
      <strong>{title}:</strong> {body}
    </div>
  )
}
