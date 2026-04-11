export default function AppHeader() {
  return (
    <header className="app-header">
      <img
        src="/oslo-logo.svg"
        alt="Oslo kommune"
        className="app-header__logo"
      />
      <div className="app-header__divider" />
      <div>
        <div className="app-header__title">Naturportrett</div>
        <div className="app-header__subtitle">Biologisk mangfold i influensområdet</div>
      </div>
    </header>
  )
}
