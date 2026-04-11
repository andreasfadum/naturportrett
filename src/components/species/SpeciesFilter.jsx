import { FILTER_OPTIONS } from '../../utils/speciesCategories.js'

export default function SpeciesFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="species-filter" role="group" aria-label="Filtrer etter artsgruppe">
      {FILTER_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`species-filter__btn${activeFilter === opt.value ? ' species-filter__btn--active' : ''}`}
          onClick={() => onFilterChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
