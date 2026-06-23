import { useState, useEffect } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import AddressSearch from './components/address/AddressSearch.jsx'
import NaturportrettSection from './components/naturportrett/NaturportrettSection.jsx'
import PortraitTypeSelector from './components/portrait-selector/PortraitTypeSelector.jsx'
import DetailPortraitSection from './components/detail-portrait/DetailPortraitSection.jsx'
import StepIndicator from './components/layout/StepIndicator.jsx'
import HeatmapPage from './pages/HeatmapPage.jsx'
import FeedbackAdminSide from './components/feedback/FeedbackAdminSide.jsx'
import UsageAdminSide from './components/admin/UsageAdminSide.jsx'

export default function App() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )

  useEffect(() => {
    const oppdater = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', oppdater)
    return () => window.removeEventListener('popstate', oppdater)
  }, [])

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

function Hovedflyt() {
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [speciesForArea, setSpeciesForArea] = useState([])
  const [portraitType, setPortraitType] = useState(null)
  const [influenceRadiusM, setInfluenceRadiusM] = useState(() => {
    try {
      const lagret = parseInt(window.localStorage.getItem(LS_RADIUS), 10)
      if (lagret >= 100 && lagret <= 2000) return lagret
    } catch { /* noop */ }
    return DEFAULT_RADIUS_M
  })

  useEffect(() => {
    try { window.localStorage.setItem(LS_RADIUS, String(influenceRadiusM)) } catch { /* noop */ }
  }, [influenceRadiusM])

  function handleAddressSelected(address) {
    setSelectedAddress(address)
    setSpeciesForArea([])
    setPortraitType(null)
    setStep(2)
  }

  function handleNaturportrettContinue(species) {
    setSpeciesForArea(species)
    setStep(3)
  }

  function handlePortraitTypeSelected(type) {
    setPortraitType(type)
    setStep(4)
  }

  function handleBack() {
    if (step === 4) setStep(3)
    else if (step === 3) setStep(2)
    else if (step === 2) {
      setStep(1)
      setSelectedAddress(null)
      setSpeciesForArea([])
      setPortraitType(null)
    }
  }

  function handleRestart() {
    setStep(1)
    setSelectedAddress(null)
    setSpeciesForArea([])
    setPortraitType(null)
  }

  return (
    <div className="app-container">
      <AppHeader />
      <main className="main-content">
        <StepIndicator currentStep={step} portraitType={portraitType} />

        {step === 1 && (
          <AddressSearch
            onAddressSelected={handleAddressSelected}
            radiusM={influenceRadiusM}
            onRadiusChange={setInfluenceRadiusM}
          />
        )}

        {step === 2 && selectedAddress && (
          <NaturportrettSection
            address={selectedAddress}
            zoneRadiusM={influenceRadiusM}
            onContinue={handleNaturportrettContinue}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <PortraitTypeSelector
            onSelect={handlePortraitTypeSelected}
            onBack={handleBack}
          />
        )}

        {step === 4 && portraitType && (
          <DetailPortraitSection
            portraitType={portraitType}
            address={selectedAddress}
            species={speciesForArea}
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )}
      </main>
      <AppFooter />
    </div>
  )
}
