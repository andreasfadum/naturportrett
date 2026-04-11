import { useState } from 'react'
import AppHeader from './components/layout/AppHeader.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import DevBanner from './components/layout/DevBanner.jsx'
import AddressSearch from './components/address/AddressSearch.jsx'
import SpeciesSection from './components/species/SpeciesSection.jsx'
import RecommendationsSection from './components/recommendations/RecommendationsSection.jsx'
import StepIndicator from './components/layout/StepIndicator.jsx'

export default function App() {
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedSpecies, setSelectedSpecies] = useState([])

  function handleAddressSelected(address) {
    setSelectedAddress(address)
    setSelectedSpecies([])
    setStep(2)
  }

  function handleSpeciesConfirmed(species) {
    setSelectedSpecies(species)
    setStep(3)
  }

  function handleBack() {
    if (step === 3) setStep(2)
    if (step === 2) {
      setStep(1)
      setSelectedAddress(null)
      setSelectedSpecies([])
    }
  }

  return (
    <div className="app-container">
      <DevBanner />
      <AppHeader />
      <main className="main-content">
        <StepIndicator currentStep={step} />
        {step === 1 && (
          <AddressSearch onAddressSelected={handleAddressSelected} />
        )}
        {step === 2 && (
          <SpeciesSection
            address={selectedAddress}
            onConfirm={handleSpeciesConfirmed}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <RecommendationsSection
            address={selectedAddress}
            selectedSpecies={selectedSpecies}
            onBack={handleBack}
          />
        )}
      </main>
      <AppFooter />
    </div>
  )
}
