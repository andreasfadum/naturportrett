const KATEGORI_LABEL = {
  lovstyrt_krav: 'Lovstyrt krav',
  frivillig_forbedring: 'Frivillig forbedring',
}

const KATEGORI_KLASSE = {
  lovstyrt_krav: 'tiltak-badge--lovstyrt',
  frivillig_forbedring: 'tiltak-badge--frivillig',
}

const FASE_LABEL = {
  tidligfase: 'Tidligfase',
  reguleringsplan: 'Reguleringsplan',
  utomhusplan: 'Utomhusplan',
  gjennomforing: 'Gjennomføring',
}

export default function TiltakListe({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">Praktiske designtiltak</h2>
      <p className="portrait-doc__textblock">
        Hvert tiltak er merket som <strong>lovstyrt krav</strong> — noe en saksbehandler kan stille som krav i lovstyrte prosesser — eller <strong>frivillig forbedring</strong> uten konkret hjemmelsgrunnlag. Hjemmel-feltet peker tilbake til paragrafene under «Relevant lovgrunnlag».
      </p>
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
                  {KATEGORI_LABEL[kategori] || 'Ukategorisert'}
                </span>
                {fase && (
                  <span className="tiltak-fase">{FASE_LABEL[fase] || fase}</span>
                )}
              </div>
              <p className="tiltak-kort__tiltak">{item.tiltak}</p>
              {erLovstyrt && item.hjemmel && (
                <p className="tiltak-hjemmel">
                  <strong>Hjemmel:</strong> {item.hjemmel}
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
