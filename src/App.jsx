import { useState, useEffect } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import DevBanner from './components/layout/DevBanner.jsx'
import AddressSearch from './components/address/AddressSearch.jsx'
import NaturportrettSection from './components/naturportrett/NaturportrettSection.jsx'
import PortraitTypeSelector from './components/portrait-selector/PortraitTypeSelector.jsx'
import DetailPortraitSection from './components/detail-portrait/DetailPortraitSection.jsx'
import StepIndicator from './components/layout/StepIndicator.jsx'
import HeatmapPage from './pages/HeatmapPage.jsx'

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

  return <Hovedflyt />
}

function Hovedflyt() {
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [speciesForArea, setSpeciesForArea] = useState([])
  const [portraitType, setPortraitType] = useState(null)

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
      <DevBanner />
      <AppHeader />
      <main className="main-content">
        <StepIndicator currentStep={step} portraitType={portraitType} />

        {step === 1 && (
          <AddressSearch onAddressSelected={handleAddressSelected} />
        )}

        {step === 2 && selectedAddress && (
          <NaturportrettSection
            address={selectedAddress}
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
