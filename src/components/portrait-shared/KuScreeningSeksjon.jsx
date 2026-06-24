import { useT } from '../../i18n/index.jsx'

/**
 * Viser KU-screening — naturrelaterte momenter til vurdering av om saken
 * kan utløse krav om konsekvensutredning (pbl § 4-2 andre ledd) +
 * forslag til utredningstemaer hvis KU er aktuelt. ALDRI en konklusjon.
 */
export default function KuScreeningSeksjon({ data }) {
  const t = useT()
  if (!data || typeof data !== 'object') return null

  const indikasjon = data.indikasjon || 'ikke-vurdert'
  const momenter = Array.isArray(data.momenter) ? data.momenter : []
  const temaer = Array.isArray(data.utredningstemaer) ? data.utredningstemaer : []

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('planportrett.ku.tittel')}</h2>

      <div className={`ku-screening__indikasjon ku-screening__indikasjon--${indikasjon}`}>
        <span className="ku-screening__label">{t('planportrett.ku.indikasjon-label')}</span>
        <span className="ku-screening__verdi">{t(`planportrett.ku.indikasjon.${indikasjon}`)}</span>
      </div>

      {momenter.length > 0 && (
        <div className="ku-screening__blokk">
          <h3 className="portrait-doc__h3">{t('planportrett.ku.momenter-tittel')}</h3>
          <ul className="ku-screening__liste">
            {momenter.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {temaer.length > 0 && (
        <div className="ku-screening__blokk">
          <h3 className="portrait-doc__h3">{t('planportrett.ku.utredningstemaer-tittel')}</h3>
          <ul className="ku-screening__liste">
            {temaer.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
      )}

      {momenter.length === 0 && temaer.length === 0 && (
        <p className="ku-screening__tom">{t('planportrett.ku.tom')}</p>
      )}

      {data.forbehold && (
        <p className="ku-screening__forbehold">
          <strong>{t('planportrett.ku.forbehold-label')}</strong> {data.forbehold}
        </p>
      )}
    </section>
  )
}
