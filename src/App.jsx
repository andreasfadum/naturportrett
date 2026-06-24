import { useState, useEffect } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import AddressSearch from './components/address/AddressSearch.jsx'
import InfluenceZoneSection from './components/zone/InfluenceZoneSection.jsx'
import NaturportrettSection from './components/naturportrett/NaturportrettSection.jsx'
import PortraitTypeSelector from './components/portrait-selector/PortraitTypeSelector.jsx'
import DetailPortraitSection from './components/detail-portrait/DetailPortraitSection.jsx'
import StepIndicator from './components/layout/StepIndicator.jsx'
import HeatmapPage from './pages/HeatmapPage.jsx'
import FeedbackAdminSide from './components/feedback/FeedbackAdminSide.jsx'
import UsageAdminSide from './components/admin/UsageAdminSide.jsx'
import { useSpeciesSearch } from './hooks/useSpeciesSearch.js'
import { cleanupExpired } from './utils/portraitCache.js'

export default function App() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  useEffect(() => {
    const oppdater = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', oppdater)
    return () => window.removeEventListener('popstate', oppdater)
  }, [])

  // Rydd utløpte portrett-cache-entries fra localStorage ved app-start.
  useEffect(() => { cleanupExpired() }, [])

  if (pathname.startsWith('/heatmap')) {
    return <HeatmapPage />
  }

  if (pathname.startsWith('/admin/feedback')) {
    return <FeedbackAdminSide />
  }

  if (pathname.startsWith('/admin/usage')) {
    return <UsageAdminSide />
  }

  return <Hovedflyt />
}

const LS_RADIUS = 'naturportrett.influensradius'
const DEFAULT_RADIUS_M = 500
const FASE1_RADIUS_M = 200  // bakgrunns-fetch idet adresse velges

/**
 * Stegmaskin (oppdatert 24. juni 2026):
 *   1. Adressevalg (AddressSearch)
 *   2. Velg influensområde (InfluenceZoneSection — kart + slider 200–2000m)
 *   3. Velg portretttype (PortraitTypeSelector — naturportrett + 4 detalj.)
 *   4. Generér og vis portrett (NaturportrettSection eller DetailPortraitSection)
 *
 * useSpeciesSearch er løftet hit slik at species-data persisteres på tvers
 * av steg 2–4. Bakgrunnsfetching skjer i to faser:
 *   - Fase 1: idet adresse er valgt og step blir 2, henter vi 200m for å
 *     fylle heatmap-overlay raskt.
 *   - Fase 2: når brukeren bekrefter influensområde og går til step 3,
 *     henter vi for valgt radius mens brukeren leser portrettvalgene.
 *
 * Slik er species-data klart (eller nesten klart) når brukeren kommer til
 * step 4 og portrettet skal genereres.
 */
function Hovedflyt() {
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [portraitType, setPortraitType] = useState(null)
  const [influenceRadiusM, setInfluenceRadiusM] = useState(() => {
    try {
      const lagret = parseInt(window.localStorage.getItem(LS_RADIUS), 10)
      if (lagret >= 200 && lagret <= 2000) return lagret
    } catch { /* noop */ }
    return DEFAULT_RADIUS_M
  })

  useEffect(() => {
    try { window.localStorage.setItem(LS_RADIUS, String(influenceRadiusM)) } catch { /* noop */ }
  }, [influenceRadiusM])

  // Bestem aktiv species-radius basert på steg.
  // Step 1: ingen adresse → ingen fetch. Step 2: fase 1 (200m). Step 3+: full.
  const aktivSpeciesRadius = step <= 1
    ? null
    : (step === 2 ? FASE1_RADIUS_M : influenceRadiusM)

  const { species, isLoading: speciesLoading, error: speciesError } = useSpeciesSearch(
    selectedAddress,
    aktivSpeciesRadius || FASE1_RADIUS_M
  )

  function handleAddressSelected(address) {
    setSelectedAddress(address)
    setPortraitType(null)
    setStep(2)
  }

  function handleZoneConfirmed(radiusM) {
    setInfluenceRadiusM(radiusM)
    setStep(3)
  }

  function handlePortraitTypeSelected(type) {
    setPortraitType(type)
    setStep(4)
  }

  function handleBack() {
    if (step === 4) {
      setStep(3)
      setPortraitType(null)
    } else if (step === 3) {
      setStep(2)
    } else if (step === 2) {
      setStep(1)
      setSelectedAddress(null)
      setPortraitType(null)
    }
  }

  function handleRestart() {
    setStep(1)
    setSelectedAddress(null)
    setPortraitType(null)
  }

  // Klikk på et tidligere fullført steg i StepIndicator. Tillater kun
  // tilbake-hopp (frem-hopp ville krevd at vi vet om steget er gyldig).
  // Når brukeren hopper tilbake til portretttype-velgeren (steg 3),
  // nullstiller vi portraitType slik at velgeren vises igjen.
  function handleStepClick(targetStep) {
    if (targetStep >= step) return
    if (targetStep === 3) setPortraitType(null)
    if (targetStep === 2) setPortraitType(null)
    if (targetStep === 1) {
      setSelectedAddress(null)
      setPortraitType(null)
    }
    setStep(targetStep)
  }

  return (
    <div className="app-container">
      <AppHeader />
      <main className="main-content">
        <StepIndicator
          currentStep={step}
          portraitType={portraitType}
          onStepClick={handleStepClick}
        />

        {step === 1 && (
          <AddressSearch onAddressSelected={handleAddressSelected} />
        )}

        {step === 2 && selectedAddress && (
          <InfluenceZoneSection
            address={selectedAddress}
            initialRadiusM={influenceRadiusM}
            onContinue={handleZoneConfirmed}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <PortraitTypeSelector
            onSelect={handlePortraitTypeSelected}
            onBack={handleBack}
          />
        )}

        {step === 4 && portraitType === 'naturportrett' && (
          <NaturportrettSection
            address={selectedAddress}
            zoneRadiusM={influenceRadiusM}
            species={species}
            speciesLoading={speciesLoading}
            speciesError={speciesError}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )}

        {step === 4 && portraitType && portraitType !== 'naturportrett' && (
          <DetailPortraitSection
            portraitType={portraitType}
            address={selectedAddress}
            species={species}
            speciesLoading={speciesLoading}
            speciesError={speciesError}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )}
      </main>
      <AppFooter />
    </div>
  )
}
