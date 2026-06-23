import PortrettMetadata from './PortrettMetadata.jsx'
import YearCycleTimeline from './YearCycleTimeline.jsx'
import AttributeChecklist from './AttributeChecklist.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import TiltakListe from '../portrait-shared/TiltakListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import { useT } from '../../i18n/index.jsx'

export default function ArtsportrettView({ portrait, subject }) {
  const p = portrait || {}
  const t = useT()

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">{t('detalj.artsportrett.tittel')}</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      <section className="portrait-doc__hero">
        <div className="portrait-doc__hero-left">
          <div className="portrait-doc__name-box">{p.folkenavn}</div>
          <div className="portrait-doc__sciname-box"><em>{p.vitenskapelig}</em></div>
          <div className="portrait-doc__h3" style={{ marginTop: 'var(--space-5)' }}>{t('portrett.karakteristikker')}</div>
          {p.artsfamilie && <FactBox label={t('portrett.artsfamilie')} value={p.artsfamilie} />}
          {p.utbredelse && <FactBox label={t('portrett.utbredelse')} value={p.utbredelse} />}
        </div>
        <div className="portrait-doc__hero-middle">
          <ConservationStatusBadge status={p.rodlisteStatus} />
        </div>
        <div className="portrait-doc__hero-right">
          {(subject?.photoLargeUrl || subject?.photoMediumUrl || subject?.photoSquareUrl) && (
            <img
              src={subject.photoLargeUrl || subject.photoMediumUrl || subject.photoSquareUrl}
              alt={p.folkenavn}
              className="portrait-doc__hero-photo"
            />
          )}
        </div>
      </section>

      <section className="portrait-doc__two-col">
        <div>
          <h2 className="portrait-doc__h2">{t('portrett.beskrivelse')}</h2>
          <table className="portrait-doc__table">
            <tbody>
              {p.beskrivelse?.storrelse && <tr><th>{t('portrett.storrelse')}</th><td>{p.beskrivelse.storrelse}</td></tr>}
              {p.beskrivelse?.farger && <tr><th>{t('portrett.farger')}</th><td>{p.beskrivelse.farger}</td></tr>}
              {p.beskrivelse?.hannkjonn && <tr><th>{t('portrett.hannkjonn')}</th><td>{p.beskrivelse.hannkjonn}</td></tr>}
              {p.beskrivelse?.hunnkjonn && <tr><th>{t('portrett.hunnkjonn')}</th><td>{p.beskrivelse.hunnkjonn}</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="portrait-doc__h2">{t('portrett.foretrukne-habitater')}</h2>
          <div className="portrait-doc__textblock">{p.foretrukneHabitater}</div>
        </div>
      </section>

      {p.arssyklus && (
        <section className="portrait-doc__section">
          <YearCycleTimeline
            title={t('portrett.aarssyklus')}
            rows={[
              { label: t('portrett.avl-oppvekst'), activeMonths: p.arssyklus.avlOgOppvekst || [] },
              { label: t('portrett.voksen'), activeMonths: p.arssyklus.voksen || [] },
              { label: t('portrett.overvintring'), activeMonths: p.arssyklus.overvintring || [] },
            ]}
          />
        </section>
      )}

      <section className="portrait-doc__three-col">
        <DetailTable title={t('portrett.plantebaserte')} rows={p.plantebaserteNaeringskilder} colA={t('portrett.art-plantetype')} colB={t('portrett.detaljer')} keyA="art" keyB="detaljer" />
        <DetailTable title={t('portrett.habitatstottende-planter')} rows={p.habitatStottendePlanter} colA={t('portrett.art-plantetype')} colB={t('portrett.detaljer')} keyA="art" keyB="detaljer" />
        <DetailTable title={t('portrett.dyrebaserte')} rows={p.dyrebasertNaeringskilder} colA={t('portrett.art-dyretype')} colB={t('portrett.detaljer')} keyA="art" keyB="detaljer" />
      </section>

      <section className="portrait-doc__two-col">
        {p.trusslerOgPredatorer && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.trusler-predatorer')}</h2>
            <div className="portrait-doc__textblock">{p.trusslerOgPredatorer}</div>
          </div>
        )}
        {p.samspillMedMennesker && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.samspill-mennesker')}</h2>
            <div className="portrait-doc__textblock">{p.samspillMedMennesker}</div>
          </div>
        )}
      </section>

      {p.attributter && (
        <section className="portrait-doc__section">
          <AttributeChecklist items={[
            { label: t('portrett.nokkelart'), value: p.attributter.nokkelart },
            { label: t('portrett.hoy-okologisk-verdi'), value: p.attributter.hoyOkologiskVerdi },
            { label: t('portrett.ansvarsart'), value: p.attributter.ansvarsart },
            { label: t('portrett.nasjonal-forvaltning'), value: p.attributter.nasjonalForvaltningsinteresse },
          ]} />
        </section>
      )}

      {p.atferdsprofil && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.atferdsprofil')}</h2>
          {p.atferdsprofil.parringsatferd && (
            <SubSection title={t('portrett.parringsatferd')} body={p.atferdsprofil.parringsatferd} />
          )}
          {p.atferdsprofil.voksen && (
            <SubSection title={t('portrett.voksen')} body={p.atferdsprofil.voksen} />
          )}
          {p.atferdsprofil.romligeForhold && (
            <SubSection title={t('portrett.romlige-overvintring')} body={p.atferdsprofil.romligeForhold} />
          )}
        </section>
      )}

      <TiltakListe items={p.praktiskeDesigntiltak} />

      {p.kommentarer && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.kommentarer')}</h2>
          <div className="portrait-doc__textblock">{p.kommentarer}</div>
        </section>
      )}

      <LegalReferences items={p.relevanteLoverEnriched} />

      {p.lenkeBildeEllerLyd && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.lenke-mediafil')}</h2>
          <div className="portrait-doc__textblock"><a href={p.lenkeBildeEllerLyd}>{p.lenkeBildeEllerLyd}</a></div>
        </section>
      )}

      <DataKvalitetSeksjon items={p.datakvalitet} />

      <FeedbackKnapp
        portretttype="artsportrett"
        kontekst={{
          subjekt: p.folkenavn && p.vitenskapelig ? `${p.folkenavn} (${p.vitenskapelig})` : (p.folkenavn || p.vitenskapelig || null),
        }}
        seksjoner={[
          t('rodliste.tittel'),
          t('portrett.utbredelse'),
          t('portrett.beskrivelse'),
          t('portrett.foretrukne-habitater'),
          t('portrett.aarssyklus'),
          t('portrett.plantebaserte'),
          t('portrett.trusler-predatorer'),
          t('tiltak.tittel'),
          t('lov.tittel'),
          t('datakvalitet.tittel'),
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
