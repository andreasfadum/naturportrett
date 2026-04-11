import { useState } from 'react'
import { useSpeciesSearch } from '../../hooks/useSpeciesSearch.js'
import SpeciesCard from './SpeciesCard.jsx'
import SpeciesFilter from './SpeciesFilter.jsx'
import SpeciesLoadingState from './SpeciesLoadingState.jsx'
import InfluenceZoneInfo from '../address/InfluenceZoneInfo.jsx'
import { formatFullAddress } from '../../utils/norwegianText.js'

export default function SpeciesSection({ address, onConfirm, onBack }) {
  const { species, isLoading, error } = useSpeciesSearch(address)
  const [selected, setSelected] = useState(new Set())
  const [filter, setFilter] = useState('alle')

  function toggleSpecies(sp) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(sp.id)) next.delete(sp.id)
      else next.add(sp.id)
      return next
    })
  }

  function handleConfirm() {
    const chosenSpecies = species.filter(sp => selected.has(sp.id))
    onConfirm(chosenSpecies)
  }

  const filtered = filter === 'alle'
    ? species
    : filter === 'annet'
    ? species.filter(sp => !['Fugl','Plante','Pattedyr','Insekt','Sopp'].includes(sp.category))
    : species.filter(sp => sp.category === filter)

  const selectedCount = selected.size

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="species-section__heading" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--oslo-morkebla)', marginBottom: 'var(--space-2)' }}>
          Arter i nærområdet
        </h1>
        <InfluenceZoneInfo address={address} />
      </div>

      {error && (
        <div className="recommendation-error" style={{ marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <>
          <p style={{ color: '#666', marginBottom: 'var(--space-4)' }}>
            Søker etter arter innenfor 500 m...
          </p>
          <SpeciesLoadingState count={12} />
        </>
      ) : (
        <>
          <div className="species-section__header">
            <div>
              <p style={{ color: '#555', fontSize: 'var(--font-size-sm)' }}>
                {species.length} arter funnet · Velg artene du vil ha vurdering for
              </p>
            </div>
          </div>

          <SpeciesFilter activeFilter={filter} onFilterChange={setFilter} />

          {filtered.length === 0 ? (
            <p style={{ color: '#666', padding: 'var(--space-8) 0' }}>
              {species.length === 0
                ? 'Ingen artsregistreringer funnet i dette området. Prøv en annen adresse.'
                : 'Ingen arter i denne kategorien.'}
            </p>
          ) : (
            <div className="species-grid">
              {filtered.map(sp => (
                <SpeciesCard
                  key={sp.id}
                  species={sp}
                  isSelected={selected.has(sp.id)}
                  onToggle={toggleSpecies}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Bunn-navigasjon */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-8)',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Ny adresse
        </button>
        {!isLoading && selectedCount > 0 && (
          <button type="button" className="btn btn--green" onClick={handleConfirm}>
            <img src="/icons/Sjekk.svg" alt="" className="btn__icon" style={{ filter: 'invert(1)' }} />
            Generer faglig vurdering ({selectedCount} art{selectedCount !== 1 ? 'er' : ''})
          </button>
        )}
        {!isLoading && selectedCount === 0 && species.length > 0 && (
          <span style={{ color: '#888', fontSize: 'var(--font-size-sm)' }}>
            Velg minst én art for å gå videre
          </span>
        )}
      </div>
    </div>
  )
}
