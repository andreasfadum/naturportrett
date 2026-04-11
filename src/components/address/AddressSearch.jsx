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
      <h1 className="address-search__heading">
        Finn arter i nærområdet
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
