import { useEffect, useMemo } from 'react'
import { useSpeciesSearch } from '../../hooks/useSpeciesSearch.js'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import InfluenceZoneInfo from '../address/InfluenceZoneInfo.jsx'
import NaturportrettView from './NaturportrettView.jsx'
import AreaMap from './AreaMap.jsx'
import PdfDownloadButton from '../detail-portrait/PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'
import { finnNarliggende } from '../../utils/osloGronnstrukturer.js'
import { useT, useSprak } from '../../i18n/index.jsx'

export default function NaturportrettSection({ address, zoneRadiusM = 500, onContinue, onBack }) {
  const t = useT()
  const { sprak } = useSprak()
  const { species, isLoading: speciesLoading, error: speciesError } = useSpeciesSearch(address, zoneRadiusM)
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
      // Grønnstruktur-listen får alltid minst 1500 m radius for å gi KI en bredere
      // sjekkliste — også når brukeren har satt en liten influenssone.
      const narliggendeGronnstrukturer = (typeof lat === 'number' && typeof lon === 'number')
        ? finnNarliggende(lat, lon, Math.max(1500, zoneRadiusM * 1.5))
        : []
      generate('naturportrett', {
        address,
        coordinates: { lat, lon },
        zoneRadiusM,
        topSpecies: species,
        categoryCounts: speciesByCategory,
        narliggendeGronnstrukturer,
        lang: sprak,
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
            <h1 className="portrait-page-title">{t('naturportrett.tittel')}</h1>
            <ProgressBar
              isActive={isLoading}
              expectedDurationMs={24000}
              stages={[
                t('nps.last-portrett'),
                t('nps.last-portrett'),
                t('nps.last-portrett'),
                t('nps.last-portrett'),
                t('nps.last-portrett'),
              ]}
            />
            {/* Kartet vises mens KI jobber — alle dataene det trenger
                (koordinater, radius, heatmap-overlay) er tilgjengelig
                med en gang. Gir brukeren noe konkret å se på. */}
            {address?.representasjonspunkt && (
              <div className="portrait-loading__map">
                <AreaMap
                  lat={address.representasjonspunkt.lat}
                  lon={address.representasjonspunkt.lon}
                  radiusM={zoneRadiusM}
                  label={address.adressenavn}
                />
              </div>
            )}
          </div>
        )}

        {(speciesError || portraitError) && (
          <div className="recommendation-error" style={{ marginBottom: 'var(--space-6)' }}>
            <strong>{t('nps.feil-label')}</strong> {speciesError || portraitError}
          </div>
        )}

        {portrait && !isLoading && (
          <NaturportrettView
            portrait={portrait}
            address={address}
            species={species}
            speciesByCategory={speciesByCategory}
            zoneRadiusM={zoneRadiusM}
          />
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
          {t('nps.ny-adresse')}
        </button>
        {portrait && !isLoading && (
          <>
            <PdfDownloadButton />
            <button type="button" className="btn btn--primary" onClick={() => onContinue(species)}>
              {t('nps.detalj')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
