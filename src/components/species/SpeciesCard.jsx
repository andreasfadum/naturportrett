import { getCategoryCss, BADGE_LABEL_KEYS } from '../../utils/speciesCategories.js'
import { useT } from '../../i18n/index.jsx'

export default function SpeciesCard({ species, isSelected, alleredeLaget = false, onToggle }) {
  const categoryCss = getCategoryCss(species.category)
  const t = useT()

  const klasser = [
    'species-card',
    isSelected && 'species-card--selected',
    alleredeLaget && 'species-card--allerede-laget',
  ].filter(Boolean).join(' ')

  const tittel = alleredeLaget
    ? `${species.norwegianName} (${species.scientificNameDisplay}) — ${t('detalj.allerede-laget')}`
    : `${species.norwegianName} (${species.scientificNameDisplay})`

  return (
    <div
      className={klasser}
      onClick={() => onToggle(species)}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? onToggle(species) : null}
      title={tittel}
    >
      {alleredeLaget && (
        <div className="species-card__allerede-badge" aria-hidden="true">
          {t('detalj.allerede-laget')}
        </div>
      )}
      {/* Avkrysningsboks */}
      <div className="species-card__checkbox" aria-hidden="true">
        <svg viewBox="0 0 14 14">
          <polyline points="2,7 5,11 12,3" />
        </svg>
      </div>

      {/* Bilde — foretrekk medium (~500px), faller tilbake til square (75px) */}
      {(species.photoMediumUrl || species.photoSquareUrl) ? (
        <img
          className="species-card__photo"
          src={species.photoMediumUrl || species.photoSquareUrl}
          alt={species.norwegianName}
          loading="lazy"
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
          }}
        />
      ) : null}
      <div
        className="species-card__photo-placeholder"
        style={{ display: species.photoSquareUrl ? 'none' : 'flex' }}
      >
        <PlaceholderIcon category={species.category} />
      </div>

      {/* Innhold */}
      <div className="species-card__body">
        <div className="species-card__badges">
          <span className={`species-card__category species-card__category--${categoryCss}`}>
            {t(BADGE_LABEL_KEYS[species.category] || 'kategori.annet')}
          </span>
          {species.conservationStatus && (
            <ConservationBadge status={species.conservationStatus} t={t} />
          )}
        </div>
        <div className="species-card__name">{species.norwegianName}</div>
        <div className="species-card__scientific">{species.scientificNameDisplay}</div>
      </div>
    </div>
  )
}

function ConservationBadge({ status, t }) {
  const isRedlist = status.type === 'redlist'
  const bgColor = isRedlist
    ? (['CR', 'EN'].includes(status.category) ? 'var(--oslo-rod)' : 'var(--oslo-gul)')
    : (['SE', 'HI'].includes(status.category) ? 'var(--oslo-svart)' : 'var(--oslo-morkbeige)')
  const fgColor = isRedlist
    ? (['CR', 'EN'].includes(status.category) ? '#fff' : 'var(--oslo-svart)')
    : (['SE', 'HI'].includes(status.category) ? '#fff' : 'var(--oslo-svart)')
  const typeLabel = isRedlist
    ? t('conservation.rodlistet')
    : t('conservation.svartelistet-fremmed')

  return (
    <span
      className="species-card__conservation-badge"
      style={{ background: bgColor, color: fgColor }}
      title={`${typeLabel}: ${status.category} – ${status.label}`}
    >
      {isRedlist ? `🔴 ${status.category}` : `⚠ ${status.category}`}
    </span>
  )
}

function PlaceholderIcon({ category }) {
  // Enkel SVG-placeholder basert på kategori
  return (
    <svg width="48" height="48" viewBox="0 0 32 32" fill="none" stroke="#999" strokeWidth="1.5">
      {category === 'Fugl' ? (
        <path d="M4 20 C8 12, 16 8, 24 12 L28 8 L20 14 C22 16 22 20 20 22 L12 24 Z" />
      ) : category === 'Plante' ? (
        <>
          <line x1="16" y1="28" x2="16" y2="12" />
          <path d="M16 18 C12 14 8 12 10 8 C12 12 16 14 16 18" />
          <path d="M16 18 C20 14 24 12 22 8 C20 12 16 14 16 18" />
        </>
      ) : category === 'Insekt' ? (
        <>
          <ellipse cx="16" cy="16" rx="4" ry="6" />
          <line x1="12" y1="12" x2="8" y2="8" />
          <line x1="20" y1="12" x2="24" y2="8" />
          <line x1="10" y1="16" x2="6" y2="16" />
          <line x1="22" y1="16" x2="26" y2="16" />
        </>
      ) : (
        <circle cx="16" cy="16" r="8" />
      )}
    </svg>
  )
}
