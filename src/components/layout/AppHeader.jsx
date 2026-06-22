import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useT } from '../../i18n/index.jsx'

export default function AppHeader() {
  const t = useT()
  return (
    <header className="app-header">
      <img
        src="/oslo-logo.svg"
        alt="Oslo kommune"
        className="app-header__logo"
      />
      <div className="app-header__divider" />
      <div className="app-header__textwrap">
        <div className="app-header__title">{t('app.tittel')}</div>
        <div className="app-header__subtitle">{t('app.undertittel')}</div>
      </div>
      <div className="app-header__spacer" />
      <LanguageSwitcher />
    </header>
  )
}
