import { useT, useSprak } from '../../i18n/index.jsx'
import { formatBuildDate } from '../../utils/buildDate.js'

/**
 * Vises der portrettet ellers ville kommet når serveren svarer at
 * KI-budsjettet er brukt opp. `igjen` er datoen tjenesten virker igjen
 * (YYYY-MM-DD), eller null når den ikke er kjent (tom kreditt).
 */
export default function KiBudsjettMelding({ igjen }) {
  const t = useT()
  const { sprak } = useSprak()
  return (
    <div className="ki-budsjett" role="status">
      <strong className="ki-budsjett__tittel">{t('budsjett.tittel')}</strong>
      <p>
        {igjen
          ? t('budsjett.tekst-dato', { dato: formatBuildDate(igjen, sprak) })
          : t('budsjett.tekst')}
      </p>
      <p>{t('budsjett.lagret')}</p>
    </div>
  )
}
