import { useT } from '../../i18n/index.jsx'

export default function AppFooter() {
  const t = useT()
  const erHeatmap = typeof window !== 'undefined' && window.location.pathname.startsWith('/heatmap')
  const footerKilde = t('footer.kommune').replace(
    'Naturportrett prototype 2026',
    `Naturportrett prototype ${new Date().getFullYear()}`,
  )
  // __BUILD_DATE__ injiseres av Vite (samme verdi som tidligere stod i topp-banneret).
  // I print-CSS skjules .app-footer, så banneret påvirker ikke PDF-eksport.
  return (
    <footer className="app-footer">
      <div>{footerKilde}</div>
      <div className="app-footer__prototype">
        {t('footer.dev-banner', { dato: __BUILD_DATE__ })}
      </div>
      {erHeatmap && (
        <div className="app-footer__lenker">
          <a href="/">{t('footer.heatmap-tilbake')}</a>
        </div>
      )}
    </footer>
  )
}
