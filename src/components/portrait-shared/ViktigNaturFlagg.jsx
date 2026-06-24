import { useT } from '../../i18n/index.jsx'

/**
 * Viser viktig-natur-graden som et fargekodet badge med begrunnelse.
 * Indikasjon, ikke konklusjon — sammen med forbehold om at vurderingen
 * må verifiseres med feltkartlegging der grunnlaget er tynt.
 */
export default function ViktigNaturFlagg({ data }) {
  const t = useT()
  if (!data || typeof data !== 'object') return null

  const grad = data.grad || 'ukjent'
  const klasse = `viktig-natur-flagg viktig-natur-flagg--${grad}`

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('planportrett.viktig-natur.tittel')}</h2>

      <div className={klasse}>
        <div className="viktig-natur-flagg__grad">
          <span className="viktig-natur-flagg__label">{t('planportrett.viktig-natur.grad-label')}</span>
          <span className="viktig-natur-flagg__verdi">{t(`planportrett.viktig-natur.grad.${grad}`)}</span>
        </div>
        {data.anbefalUtvidetKapittel === true && (
          <p className="viktig-natur-flagg__anbefaling">
            {t('planportrett.viktig-natur.anbefal-utvidet')}
          </p>
        )}
      </div>

      {Array.isArray(data.begrunnelse) && data.begrunnelse.length > 0 && (
        <ul className="viktig-natur-flagg__begrunnelse">
          {data.begrunnelse.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}

      {data.forbehold && (
        <p className="viktig-natur-flagg__forbehold">
          <strong>{t('planportrett.viktig-natur.forbehold-label')}</strong> {data.forbehold}
        </p>
      )}
    </section>
  )
}
