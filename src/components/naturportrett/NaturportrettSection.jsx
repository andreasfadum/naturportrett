import { useEffect, useMemo, useRef } from 'react'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import NaturportrettView from './NaturportrettView.jsx'
import AreaMap from './AreaMap.jsx'
import PdfDownloadButton from '../detail-portrait/PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'
import { finnNarliggende } from '../../utils/osloGronnstrukturer.js'
import { useT, useSprak } from '../../i18n/index.jsx'

/**
 * Steg 4 (når portraitType === 'naturportrett'). Species-data leveres som
 * prop fra App.jsx — der useSpeciesSearch er løftet for å gjenbruke
 * bakgrunnsfetching fra steg 2 og 3.
 */
export default function NaturportrettSection({
  address,
  zoneRadiusM = 500,
  species = [],
  speciesLoading = false,
  speciesError = null,
  onBack,
  onRestart,
}) {
  const t = useT()
  const { sprak } = useSprak()
  const { portrait, isLoading: portraitLoading, error: portraitError, generate } = usePortraitGeneration()
  // Hvilket språk siste fullførte generering ble gjort på. Når brukeren
  // bytter språk etter at portrettet er ferdig, regenererer vi på det
  // nye språket så all KI-tekst oppdateres (lovsitater forblir norske —
  // det er server-prompten som styrer den regelen).
  const sisteGenererSprak = useRef(null)

  const speciesByCategory = useMemo(() => {
    const counts = {}
    for (const sp of species) {
      counts[sp.category] = (counts[sp.category] || 0) + 1
    }
    return counts
  }, [species])

  function startGenerering() {
    const lat = address.representasjonspunkt?.lat
    const lon = address.representasjonspunkt?.lon
    // Grønnstruktur-listen får alltid minst 1500 m radius for å gi KI en bredere
    // sjekkliste — også når brukeren har satt en liten influenssone.
    const narliggendeGronnstrukturer = (typeof lat === 'number' && typeof lon === 'number')
      ? finnNarliggende(lat, lon, Math.max(1500, zoneRadiusM * 1.5))
      : []
    sisteGenererSprak.current = sprak
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

  // Førstegangsgenerering når species-data er klar
  useEffect(() => {
    if (!speciesLoading && species.length > 0 && !portrait && !portraitLoading && !sisteGenererSprak.current) {
      startGenerering()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciesLoading, species.length])

  // Re-generering når brukeren bytter språk etter at portrettet er ferdig
  useEffect(() => {
    if (portrait && !portraitLoading && sisteGenererSprak.current && sprak !== sisteGenererSprak.current) {
      startGenerering()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprak])

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
          {t('nps.velg-annet')}
        </button>
        {portrait && !isLoading && <PdfDownloadButton />}
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          {t('nps.ny-adresse')}
        </button>
      </div>
    </div>
  )
}
