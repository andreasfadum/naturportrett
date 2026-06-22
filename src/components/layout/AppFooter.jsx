import { useT } from '../../i18n/index.jsx'

export default function AppFooter() {
  const t = useT()
  const erHeatmap = typeof window !== 'undefined' && window.location.pathname.startsWith('/heatmap')
  const footerKilde = t('footer.kommune').replace(
    'Naturportrett prototype 2026',
    `Naturportrett prototype ${new Date().getFullYear()}`,
  )
  return (
    <footer className="app-footer">
      <div>{footerKilde}</div>
      <div className="app-footer__lenker">
        {erHeatmap ? (
          <a href="/">{t('footer.heatmap-tilbake')}</a>
        ) : (
          <a href="/heatmap">{t('footer.heatmap-lenke')}</a>
        )}
      </div>
    </footer>
  )
}
