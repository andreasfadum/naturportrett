import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useT } from '../../i18n/index.jsx'

export default function AppHeader() {
  const t = useT()
  return (
    <header className="app-header">
      <div className="app-header__brand">
        {/* Hvit logo for mørk header — den mørkeblå .svg-en brukes på
            portrettene som har hvit bakgrunn. Følger Oslo kommunes
            designmanual: hvit/lyse logoer på mørke bakgrunner. */}
        <img
          src="/oslo-logo-hvit.svg"
          alt={t('app.kommune')}
          className="app-header__logo"
        />
        <span className="app-header__kommune">{t('app.kommune')}</span>
      </div>
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
