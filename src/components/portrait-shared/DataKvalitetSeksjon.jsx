import { useT } from '../../i18n/index.jsx'

const VURDERING_KLASSE = {
  god: 'datakvalitet-badge--god',
  delvis: 'datakvalitet-badge--delvis',
  mangelfull: 'datakvalitet-badge--mangelfull',
}

const VURDERING_KEY = {
  god: 'datakvalitet.god',
  delvis: 'datakvalitet.delvis',
  mangelfull: 'datakvalitet.mangelfull',
}

export default function DataKvalitetSeksjon({ items }) {
  const t = useT()
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('datakvalitet.tittel')}</h2>
      <p className="portrait-doc__textblock">{t('datakvalitet.intro')}</p>
      <div className="datakvalitet-liste">
        {items.map((item, i) => {
          const vurdering = (item.vurdering || '').toLowerCase()
          const badgeKlasse = VURDERING_KLASSE[vurdering] || 'datakvalitet-badge--ukjent'
          const label = VURDERING_KEY[vurdering] ? t(VURDERING_KEY[vurdering]) : (vurdering || t('datakvalitet.ukjent'))
          return (
            <article key={i} className="datakvalitet-item">
              <header className="datakvalitet-item__header">
                <span className={`datakvalitet-badge ${badgeKlasse}`}>{label}</span>
                <h3 className="datakvalitet-item__seksjon">{item.seksjon || t('datakvalitet.uten-navn')}</h3>
              </header>
              {item.kortBegrunnelse && (
                <p className="datakvalitet-item__begrunnelse">{item.kortBegrunnelse}</p>
              )}
              {item.anbefaltFeltarbeid && (
                <p className="datakvalitet-item__feltarbeid">
                  <strong>{t('datakvalitet.feltarbeid')}</strong> {item.anbefaltFeltarbeid}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
