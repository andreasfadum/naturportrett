import { useState, useRef } from 'react'
import { useAddressSearch } from '../../hooks/useAddressSearch.js'
import AddressSuggestions from './AddressSuggestions.jsx'
import InfluenceZoneInfo from './InfluenceZoneInfo.jsx'
import { formatFullAddress } from '../../utils/norwegianText.js'

export default function AddressSearch({ onAddressSelected }) {
  const { query, setQuery, results, isLoading, error } = useAddressSearch()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [confirmed, setConfirmed] = useState(null)
  const inputRef = useRef(null)

  function handleInputChange(e) {
    setQuery(e.target.value)
    setConfirmed(null)
    setShowSuggestions(true)
  }

  function handleSelect(hit) {
    setQuery(formatFullAddress(hit))
    setShowSuggestions(false)
    setConfirmed(hit)
  }

  function handleBlur() {
    // Liten forsinkelse så klikk på forslag rekker å gå gjennom
    setTimeout(() => setShowSuggestions(false), 150)
  }

  function handleFocus() {
    if (results.length > 0) setShowSuggestions(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (confirmed) {
      onAddressSelected(confirmed)
    }
  }

  const showDropdown = showSuggestions && query.length >= 2

  return (
    <div className="address-search">
      <section style={{
        background: 'var(--oslo-lysgron)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-5) var(--space-6)',
        marginBottom: 'var(--space-8)',
        color: 'var(--oslo-morkegron)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 1.6,
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-lg)',
          marginTop: 0,
          marginBottom: 'var(--space-3)',
          color: 'var(--oslo-morkegron)',
        }}>
          Om tjenesten / Om naturportretter
        </h2>
        <p style={{ marginTop: 0 }}>Tjenesten er utviklet av Oslo kommune.</p>
        <p>
          Tjenesten oppretter natur- og artsportretter som kan brukes i design og
          formgiving av grønne ute-/takarealer.
        </p>
        <p style={{ marginBottom: 'var(--space-2)' }}>
          Tjenesten henter og sammenstiller informasjon fra følgende kilder:
        </p>
        <ul style={{ marginTop: 0, paddingLeft: 'var(--space-5)' }}>
          <li>Kartverket (norske adresser)</li>
          <li>iNaturalist (artsobservasjoner, foto og norske navn)</li>
          <li>GBIF — Global Biodiversity Information Facility (artsdata, foto)</li>
          <li>Naturmangfoldloven (nml)</li>
          <li>Plan- og bygningsloven (pbl)</li>
          <li>Oslo kommunes Naturmangfoldstrategi 2030</li>
          <li>Anthropic Claude (KI-modell som sammenstiller informasjonen)</li>
        </ul>
        <p>
          Sammenstillingene er basert på fastsatte instrukser og bruk av kunstig
          intelligens.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Portrettene av natur og arter må kvalitetssikres av fagkyndige.</strong>
        </p>
      </section>

      <h1 className="address-search__heading">
        Finn natur og arter i nærområdet
      </h1>
      <p className="address-search__description">
        Skriv inn adressen til eiendommen du arbeider med.
        Systemet finner alle registrerte arter innenfor 500&nbsp;meters influensområde.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="address-search__field">
          <label htmlFor="address-input" className="address-search__label">
            Adresse i Oslo
          </label>
          <div className="address-search__input-wrap" style={{ position: 'relative' }}>
            <img
              src="/icons/Lokasjon.svg"
              alt=""
              className="address-search__icon"
            />
            <input
              id="address-input"
              ref={inputRef}
              type="text"
              className="address-search__input"
              placeholder="Eks. Storgata 10 eller Karl Johans gate"
              value={query}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              autoComplete="off"
              spellCheck="false"
            />
            {isLoading && <div className="address-search__spinner" />}

            {showDropdown && (
              <AddressSuggestions
                results={results}
                onSelect={handleSelect}
                error={error}
                query={query}
              />
            )}
          </div>
        </div>

        {confirmed && (
          <>
            <InfluenceZoneInfo address={confirmed} />
            <div style={{ marginTop: 'var(--space-6)' }}>
              <button type="submit" className="btn btn--primary">
                <img src="/icons/Sok stor.svg" alt="" className="btn__icon" style={{ filter: 'invert(1)' }} />
                Søk etter arter
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
