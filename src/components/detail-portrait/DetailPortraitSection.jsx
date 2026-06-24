import { useState, useMemo, useEffect, useRef } from 'react'
import { usePortraitGeneration } from '../../hooks/usePortraitGeneration.js'
import SpeciesCard from '../species/SpeciesCard.jsx'
import SpeciesFilter from '../species/SpeciesFilter.jsx'
import ArtsportrettView from './ArtsportrettView.jsx'
import PlanteportrettView from './PlanteportrettView.jsx'
import NaturtypeportrettView from './NaturtypeportrettView.jsx'
import PlanportrettView from './PlanportrettView.jsx'
import PdfDownloadButton from './PdfDownloadButton.jsx'
import ProgressBar from '../layout/ProgressBar.jsx'
import { useT, useSprak } from '../../i18n/index.jsx'
import { finnNarliggende } from '../../utils/osloGronnstrukturer.js'

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
  // Planportrett tar IKKE et subject — det er beslutningsgrunnlag for
  // eiendommen/influensområdet som helhet. Subject-picker hoppes over
  // og generering starter direkte via bekreftelsesmodal.
  planportrett: {
    tittelKey: 'detalj.planportrett.tittel',
    pickLabelKey: 'detalj.planportrett.velg',
    emptyMsgKey: 'detalj.planportrett.tom',
    filter: null,
  },
}

// Tersklene matcher beregnPriorityScore() i speciesAggregator.js og
// DatakvalitetCelle i NaturportrettView.jsx — én sannhetskilde for "høy/mid/lav".
function kvalitetsNivaa(score) {
  if (typeof score !== 'number') return 'ukjent'
  if (score >= 0.65) return 'hoy'
  if (score >= 0.35) return 'mid'
  return 'lav'
}

function statusKategori(sp) {
  if (!sp.conservationStatus) return 'ingen'
  return sp.conservationStatus.type === 'redlist' ? 'rodliste' : 'svarteliste'
}

export default function DetailPortraitSection({
  portraitType,
  address,
  species,
  generatedSubjects = [],
  onSubjectPicked,
  onBack,
  onRestart,
}) {
  const t = useT()
  const { sprak } = useSprak()
  const cfg = TYPE_CONFIG[portraitType]
  // pickedSubject starter null — pickeren vises alltid. Brukeren ser
  // hele listen og kan velge enten et nytt subject (KI-runde) eller en
  // av de markerte (cache-hit, instant retur).
  const [pickedSubject, setPickedSubject] = useState(null)
  const [filter, setFilter] = useState('alle')
  const [statusFilter, setStatusFilter] = useState('alle')
  const [kvalitetFilter, setKvalitetFilter] = useState('alle')
  const [bekreftEmne, setBekreftEmne] = useState(null) // species/naturtype som venter på bekreftelse
  const { portrait, isLoading, error, generate, reset } = usePortraitGeneration()
  // Hvilket språk siste fullførte generering ble gjort på. Når brukeren
  // bytter språk etter at portrettet er ferdig, regenererer vi på det
  // nye språket så all KI-tekst oppdateres.
  const sisteGenererSprak = useRef(null)

  const tittel = t(cfg.tittelKey)

  // Esc lukker modal
  useEffect(() => {
    if (!bekreftEmne) return
    function onKey(e) { if (e.key === 'Escape') setBekreftEmne(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bekreftEmne])

  // Stabil ID på subject — brukt til å markere allerede genererte i
  // pickeren. Må matche subjectId() i App.jsx.
  function subjectId(sp) {
    if (!sp) return null
    if (sp._erPlanportrett) return '__planportrett__'
    return sp.id || sp.scientificName || sp.ninKode || sp.navn || null
  }

  // Sett av subject-IDer som allerede er generert i denne sesjonen
  const genererteIder = useMemo(
    () => new Set(generatedSubjects.map(subjectId).filter(Boolean)),
    [generatedSubjects],
  )

  function erAlleredeGenerert(sp) {
    const id = subjectId(sp)
    return id ? genererteIder.has(id) : false
  }

  // Regenerer portrettet på det nye språket når brukeren bytter språk
  // etter at portrettet er ferdig. Gjenbruker pickedSubject og
  // portraitType — brukeren slipper å gjenta valg av art/naturtype.
  useEffect(() => {
    if (!portrait || isLoading || !pickedSubject) return
    if (!sisteGenererSprak.current || sprak === sisteGenererSprak.current) return

    const lat = address.representasjonspunkt?.lat
    const lon = address.representasjonspunkt?.lon
    const narliggendeGronnstrukturer = (typeof lat === 'number' && typeof lon === 'number')
      ? finnNarliggende(lat, lon, 1500)
      : []
    sisteGenererSprak.current = sprak

    if (portraitType === 'planportrett') {
      generate('planportrett', {
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    } else if (portraitType === 'naturtypeportrett') {
      generate('naturtypeportrett', {
        naturtype: pickedSubject,
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    } else {
      generate(portraitType, {
        species: pickedSubject,
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprak])

  const filtered = useMemo(() => {
    if (!cfg.filter) return []
    return species.filter(sp => cfg.filter.includes(sp.category))
  }, [species, cfg.filter])

  const visible = useMemo(() => {
    let liste = filtered

    // Eksisterende kategori-filter (kun for artsportrett)
    if (filter !== 'alle') {
      if (filter === 'annet') {
        liste = liste.filter(sp => !['Fugl', 'Plante', 'Pattedyr', 'Insekt', 'Sopp'].includes(sp.category))
      } else {
        liste = liste.filter(sp => sp.category === filter)
      }
    }

    // Status-filter (kombinerer med kategori — alle må gi treff)
    if (statusFilter !== 'alle') {
      liste = liste.filter(sp => statusKategori(sp) === statusFilter)
    }

    // Datakvalitet-filter
    if (kvalitetFilter !== 'alle') {
      liste = liste.filter(sp => kvalitetsNivaa(sp.priorityScore) === kvalitetFilter)
    }

    return liste
  }, [filtered, filter, statusFilter, kvalitetFilter])

  const naturtypeForslag = useMemo(() => {
    if (portraitType !== 'naturtypeportrett') return []
    // `navn` er stabil intern verdi som sendes til KI som payload og som
    // brukes som subject-ID i cache + generatedSubjects-markering.
    // `labelKey` styrer kun visningstittel via t() — bytter med språk.
    return [
      { navn: 'Park og bymark', ninKode: 'T35', labelKey: 'naturtype.park-bymark' },
      { navn: 'Skrotemark', ninKode: 'T35', labelKey: 'naturtype.skrotemark' },
      { navn: 'Boreal lauvskog', ninKode: 'T4-1', labelKey: 'naturtype.boreal-lauvskog' },
      { navn: 'Sølvbunkeeng (tørreng)', ninKode: 'T32-3', labelKey: 'naturtype.solvbunkeeng' },
      { navn: 'Strandsone og kantvegetasjon', ninKode: 'T39', labelKey: 'naturtype.strandsone' },
      { navn: 'Hagemark / treklynge i kulturlandskap', ninKode: 'T32', labelKey: 'naturtype.hagemark' },
    ]
  }, [portraitType])

  function handlePickSpecies(sp) {
    // Hvis allerede generert i denne sesjonen: hopp over bekreftelses-
    // modal. Cache-hit gir instant retur — det er ingenting å bekrefte.
    if (erAlleredeGenerert(sp)) {
      genererForSubject({ type: 'species', payload: sp })
      return
    }
    setBekreftEmne({ type: 'species', payload: sp, navn: sp.norwegianName, vitenskapelig: sp.scientificNameDisplay || sp.scientificName })
  }

  function handlePickNaturtype(nt) {
    if (erAlleredeGenerert(nt)) {
      genererForSubject({ type: 'naturtype', payload: nt })
      return
    }
    setBekreftEmne({ type: 'naturtype', payload: nt, navn: nt.navn, vitenskapelig: nt.ninKode })
  }

  // Felles generingslogikk — brukt både ved bekreftelses-modal og ved
  // instant cache-hit for allerede genererte subjects.
  function genererForSubject(valgt) {
    const lat = address.representasjonspunkt?.lat
    const lon = address.representasjonspunkt?.lon
    const narliggendeGronnstrukturer = (typeof lat === 'number' && typeof lon === 'number')
      ? finnNarliggende(lat, lon, 1500)
      : []
    sisteGenererSprak.current = sprak
    if (valgt.type === 'species') {
      setPickedSubject(valgt.payload)
      if (onSubjectPicked) onSubjectPicked(portraitType, valgt.payload)
      generate(portraitType, {
        species: valgt.payload,
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    } else if (valgt.type === 'planportrett') {
      const planSubject = { navn: valgt.navn, _erPlanportrett: true }
      setPickedSubject(planSubject)
      if (onSubjectPicked) onSubjectPicked('planportrett', planSubject)
      generate('planportrett', {
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    } else {
      setPickedSubject(valgt.payload)
      if (onSubjectPicked) onSubjectPicked('naturtypeportrett', valgt.payload)
      generate('naturtypeportrett', {
        naturtype: valgt.payload,
        address,
        observedSpecies: species,
        narliggendeGronnstrukturer,
        lang: sprak,
      })
    }
  }

  function handlePickPlanportrett() {
    // Planportrettet gjelder eiendommen/influensområdet — ingen subject
    setBekreftEmne({
      type: 'planportrett',
      payload: null,
      navn: [address.adressenavn, address.nummer].filter(Boolean).join(' '),
      vitenskapelig: null,
    })
  }

  function bekreftOgGener() {
    if (!bekreftEmne) return
    const valgt = bekreftEmne
    setBekreftEmne(null)
    genererForSubject(valgt)
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
          {portraitType === 'planportrett' && <PlanportrettView portrait={portrait} address={address} />}
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
  const erSpeciesType = portraitType !== 'naturtypeportrett' && portraitType !== 'planportrett'

  return (
    <div>
      <h1 className="portrait-page-title">{tittel}</h1>
      <p style={{ color: '#555', marginBottom: 'var(--space-4)' }}>
        {t('detalj.velg-instruksjon', { velg: t(cfg.pickLabelKey) })}
      </p>

      {/* Forklaring av rødliste/svarteliste-forkortelser — vises før bildegalleriet */}
      {erSpeciesType && filtered.length > 0 && (
        <details className="forkort-forklaring">
          <summary className="forkort-forklaring__tittel">{t('detalj.forkort.tittel')}</summary>
          <p className="forkort-forklaring__tekst">{t('detalj.forkort.tekst')}</p>
        </details>
      )}

      {portraitType === 'planportrett' ? (
        <div className="planportrett-start">
          <p className="planportrett-start__intro">{t('detalj.planportrett.intro-lang')}</p>
          <ul className="planportrett-start__moduler">
            <li>{t('detalj.planportrett.modul.A')}</li>
            <li>{t('detalj.planportrett.modul.B')}</li>
            <li>{t('detalj.planportrett.modul.D')}</li>
            <li>{t('detalj.planportrett.modul.C')}</li>
            <li>{t('detalj.planportrett.modul.E')}</li>
          </ul>
          <button
            type="button"
            className="btn btn--primary planportrett-start__knapp"
            onClick={handlePickPlanportrett}
          >
            {t('detalj.planportrett.gener-knapp')}
          </button>
        </div>
      ) : portraitType === 'naturtypeportrett' ? (
        <div className="naturtype-grid">
          {naturtypeForslag.map(nt => {
            const erLaget = erAlleredeGenerert(nt)
            return (
              <button
                key={nt.navn}
                type="button"
                className={`naturtype-card${erLaget ? ' naturtype-card--allerede-laget' : ''}`}
                onClick={() => handlePickNaturtype(nt)}
                title={erLaget ? t('detalj.allerede-laget') : undefined}
              >
                <div className="naturtype-card__title">{t(nt.labelKey)}</div>
                <div className="naturtype-card__nin">{t('detalj.nin-prefix')} {nt.ninKode}</div>
                {erLaget && (
                  <div className="naturtype-card__badge">{t('detalj.allerede-laget')}</div>
                )}
              </button>
            )
          })}
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

              {/* Status- og datakvalitet-filter */}
              <div className="picker-filters">
                <FilterGruppe
                  label={t('detalj.filter.status.label')}
                  valg={[
                    { v: 'alle', label: t('detalj.filter.status.alle') },
                    { v: 'rodliste', label: t('detalj.filter.status.rodliste') },
                    { v: 'svarteliste', label: t('detalj.filter.status.svarteliste') },
                    { v: 'ingen', label: t('detalj.filter.status.ingen') },
                  ]}
                  aktiv={statusFilter}
                  onChange={setStatusFilter}
                />
                <FilterGruppe
                  label={t('detalj.filter.kvalitet.label')}
                  valg={[
                    { v: 'alle', label: t('detalj.filter.kvalitet.alle') },
                    { v: 'hoy', label: t('detalj.filter.kvalitet.hoy') },
                    { v: 'mid', label: t('detalj.filter.kvalitet.mid') },
                    { v: 'lav', label: t('detalj.filter.kvalitet.lav') },
                  ]}
                  aktiv={kvalitetFilter}
                  onChange={setKvalitetFilter}
                />
              </div>

              {visible.length === 0 ? (
                <p style={{ color: '#666' }}>{t('detalj.filter.ingen-treff')}</p>
              ) : (
                <div className="species-grid">
                  {visible.map(sp => (
                    <SpeciesCard
                      key={sp.id}
                      species={sp}
                      isSelected={false}
                      alleredeLaget={erAlleredeGenerert(sp)}
                      onToggle={handlePickSpecies}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 'var(--space-8)' }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          {t('detalj.knapp.tilbake')}
        </button>
      </div>

      {/* Bekreftelses-modal */}
      {bekreftEmne && (
        <div className="bekreft-overlay" onClick={e => { if (e.target === e.currentTarget) setBekreftEmne(null) }}>
          <div className="bekreft-modal" role="dialog" aria-modal="true">
            <button
              type="button"
              className="bekreft-modal__lukk"
              onClick={() => setBekreftEmne(null)}
              aria-label={t('bekreft.aria.lukk')}
            >
              ×
            </button>
            <h2 className="bekreft-modal__tittel">
              {t('bekreft.tittel', { portretttype: tittel.toLowerCase() })}
            </h2>
            <p className="bekreft-modal__navn">
              <strong>{bekreftEmne.navn}</strong>
              {bekreftEmne.vitenskapelig && <em> — {bekreftEmne.vitenskapelig}</em>}
            </p>
            <p className="bekreft-modal__intro">{t('bekreft.intro')}</p>
            <div className="bekreft-modal__knapper">
              <button type="button" className="btn btn--secondary" onClick={() => setBekreftEmne(null)}>
                {t('knapp.avbryt')}
              </button>
              <button type="button" className="btn btn--primary" onClick={bekreftOgGener} autoFocus>
                {t('bekreft.gener')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGruppe({ label, valg, aktiv, onChange }) {
  return (
    <div className="picker-filter-gruppe">
      <span className="picker-filter-gruppe__label">{label}:</span>
      <div className="picker-filter-gruppe__valg">
        {valg.map(v => (
          <button
            key={v.v}
            type="button"
            className={`picker-filter-pill${aktiv === v.v ? ' picker-filter-pill--aktiv' : ''}`}
            onClick={() => onChange(v.v)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
