import { FILTER_OPTIONS } from '../../utils/speciesCategories.js'
import { useT } from '../../i18n/index.jsx'

export default function SpeciesFilter({ activeFilter, onFilterChange }) {
  const t = useT()
  return (
    <div className="species-filter" role="group" aria-label={t('filter.gruppe-aria')}>
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`species-filter__btn${activeFilter === opt.value ? ' species-filter__btn--active' : ''}`}
          onClick={() => onFilterChange(opt.value)}
          type="button"
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  )
}
