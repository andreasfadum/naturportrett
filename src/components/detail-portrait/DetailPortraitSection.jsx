import { useState, useMemo } from 'react'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import SpeciesCard from '../species/SpeciesCard.jsx'
import SpeciesFilter from '../species/SpeciesFilter.jsx'
import ArtsportrettView from './ArtsportrettView.jsx'
import PlanteportrettView from './PlanteportrettView.jsx'
import NaturtypeportrettView from './NaturtypeportrettView.jsx'
import PdfDownloadButton from './PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'
import { useT, useSprak } from '../../i18n/index.jsx'

const TYPE_CONFIG = {
  artsportrett: {
    tittelKey: 'detalj.artsportrett.tittel',
    pickLabelKey: 'detalj.artsportrett.velg',
    emptyMsgKey: 'detalj.artsportrett.tom',
    filter: ['Fugl', 'Pattedyr', 'Insekt', 'Sopp', 'Annet'],
  },
  planteportrett: {
    tittelKey: 'detalj.planteportrett.tittel',
    pickLabelKey: 'detalj.planteportrett.velg',
    emptyMsgKey: 'detalj.planteportrett.tom',
    filter: ['Plante'],
  },
  naturtypeportrett: {
    tittelKey: 'detalj.naturtypeportrett.tittel',
    pickLabelKey: 'detalj.naturtypeportrett.velg',
    emptyMsgKey: 'detalj.naturtypeportrett.tom',
    filter: null,
  },
}

export default function DetailPortraitSection({ portraitType, address, species, onBack, onRestart }) {
  const t = useT()
  const { sprak } = useSprak()
  const cfg = TYPE_CONFIG[portraitType]
  const [pickedSubject, setPickedSubject] = useState(null)
  const [filter, setFilter] = useState('alle')
  const { portrait, isLoading, error, generate, reset } = usePortraitGeneration()

  const tittel = t(cfg.tittelKey)

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
    generate(portraitType, { species: sp, address, lang: sprak })
  }

  function handlePickNaturtype(nt) {
    setPickedSubject(nt)
    generate('naturtypeportrett', { naturtype: nt, address, observedSpecies: species.slice(0, 15), lang: sprak })
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
            {t('detalj.knapp.velg-annet')}
          </button>
          <PdfDownloadButton />
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            {t('detalj.knapp.annen-type')}
          </button>
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            {t('detalj.knapp.ny-adresse')}
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="portrait-loading">
        <h1 className="portrait-page-title">{tittel}</h1>
        <p style={{ color: '#666', marginBottom: 'var(--space-3)' }}>
          {t('detalj.lager-for', { tittel: tittel.toLowerCase() })} <strong>{pickedSubject.norwegianName || pickedSubject.navn}</strong>
        </p>
        <ProgressBar
          isActive={isLoading}
          expectedDurationMs={20000}
          stages={[
            t('detalj.last.steg1'),
            t('detalj.last.steg2'),
            t('detalj.last.steg3'),
            t('detalj.last.steg4'),
            t('detalj.last.steg5'),
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
          <strong>{t('detalj.feil-label')}</strong> {error}
          <br />
          <button
            type="button"
            className="btn btn--secondary"
            style={{ marginTop: 'var(--space-3)' }}
            onClick={handleBackToSubjectPicker}
          >
            {t('detalj.knapp.prov-annet')}
          </button>
        </div>
      </div>
    )
  }

  // Subject picker
  return (
    <div>
      <h1 className="portrait-page-title">{tittel}</h1>
      <p style={{ color: '#555', marginBottom: 'var(--space-6)' }}>
        {t('detalj.velg-instruksjon', { velg: t(cfg.pickLabelKey) })}
      </p>

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
              <div className="naturtype-card__nin">{t('detalj.nin-prefix')} {nt.ninKode}</div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <p style={{ color: '#666' }}>{t(cfg.emptyMsgKey)}</p>
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
          {t('detalj.knapp.tilbake')}
        </button>
      </div>
    </div>
  )
}
