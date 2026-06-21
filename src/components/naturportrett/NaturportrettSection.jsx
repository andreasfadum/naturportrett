import { useEffect, useMemo } from 'react'
import { useSpeciesSearch } from '../../hooks/useSpeciesSearch.js'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import InfluenceZoneInfo from '../address/InfluenceZoneInfo.jsx'
import NaturportrettView from './NaturportrettView.jsx'
import PdfDownloadButton from '../detail-portrait/PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'
import { finnNarliggende } from '../../utils/osloGronnstrukturer.js'

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
      const lat = address.representasjonspunkt?.lat
      const lon = address.representasjonspunkt?.lon
      const narliggendeGronnstrukturer = (typeof lat === 'number' && typeof lon === 'number')
        ? finnNarliggende(lat, lon, 1500)
        : []
      generate('naturportrett', {
        address,
        coordinates: { lat, lon },
        zoneRadiusM: 500,
        topSpecies: species,
        categoryCounts: speciesByCategory,
        narliggendeGronnstrukturer,
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
            <ProgressBar
              isActive={isLoading}
              expectedDurationMs={24000}
              stages={[
                'Finner planter og dyr i nærområdet…',
                'Ser etter sårbare og fremmede arter…',
                'Samler informasjon om området…',
                'Skriver naturportrettet…',
                'Gjør portrettet klart for visning…',
              ]}
            />
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
