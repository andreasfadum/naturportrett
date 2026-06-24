import { useState } from 'react'
import AreaMap from '../naturportrett/AreaMap.jsx'
import { useT } from '../../i18n/index.jsx'

function formatRadius(meter) {
  if (meter >= 1000) {
    const km = meter / 1000
    return Number.isInteger(km) ? `${km} km` : `${km.toFixed(1)} km`
  }
  return `${meter} m`
}

/**
 * Steg 2 i navigasjonsflyten — kart med heatmap + slider for å velge
 * influensområdets størrelse. Slideren oppdaterer LOKAL state mens
 * brukeren drar, slik at vi ikke trigger species-fetcher på hver pixel.
 * Først ved bekreft-klikk propageres ny radius oppover.
 *
 * Bakgrunnsfetching av artsdata starter i App.jsx idet adressen er
 * valgt (radius=200), så denne komponenten viser kun visuell oppdatering
 * av influenssone-sirkelen. Når brukeren bekrefter, går vi til steg 3
 * der App henter for valgt radius.
 */
export default function InfluenceZoneSection({
  address,
  initialRadiusM = 500,
  onContinue,
  onBack,
}) {
  const t = useT()
  const [valgtRadius, setValgtRadius] = useState(initialRadiusM)

  if (!address?.representasjonspunkt) return null

  const { lat, lon } = address.representasjonspunkt
  const adresseStr = [
    address.adressenavn,
    address.nummer ? `${address.nummer}${address.bokstav || ''}` : '',
    address.postnummer || 'Oslo',
  ].filter(Boolean).join(' ')

  return (
    <div className="influence-zone-section">
      <h1 className="portrait-page-title">{t('influensomraade.tittel')}</h1>
      <p className="influence-zone-section__intro">
        {t('influensomraade.intro', { adresse: adresseStr })}
      </p>

      <div className="influence-zone-section__kart">
        <AreaMap
          key={`${lat}-${lon}-${valgtRadius}`}
          lat={lat}
          lon={lon}
          radiusM={valgtRadius}
          label={adresseStr}
        />
      </div>

      <div className="influence-zone-section__slider">
        <label htmlFor="zone-radius-slider" className="influence-zone-section__slider-label">
          {t('influensomraade.slider-label', { radius: formatRadius(valgtRadius) })}
        </label>
        <input
          id="zone-radius-slider"
          type="range"
          min="200"
          max="2000"
          step="100"
          value={valgtRadius}
          onChange={e => setValgtRadius(parseInt(e.target.value, 10))}
          className="influence-zone-section__slider-input"
          aria-describedby="zone-radius-hjelp"
        />
        <div id="zone-radius-hjelp" className="influence-zone-section__slider-hjelp">
          {t('influensomraade.slider-hjelp')}
        </div>
      </div>

      <div className="influence-zone-section__knapper">
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          {t('influensomraade.tilbake')}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onContinue(valgtRadius)}
        >
          {t('influensomraade.bekreft-knapp')}
        </button>
      </div>
    </div>
  )
}
