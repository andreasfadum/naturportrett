const VURDERING_KLASSE = {
  god: 'datakvalitet-badge--god',
  delvis: 'datakvalitet-badge--delvis',
  mangelfull: 'datakvalitet-badge--mangelfull',
}

const VURDERING_LABEL = {
  god: 'God',
  delvis: 'Delvis',
  mangelfull: 'Mangelfull',
}

export default function DataKvalitetSeksjon({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">Datakvalitet per tema</h2>
      <p className="portrait-doc__textblock">
        Hvor godt støtter datagrunnlaget det portrettet sier? Vurderingene under er KI-genererte estimater basert på hvilke kilder som dekker området — ikke en formell kvalitetssikring. Bruk dem til å se hvor du bør gjøre egen kartlegging før beslutninger.
      </p>
      <div className="datakvalitet-liste">
        {items.map((item, i) => {
          const vurdering = (item.vurdering || '').toLowerCase()
          const badgeKlasse = VURDERING_KLASSE[vurdering] || 'datakvalitet-badge--ukjent'
          const label = VURDERING_LABEL[vurdering] || vurdering || 'Ukjent'
          return (
            <article key={i} className="datakvalitet-item">
              <header className="datakvalitet-item__header">
                <span className={`datakvalitet-badge ${badgeKlasse}`}>{label}</span>
                <h3 className="datakvalitet-item__seksjon">{item.seksjon || 'Uten navn'}</h3>
              </header>
              {item.kortBegrunnelse && (
                <p className="datakvalitet-item__begrunnelse">{item.kortBegrunnelse}</p>
              )}
              {item.anbefaltFeltarbeid && (
                <p className="datakvalitet-item__feltarbeid">
                  <strong>Foreslått feltarbeid:</strong> {item.anbefaltFeltarbeid}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
