import { useT } from '../../i18n/index.jsx'

const KATEGORI_KEY = {
  lovstyrt_krav: 'tiltak.lovstyrt',
  frivillig_forbedring: 'tiltak.frivillig',
}

const KATEGORI_KLASSE = {
  lovstyrt_krav: 'tiltak-badge--lovstyrt',
  frivillig_forbedring: 'tiltak-badge--frivillig',
}

const FASE_KEY = {
  tidligfase: 'tiltak.fase.tidligfase',
  reguleringsplan: 'tiltak.fase.reguleringsplan',
  utomhusplan: 'tiltak.fase.utomhusplan',
  gjennomforing: 'tiltak.fase.gjennomforing',
}

export default function TiltakListe({ items }) {
  const t = useT()
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('tiltak.tittel')}</h2>
      <p className="portrait-doc__textblock">{t('tiltak.intro')}</p>
      <ol className="tiltak-liste">
        {items.map((item, i) => {
          if (typeof item === 'string') {
            return (
              <li key={i} className="tiltak-kort tiltak-kort--legacy">
                {item}
              </li>
            )
          }

          const kategori = (item.kategori || '').toLowerCase()
          const fase = (item.fase || '').toLowerCase()
          const erLovstyrt = kategori === 'lovstyrt_krav'

          return (
            <li key={i} className="tiltak-kort">
              <div className="tiltak-kort__header">
                <span className={`tiltak-badge ${KATEGORI_KLASSE[kategori] || 'tiltak-badge--ukjent'}`}>
                  {KATEGORI_KEY[kategori] ? t(KATEGORI_KEY[kategori]) : t('tiltak.ukategorisert')}
                </span>
                {fase && (
                  <span className="tiltak-fase">{FASE_KEY[fase] ? t(FASE_KEY[fase]) : fase}</span>
                )}
              </div>
              <p className="tiltak-kort__tiltak">{item.tiltak}</p>
              {erLovstyrt && item.hjemmel && (
                <p className="tiltak-hjemmel">
                  <strong>{t('tiltak.hjemmel')}</strong> {item.hjemmel}
                </p>
              )}
              {item.begrunnelse && (
                <p className="tiltak-kort__begrunnelse">{item.begrunnelse}</p>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
