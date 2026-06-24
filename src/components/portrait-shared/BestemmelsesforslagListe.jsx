import { useT } from '../../i18n/index.jsx'
import { lovdataLenke } from '../../utils/lovdataLenke.js'

/**
 * Lister bestemmelsesforslag — tema, materielt behov, kandidat-hjemmel
 * og skisse til ordlyd. Hver oppføring har en obligatorisk
 * "må-avklares-med-jurist"-markør, og over hele listen ligger et
 * forbehold om at dette er kandidater, ikke ferdige bestemmelser.
 */
export default function BestemmelsesforslagListe({ items, forbehold }) {
  const t = useT()
  if (!Array.isArray(items)) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('planportrett.bestemmelser.tittel')}</h2>

      <div className="bestemmelser__forbehold">
        <strong>{t('planportrett.bestemmelser.forbehold-label')}</strong>{' '}
        {forbehold || t('planportrett.bestemmelser.forbehold-fallback')}
      </div>

      {items.length === 0 ? (
        <p className="bestemmelser__tom">{t('planportrett.bestemmelser.tom')}</p>
      ) : (
        <ol className="bestemmelser-liste">
          {items.map((b, i) => (
            <li key={i} className="bestemmelser-liste__kort">
              <div className="bestemmelser-liste__tema">{b.tema}</div>

              {b.materieltBehov && (
                <div className="bestemmelser-liste__behov">
                  <span className="bestemmelser-liste__felt-label">{t('planportrett.bestemmelser.behov-label')}</span>{' '}
                  {b.materieltBehov}
                </div>
              )}

              {b.kandidatHjemmel && (() => {
                const url = lovdataLenke(b.kandidatHjemmel)
                return (
                  <div className="bestemmelser-liste__hjemmel">
                    <span className="bestemmelser-liste__felt-label">{t('planportrett.bestemmelser.hjemmel-label')}</span>{' '}
                    <code className="bestemmelser-liste__hjemmel-kode">{b.kandidatHjemmel}</code>
                    {b.hjemmelKategori && (
                      <span className="bestemmelser-liste__kategori">[{b.hjemmelKategori}]</span>
                    )}
                    {url && (
                      <a
                        className="bestemmelser-liste__hjemmel-lenke"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lovdata ↗
                      </a>
                    )}
                    <span className="bestemmelser-liste__hjemmel-merk">
                      {t('planportrett.bestemmelser.hjemmel-merk')}
                    </span>
                  </div>
                )
              })()}

              {b.skisseOrdlyd && (
                <div className="bestemmelser-liste__skisse">
                  <span className="bestemmelser-liste__felt-label">{t('planportrett.bestemmelser.skisse-label')}</span>
                  <blockquote className="bestemmelser-liste__skisse-tekst">{b.skisseOrdlyd}</blockquote>
                </div>
              )}

              {b.alleredeSikretAnnetSted && (
                <div className="bestemmelser-liste__overlapp">
                  <span className="bestemmelser-liste__felt-label">{t('planportrett.bestemmelser.overlapp-label')}</span>{' '}
                  {b.alleredeSikretAnnetSted}
                </div>
              )}

              <div className="bestemmelser-liste__jurist">
                {t('planportrett.bestemmelser.maa-avklares')}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
