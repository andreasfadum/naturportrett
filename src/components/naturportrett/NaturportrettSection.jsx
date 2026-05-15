import { useEffect, useMemo } from 'react'
import { useSpeciesSearch } from '../../hooks/useSpeciesSearch.js'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import InfluenceZoneInfo from '../address/InfluenceZoneInfo.jsx'
import NaturportrettView from './NaturportrettView.jsx'
import PdfDownloadButton from '../detail-portrait/PdfDownloadButton.jsx'

export default function NaturportrettSection({ address, onContinue, onBack }) {
  const { species, isLoading: speciesLoading, error: speciesError } = useSpeciesSearch(address)
  const { portrait, isLoading: portraitLoading, error: portraitError, generate } = usePortraitGeneration()

  const speciesByCategory = useMemo(() => {
    const counts = {}
    for (const sp of species) {
      counts[sp.category] = (counts[sp.category] || 0) + 1
    }
    return counts
  }, [species])

  useEffect(() => {
    if (!speciesLoading && species.length > 0 && !portrait && !portraitLoading) {
      generate('naturportrett', {
        address,
        coordinates: {
          lat: address.representasjonspunkt?.lat,
          lon: address.representasjonspunkt?.lon,
        },
        zoneRadiusM: 500,
        topSpecies: species,
        categoryCounts: speciesByCategory,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciesLoading, species.length])

  const isLoading = speciesLoading || portraitLoading

  return (
    <div className="naturportrett-section">
      <div className="portrait-screen">
        {isLoading && (
          <div className="portrait-loading">
            <h1 className="portrait-page-title">Naturportrett</h1>
            <p style={{ color: '#666' }}>
              {speciesLoading
                ? `Henter artsdata innenfor 500 m fra adressen…`
                : `Genererer naturportrett basert på ${species.length} observerte arter…`}
            </p>
            <div className="portrait-skeleton">
              <div className="skeleton-line" />
              <div className="skeleton-line" style={{ width: '85%' }} />
              <div className="skeleton-line" style={{ width: '70%' }} />
            </div>
          </div>
        )}

        {(speciesError || portraitError) && (
          <div className="recommendation-error" style={{ marginBottom: 'var(--space-6)' }}>
            <strong>Feil:</strong> {speciesError || portraitError}
          </div>
        )}

        {portrait && !isLoading && (
          <NaturportrettView portrait={portrait} address={address} species={species} />
        )}
      </div>

      {/* Navigasjon — vises ikke i print */}
      <div className="portrait-nav no-print" style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-8)',
        flexWrap: 'wrap',
      }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Ny adresse
        </button>
        {portrait && !isLoading && (
          <>
            <PdfDownloadButton />
            <button type="button" className="btn btn--primary" onClick={() => onContinue(species)}>
              Lag mer detaljert portrett →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
