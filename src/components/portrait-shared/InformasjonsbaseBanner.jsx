import { useT } from '../../i18n/index.jsx'

export default function InformasjonsbaseBanner() {
  const t = useT()
  return (
    <div className="info-base-banner" role="note" aria-label={t('banner.informasjonsbase.tittel')}>
      <strong>{t('banner.informasjonsbase.tittel')}</strong>{' '}
      {t('banner.informasjonsbase.tekst')}
    </div>
  )
}
