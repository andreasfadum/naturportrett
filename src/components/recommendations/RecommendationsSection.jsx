import { useEffect } from 'react'
import { useRecommendations } from '../../hooks/useRecommendations.js'
import RecommendationPanel from './RecommendationPanel.jsx'
import RecommendationLoading from './RecommendationLoading.jsx'
import SelectedSpeciesSummary from './SelectedSpeciesSummary.jsx'
import { formatFullAddress } from '../../utils/norwegianText.js'

export default function RecommendationsSection({ address, selectedSpecies, onBack }) {
  const { text, isLoading, error, isDone, generate } = useRecommendations()

  useEffect(() => {
    if (address && selectedSpecies?.length > 0) {
      generate(address, selectedSpecies)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="recommendations-section">
      <h1 className="recommendations-section__heading">
        Faglig vurdering
      </h1>

      <SelectedSpeciesSummary species={selectedSpecies} />

      {isLoading && !text && <RecommendationLoading />}

      {error && (
        <div className="recommendation-error">
          <strong>Feil:</strong> {error}
          <br />
          <button
            type="button"
            className="btn btn--secondary"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => generate(address, selectedSpecies)}
          >
            Prøv igjen
          </button>
        </div>
      )}

      {text && (
        <RecommendationPanel text={text} isStreaming={isLoading} />
      )}

      {/* Kildeinfo */}
      {(isDone || text) && !isLoading && (
        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--oslo-lysgron)',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--oslo-morkegron)',
        }}>
          <strong>Kunnskapskilder:</strong> iNaturalist · GBIF · Naturmangfoldloven (nml) · Plan- og bygningsloven (pbl)
        </div>
      )}

      {/* Navigasjon */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-8)',
        flexWrap: 'wrap',
      }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Endre artsutvalg
        </button>
        {!isLoading && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => generate(address, selectedSpecies)}
          >
            Regenerer vurdering
          </button>
        )}
        {(isDone || text) && !isLoading && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.print()}
          >
            Skriv ut / Lagre som PDF
          </button>
        )}
      </div>
    </div>
  )
}
