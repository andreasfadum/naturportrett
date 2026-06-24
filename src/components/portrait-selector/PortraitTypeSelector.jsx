import { useT } from '../../i18n/index.jsx'

export default function PortraitTypeSelector({ onSelect, onBack }) {
  const t = useT()
  const options = [
    {
      type: 'naturtypeportrett',
      tittel: t('velger.naturtype.tittel'),
      beskrivelse: t('velger.naturtype.beskrivelse'),
      ikon: '🌳',
    },
    {
      type: 'artsportrett',
      tittel: t('velger.arts.tittel'),
      beskrivelse: t('velger.arts.beskrivelse'),
      ikon: '🦜',
    },
    {
      type: 'planteportrett',
      tittel: t('velger.plante.tittel'),
      beskrivelse: t('velger.plante.beskrivelse'),
      ikon: '🌿',
    },
    {
      type: 'planportrett',
      tittel: t('velger.plan.tittel'),
      beskrivelse: t('velger.plan.beskrivelse'),
      ikon: '📋',
    },
  ]

  return (
    <div className="portrait-type-selector">
      <h1 className="portrait-page-title">{t('velger.tittel')}</h1>
      <p style={{ color: '#555', marginBottom: 'var(--space-6)' }}>{t('velger.intro')}</p>

      <div className="portrait-type-grid">
        {options.map(opt => (
          <button
            key={opt.type}
            type="button"
            className="portrait-type-card"
            onClick={() => onSelect(opt.type)}
          >
            <div className="portrait-type-card__icon">{opt.ikon}</div>
            <div className="portrait-type-card__title">{opt.tittel}</div>
            <div className="portrait-type-card__desc">{opt.beskrivelse}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          {t('velger.tilbake')}
        </button>
      </div>
    </div>
  )
}
