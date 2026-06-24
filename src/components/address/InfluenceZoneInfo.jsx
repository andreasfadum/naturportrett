import { formatFullAddress } from '../../utils/norwegianText.js'
import { useT } from '../../i18n/index.jsx'

/**
 * Bekreftelse på valgt adresse på steg 1. Etter navigasjonsrefactoren
 * 24. juni 2026 viser denne IKKE radius, fordi influensområdet velges
 * på neste steg (InfluenceZoneSection).
 */
export default function InfluenceZoneInfo({ address }) {
  const t = useT()
  return (
    <div className="influence-zone" role="status">
      <img src="/icons/Kart.svg" alt="" className="influence-zone__icon" />
      <div className="influence-zone__text">
        {t('adresse.bekreftet-label')}{' '}
        <span className="influence-zone__address">{formatFullAddress(address)}</span>
      </div>
    </div>
  )
}
