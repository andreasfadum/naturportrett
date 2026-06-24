import { useT, useSprak } from '../../i18n/index.jsx'
import { formatBuildDate } from '../../utils/buildDate.js'

export default function AppFooter() {
  const t = useT()
  const { sprak } = useSprak()
  const erHeatmap = typeof window !== 'undefined' && window.location.pathname.startsWith('/heatmap')
  const footerKilde = t('footer.kommune').replace(
    'Naturportrett prototype 2026',
    `Naturportrett prototype ${new Date().getFullYear()}`,
  )
  // __BUILD_DATE_ISO__ injiseres av Vite som YYYY-MM-DD og formateres
  // her per språk. I print-CSS skjules .app-footer, så banneret
  // påvirker ikke PDF-eksport.
  return (
    <footer className="app-footer">
      <div>{footerKilde}</div>
      <div className="app-footer__prototype">
        {t('footer.dev-banner', { dato: formatBuildDate(__BUILD_DATE_ISO__, sprak) })}
      </div>
      {erHeatmap && (
        <div className="app-footer__lenker">
          <a href="/">{t('footer.heatmap-tilbake')}</a>
        </div>
      )}
    </footer>
  )
}
