import { useT } from '../../i18n/index.jsx'

export default function ConservationStatusBadge({ status }) {
  const t = useT()
  if (!status?.kode) {
    return (
      <div className="portrait-doc__status-box">
        <div className="portrait-doc__status-label">{t('rodliste.tittel')}</div>
        <div className="portrait-doc__status-code is-lc">–</div>
      </div>
    )
  }

  const code = status.kode
  let cssClass = 'is-lc'
  if (['CR', 'EN'].includes(code)) cssClass = 'is-cr'
  else if (code === 'VU') cssClass = 'is-vu'
  else if (code === 'NT') cssClass = 'is-nt'
  else if (['SE', 'HI'].includes(code)) cssClass = 'is-se'
  else if (code === 'LC') cssClass = 'is-lc'

  return (
    <div className="portrait-doc__status-box">
      <div className="portrait-doc__status-label">{t('rodliste.tittel')}</div>
      <div className={`portrait-doc__status-code ${cssClass}`}>{code}</div>
      {status.label && <div className="portrait-doc__status-text">{status.label}</div>}
    </div>
  )
}
