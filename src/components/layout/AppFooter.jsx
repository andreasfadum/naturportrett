export default function AppFooter() {
  const erHeatmap = typeof window !== 'undefined' && window.location.pathname.startsWith('/heatmap')
  return (
    <footer className="app-footer">
      <div>Oslo kommune · Plan- og bygningsetaten · Naturportrett prototype {new Date().getFullYear()}</div>
      <div className="app-footer__lenker">
        {erHeatmap ? (
          <a href="/">← Tilbake til Naturportrett</a>
        ) : (
          <a href="/heatmap">Heatmap over arts-registreringer i Oslo →</a>
        )}
      </div>
    </footer>
  )
}
