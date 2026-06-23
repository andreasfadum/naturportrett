import PortrettMetadata from './PortrettMetadata.jsx'
import YearCycleTimeline from './YearCycleTimeline.jsx'
import AttributeChecklist from './AttributeChecklist.jsx'
import ConservationStatusBadge from './ConservationStatusBadge.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import TiltakListe from '../portrait-shared/TiltakListe.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import SymbioseSeksjon from '../portrait-shared/SymbioseSeksjon.jsx'
import ResponsiveTable from '../portrait-shared/ResponsiveTable.jsx'
import { useT } from '../../i18n/index.jsx'

export default function PlanteportrettView({ portrait, subject }) {
  const p = portrait || {}
  const t = useT()

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">{t('detalj.planteportrett.tittel')}</h1>
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
          {p.lokaliteterVedProsjektomrade && <FactBox label={t('portrett.lokaliteter-prosjekt')} value={p.lokaliteterVedProsjektomrade} />}
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
          <table className="portrait-doc__table portrait-doc__table--label-value">
            <tbody>
              {p.beskrivelse?.plantetype && <tr><th>{t('portrett.plantetype')}</th><td>{p.beskrivelse.plantetype}</td></tr>}
              {p.beskrivelse?.storrelse && <tr><th>{t('portrett.storrelse')}</th><td>{p.beskrivelse.storrelse}</td></tr>}
              {p.beskrivelse?.farger && <tr><th>{t('portrett.farger')}</th><td>{p.beskrivelse.farger}</td></tr>}
              {p.beskrivelse?.vekstform && <tr><th>{t('portrett.vekstform')}</th><td>{p.beskrivelse.vekstform}</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="portrait-doc__h2">{t('portrett.foretrukne-naturtyper')}</h2>
          <div className="portrait-doc__textblock">{p.foretrukneNaturtyper}</div>
        </div>
      </section>

      {Array.isArray(p.blomstringstid) && (
        <section className="portrait-doc__section">
          <YearCycleTimeline
            title={t('portrett.blomstringstid')}
            rows={[{ label: t('portrett.blomstring'), activeMonths: p.blomstringstid }]}
          />
        </section>
      )}

      <section className="portrait-doc__two-col">
        {p.habitatkrav && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.habitatkrav')}</h2>
            <table className="portrait-doc__table portrait-doc__table--label-value">
              <tbody>
                {p.habitatkrav.fuktighet && <tr><th>{t('portrett.fuktighet')}</th><td>{p.habitatkrav.fuktighet}</td></tr>}
                {p.habitatkrav.klimasone && <tr><th>{t('portrett.klimasone')}</th><td>{p.habitatkrav.klimasone}</td></tr>}
                {p.habitatkrav.hardforhet && <tr><th>{t('portrett.hardforhet')}</th><td>{p.habitatkrav.hardforhet}</td></tr>}
                {p.habitatkrav.lysforhold && <tr><th>{t('portrett.lysforhold')}</th><td>{p.habitatkrav.lysforhold}</td></tr>}
                {p.habitatkrav.vindtoleranse && <tr><th>{t('portrett.vindtoleranse')}</th><td>{p.habitatkrav.vindtoleranse}</td></tr>}
                {p.habitatkrav.jordtype && <tr><th>{t('portrett.jord')}</th><td>{p.habitatkrav.jordtype}</td></tr>}
                {p.habitatkrav.ph && <tr><th>{t('portrett.ph')}</th><td>{p.habitatkrav.ph}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {p.spredningOgLivssyklus && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.spredning')}</h2>
            <table className="portrait-doc__table portrait-doc__table--label-value">
              <tbody>
                {p.spredningOgLivssyklus.frospredning && <tr><th>{t('portrett.frospredning')}</th><td>{p.spredningOgLivssyklus.frospredning}</td></tr>}
                {p.spredningOgLivssyklus.etableringsvilkar && <tr><th>{t('portrett.etablering')}</th><td>{p.spredningOgLivssyklus.etableringsvilkar}</td></tr>}
                {p.spredningOgLivssyklus.levetid && <tr><th>{t('portrett.levetid')}</th><td>{p.spredningOgLivssyklus.levetid}</td></tr>}
                {p.spredningOgLivssyklus.overvintringsevne && <tr><th>{t('portrett.overvintringsevne')}</th><td>{p.spredningOgLivssyklus.overvintringsevne}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="portrait-doc__two-col">
        {Array.isArray(p.tilknyttedeArter) && p.tilknyttedeArter.length > 0 && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.tilknyttede-arter')}</h2>
            <ResponsiveTable
              className="portrait-doc__table--small"
              headers={[t('portrett.arter'), t('portrett.detaljer')]}
              rows={p.tilknyttedeArter.map(r => [r.art, r.detaljer])}
            />
          </div>
        )}
        {p.trussler && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.trusler')}</h2>
            <div className="portrait-doc__textblock">{p.trussler}</div>
          </div>
        )}
      </section>

      <section className="portrait-doc__two-col">
        {p.pollinatorVerdi && (
          <div>
            <h2 className="portrait-doc__h2">{t('portrett.pollinator-verdi')}</h2>
            <ResponsiveTable
              headers={[t('portrett.kvalitet'), t('portrett.detaljer')]}
              rows={[[<strong>{p.pollinatorVerdi.kvalitet}</strong>, p.pollinatorVerdi.detaljer]]}
            />
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

      {p.erfaringsgrunnlagINorge && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.erfaringsgrunnlag')}</h2>
          <div className="portrait-doc__textblock">{p.erfaringsgrunnlagINorge}</div>
        </section>
      )}
      {p.anbefaltSamplanting && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.samplanting')}</h2>
          <div className="portrait-doc__textblock">{p.anbefaltSamplanting}</div>
        </section>
      )}
      {p.vedlikeholdsbehov && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.vedlikehold')}</h2>
          <div className="portrait-doc__textblock">{p.vedlikeholdsbehov}</div>
        </section>
      )}
      {p.saerskilteHensyn && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('portrett.saerskilte-hensyn')}</h2>
          <div className="portrait-doc__textblock">{p.saerskilteHensyn}</div>
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
        portretttype="planteportrett"
        kontekst={{
          subjekt: p.folkenavn && p.vitenskapelig ? `${p.folkenavn} (${p.vitenskapelig})` : (p.folkenavn || p.vitenskapelig || null),
        }}
        seksjoner={[
          t('rodliste.tittel'),
          t('portrett.utbredelse'),
          t('portrett.beskrivelse'),
          t('portrett.foretrukne-naturtyper'),
          t('portrett.habitatkrav'),
          t('portrett.spredning'),
          t('portrett.tilknyttede-arter'),
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
