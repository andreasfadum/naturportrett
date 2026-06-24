import { useState, useRef, useEffect } from 'react'
import { useAddressSearch } from '../../hooks/useAddressSearch.js'
import AddressSuggestions from './AddressSuggestions.jsx'
import InfluenceZoneInfo from './InfluenceZoneInfo.jsx'
import { formatFullAddress } from '../../utils/norwegianText.js'
import { useT } from '../../i18n/index.jsx'

const LS_HELE_NORGE = 'naturportrett.adressesok.heleNorge'

function formatRadius(meter) {
  if (meter >= 1000) {
    const km = meter / 1000
    return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meter} m`
}

// Influensradius-slideren ble flyttet ut av denne komponenten 24. juni 2026.
// Den ligger nå på steg 2 (InfluenceZoneSection) der brukeren ser kartet
// samtidig som hun justerer radius.
export default function AddressSearch({ onAddressSelected, initialAddress = null }) {
  const t = useT()
  const [heleNorge, setHeleNorge] = useState(() => {
    try { return window.localStorage.getItem(LS_HELE_NORGE) === '1' } catch { return false }
  })
  const { query, setQuery, results, isLoading, error } = useAddressSearch({ heleNorge })
  const [showSuggestions, setShowSuggestions] = useState(false)
  // Pre-fyll bekreftet adresse og søkefelt hvis brukeren kommer tilbake
  // til steg 1 via StepIndicator — slik «glemmer» vi ikke valget.
  // Brukeren kan da enten gå direkte videre eller skrive en ny adresse.
  const [confirmed, setConfirmed] = useState(initialAddress)
  const inputRef = useRef(null)

  useEffect(() => {
    if (initialAddress && !query) {
      setQuery(formatFullAddress(initialAddress))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try { window.localStorage.setItem(LS_HELE_NORGE, heleNorge ? '1' : '0') } catch { /* noop */ }
  }, [heleNorge])

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
          {t('om-tjenesten.tittel')}
        </h2>
        <p style={{ marginTop: 0 }}>{t('om-tjenesten.utviklet-av')}</p>
        <p>{t('om-tjenesten.bruk')}</p>
        <p style={{ marginBottom: 'var(--space-2)' }}>
          {t('om-tjenesten.kilder-intro')}
        </p>
        <ul style={{ marginTop: 0, paddingLeft: 'var(--space-5)' }}>
          <li>{t('om-tjenesten.kilde.gbif')}</li>
          <li>{t('om-tjenesten.kilde.inaturalist')}</li>
          <li>{t('om-tjenesten.kilde.artsdatabanken')}</li>
          <li>{t('om-tjenesten.kilde.kartverket')}</li>
          <li>{t('om-tjenesten.kilde.lover')}</li>
          <li>{t('om-tjenesten.kilde.naturstrategi')}</li>
        </ul>
        <p>{t('om-tjenesten.metode')}</p>
        <p style={{ marginBottom: 0 }}>
          <strong>{t('om-tjenesten.disclaimer')}</strong>
        </p>
      </section>

      <h1 className="address-search__heading">
        {t('adresse.overskrift')}
      </h1>
      <p className="address-search__description">
        {t('adresse.beskrivelse')}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="address-search__field">
          <div className="address-search__label-row">
            <label htmlFor="address-input" className="address-search__label">
              {t('adresse.label')}
            </label>
            <label className="hele-norge-toggle" title={t('adresse.hele-norge.hjelp')}>
              <input
                type="checkbox"
                className="hele-norge-toggle__input"
                checked={heleNorge}
                onChange={e => {
                  setHeleNorge(e.target.checked)
                  setConfirmed(null)
                  setQuery(query)
                }}
              />
              <span className="hele-norge-toggle__track" aria-hidden="true">
                <span className="hele-norge-toggle__thumb" />
              </span>
              <span className="hele-norge-toggle__text">{t('adresse.hele-norge')}</span>
            </label>
          </div>
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
              placeholder={t('adresse.placeholder')}
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
                {t('adresse.knapp-sok')}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
