import PortrettMetadata from './PortrettMetadata.jsx'
import LegalReferences from '../legal/LegalReferences.jsx'
import InformasjonsbaseBanner from '../portrait-shared/InformasjonsbaseBanner.jsx'
import DataKvalitetSeksjon from '../portrait-shared/DataKvalitetSeksjon.jsx'
import ViktigNaturFlagg from '../portrait-shared/ViktigNaturFlagg.jsx'
import KuScreeningSeksjon from '../portrait-shared/KuScreeningSeksjon.jsx'
import BestemmelsesforslagListe from '../portrait-shared/BestemmelsesforslagListe.jsx'
import ExpandableText from '../portrait-shared/ExpandableText.jsx'
import FeedbackKnapp from '../feedback/FeedbackKnapp.jsx'
import { useT, useSprak } from '../../i18n/index.jsx'
import { formatBuildDate } from '../../utils/buildDate.js'

export default function PlanportrettView({ portrait, address }) {
  const { sprak } = useSprak()
  const p = portrait || {}
  const t = useT()

  const adresseStr = [
    address?.adressenavn,
    address?.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address?.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  const nma = p.naturmangfoldAvsnitt || {}

  return (
    <article className="portrait-doc">
      <InformasjonsbaseBanner />

      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">{t('planportrett.tittel')}</h1>
          <p className="portrait-doc__undertittel">{t('planportrett.undertittel')}</p>
          {adresseStr && <p className="planportrett__adresse">{adresseStr}</p>}
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{formatBuildDate(__BUILD_DATE_ISO__, sprak)}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      {p.eiendomsKontekst && (
        <section className="eiendomskontekst">
          <h2 className="eiendomskontekst__tittel">{t('naturportrett.eiendomskontekst.tittel')}</h2>
          <ExpandableText className="eiendomskontekst__brodtekst">{p.eiendomsKontekst}</ExpandableText>
        </section>
      )}

      {/* MODUL A — Naturmangfold-avsnitt */}
      <section className="portrait-doc__section">
        <h2 className="portrait-doc__h2">{t('planportrett.nma.tittel')}</h2>
        <p className="planportrett__modul-intro">{t('planportrett.nma.intro')}</p>

        {nma.kunnskapsgrunnlag?.tekst && (
          <div className="planportrett__underseksjon">
            <h3 className="portrait-doc__h3">{t('planportrett.nma.kunnskapsgrunnlag')}</h3>
            <ExpandableText className="portrait-doc__textblock">{nma.kunnskapsgrunnlag.tekst}</ExpandableText>
            {Array.isArray(nma.kunnskapsgrunnlag.kilder) && nma.kunnskapsgrunnlag.kilder.length > 0 && (
              <div className="planportrett__kilder">
                <strong>{t('planportrett.nma.kilder')}</strong>{' '}
                {nma.kunnskapsgrunnlag.kilder.join(' · ')}
              </div>
            )}
            {nma.kunnskapsgrunnlag.uttrekksdato && (
              <div className="planportrett__uttrekksdato">
                <strong>{t('planportrett.nma.uttrekksdato')}</strong> {nma.kunnskapsgrunnlag.uttrekksdato}
              </div>
            )}
          </div>
        )}

        {Array.isArray(nma.forevarMomenter) && nma.forevarMomenter.length > 0 && (
          <div className="planportrett__underseksjon">
            <h3 className="portrait-doc__h3">{t('planportrett.nma.forevar')}</h3>
            <ul className="planportrett__liste">
              {nma.forevarMomenter.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        {nma.samletBelastning && (
          <div className="planportrett__underseksjon">
            <h3 className="portrait-doc__h3">{t('planportrett.nma.samlet-belastning')}</h3>
            <ExpandableText className="portrait-doc__textblock">{nma.samletBelastning}</ExpandableText>
          </div>
        )}

        {Array.isArray(nma.forvaltningsmaalBeroert) && nma.forvaltningsmaalBeroert.length > 0 && (
          <div className="planportrett__underseksjon">
            <h3 className="portrait-doc__h3">{t('planportrett.nma.forvaltningsmaal')}</h3>
            <ul className="planportrett__liste">
              {nma.forvaltningsmaalBeroert.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        <p className="planportrett__saksbehandler-merk">
          {t('planportrett.nma.saksbehandler-merk')}
        </p>
      </section>

      {/* MODUL B — Viktig natur */}
      {p.viktigNatur && <ViktigNaturFlagg data={p.viktigNatur} />}

      {/* MODUL D — KU-screening */}
      {p.kuScreening && <KuScreeningSeksjon data={p.kuScreening} />}

      {/* MODUL C — Bestemmelsesforslag */}
      {Array.isArray(p.bestemmelsesforslag) && (
        <BestemmelsesforslagListe
          items={p.bestemmelsesforslag}
          forbehold={p.bestemmelsesforbehold}
        />
      )}

      {/* MODUL E — Område- og prosessavklaring */}
      {p.omradeProsessavklaringUnderlag && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">{t('planportrett.omrade-prosess.tittel')}</h2>
          <p className="planportrett__modul-intro">{t('planportrett.omrade-prosess.intro')}</p>
          <ExpandableText className="portrait-doc__textblock">{p.omradeProsessavklaringUnderlag}</ExpandableText>
        </section>
      )}

      {/* Felles felter */}
      <DataKvalitetSeksjon items={p.datakvalitet} />
      <LegalReferences items={p.relevanteLoverEnriched} />

      {p.samletForbehold && (
        <section className="portrait-doc__section planportrett__samlet-forbehold">
          <h2 className="portrait-doc__h2">{t('planportrett.samlet-forbehold.tittel')}</h2>
          <p>{p.samletForbehold}</p>
        </section>
      )}

      <PortrettMetadata />

      <FeedbackKnapp
        portretttype="planportrett"
        kontekst={adresseStr}
        seksjoner={[
          t('planportrett.nma.tittel'),
          t('planportrett.viktig-natur.tittel'),
          t('planportrett.ku.tittel'),
          t('planportrett.bestemmelser.tittel'),
          t('planportrett.omrade-prosess.tittel'),
        ]}
      />
    </article>
  )
}
