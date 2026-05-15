import { useState, useMemo } from 'react'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import SpeciesCard from '../species/SpeciesCard.jsx'
import SpeciesFilter from '../species/SpeciesFilter.jsx'
import ArtsportrettView from './ArtsportrettView.jsx'
import PlanteportrettView from './PlanteportrettView.jsx'
import NaturtypeportrettView from './NaturtypeportrettView.jsx'
import PdfDownloadButton from './PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'

const TYPE_LABELS = {
  artsportrett: { tittel: 'Artsportrett', filter: ['Fugl', 'Pattedyr', 'Insekt', 'Sopp', 'Annet'], pickLabel: 'Velg en art', emptyMsg: 'Ingen dyrearter i resultatene for denne adressen.' },
  planteportrett: { tittel: 'Planteportrett', filter: ['Plante'], pickLabel: 'Velg en plante', emptyMsg: 'Ingen planter i resultatene for denne adressen.' },
  naturtypeportrett: { tittel: 'Naturtypeportrett', filter: null, pickLabel: 'Velg en naturtype', emptyMsg: 'Ingen naturtyper foreslått ennå.' },
}

export default function DetailPortraitSection({ portraitType, address, species, onBack, onRestart }) {
  const cfg = TYPE_LABELS[portraitType]
  const [pickedSubject, setPickedSubject] = useState(null)
  const [filter, setFilter] = useState('alle')
  const { portrait, isLoading, error, generate, reset } = usePortraitGeneration()

  const filtered = useMemo(() => {
    if (!cfg.filter) return []
    return species.filter(sp => cfg.filter.includes(sp.category))
  }, [species, cfg.filter])

  const visible = useMemo(() => {
    if (filter === 'alle') return filtered
    if (filter === 'annet') {
      return filtered.filter(sp => !['Fugl', 'Plante', 'Pattedyr', 'Insekt', 'Sopp'].includes(sp.category))
    }
    return filtered.filter(sp => sp.category === filter)
  }, [filtered, filter])

  // Naturtyper kan vi foreslå statisk for prototypen
  const naturtypeForslag = useMemo(() => {
    if (portraitType !== 'naturtypeportrett') return []
    return [
      { navn: 'Park og bymark', ninKode: 'T35' },
      { navn: 'Skrotemark', ninKode: 'T35' },
      { navn: 'Boreal lauvskog', ninKode: 'T4-1' },
      { navn: 'Sølvbunkeeng (tørreng)', ninKode: 'T32-3' },
      { navn: 'Strandsone og kantvegetasjon', ninKode: 'T39' },
      { navn: 'Hagemark / treklynge i kulturlandskap', ninKode: 'T32' },
    ]
  }, [portraitType])

  function handlePickSpecies(sp) {
    setPickedSubject(sp)
    generate(portraitType, { species: sp, address })
  }

  function handlePickNaturtype(nt) {
    setPickedSubject(nt)
    generate('naturtypeportrett', { naturtype: nt, address, observedSpecies: species.slice(0, 15) })
  }

  function handleBackToSubjectPicker() {
    setPickedSubject(null)
    reset()
  }

  // Vis portrett hvis ferdig
  if (portrait && pickedSubject && !isLoading) {
    return (
      <div>
        <div className="portrait-screen">
          {portraitType === 'artsportrett' && <ArtsportrettView portrait={portrait} subject={pickedSubject} />}
          {portraitType === 'planteportrett' && <PlanteportrettView portrait={portrait} subject={pickedSubject} />}
          {portraitType === 'naturtypeportrett' && <NaturtypeportrettView portrait={portrait} subject={pickedSubject} />}
        </div>
        <div className="portrait-nav no-print" style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-8)',
          flexWrap: 'wrap',
        }}>
          <button type="button" className="btn btn--secondary" onClick={handleBackToSubjectPicker}>
            ← Velg annet subjekt
          </button>
          <PdfDownloadButton />
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            Velg annen portrettype
          </button>
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            Ny adresse
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="portrait-loading">
        <h1 className="portrait-page-title">{cfg.tittel}</h1>
        <p style={{ color: '#666', marginBottom: 'var(--space-3)' }}>
          Lager {cfg.tittel.toLowerCase()} for <strong>{pickedSubject.norwegianName || pickedSubject.navn}</strong>
        </p>
        <ProgressBar
          isActive={isLoading}
          expectedDurationMs={20000}
          stages={[
            'Henter informasjon…',
            'Beskriver egenskaper og levevis…',
            'Skriver portrettet…',
            'Setter sammen sluttresultatet…',
            'Gjør portrettet klart for visning…',
          ]}
        />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div>
        <div className="recommendation-error">
          <strong>Feil:</strong> {error}
          <br />
          <button
            type="button"
            className="btn btn--secondary"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={handleBackToSubjectPicker}
          >
            Prøv et annet subjekt
          </button>
        </div>
      </div>
    )
  }

  // Subject picker
  return (
    <div>
      <h1 className="portrait-page-title">{cfg.tittel}</h1>
      <p style={{ color: '#555', marginBottom: 'var(--space-6)' }}>{cfg.pickLabel} for å generere et detaljert portrett.</p>

      {portraitType === 'naturtypeportrett' ? (
        <div className="naturtype-grid">
          {naturtypeForslag.map(nt => (
            <button
              key={nt.navn}
              type="button"
              className="naturtype-card"
              onClick={() => handlePickNaturtype(nt)}
            >
              <div className="naturtype-card__title">{nt.navn}</div>
              <div className="naturtype-card__nin">NiN: {nt.ninKode}</div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <p style={{ color: '#666' }}>{cfg.emptyMsg}</p>
          ) : (
            <>
              {portraitType === 'artsportrett' && (
                <SpeciesFilter activeFilter={filter} onFilterChange={setFilter} />
              )}
              <div className="species-grid">
                {visible.map(sp => (
                  <SpeciesCard
                    key={sp.id}
                    species={sp}
                    isSelected={false}
                    onToggle={handlePickSpecies}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 'var(--space-8)' }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Tilbake
        </button>
      </div>
    </div>
  )
}
