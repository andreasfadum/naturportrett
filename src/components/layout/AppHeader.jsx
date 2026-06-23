import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useT } from '../../i18n/index.jsx'

export default function AppHeader() {
  const t = useT()
  return (
    <header className="app-header">
      <div className="app-header__brand">
        {/* Hvit logo for mørk header (Oslo-morkebla bakgrunn). Logoen er
            St. Hallvard-symbolet + "Oslo" som én helhet — ifølge Oslo
            visuell identitet skal det ikke stå "Oslo kommune" som
            tilleggstekst i tillegg til logoen. */}
        <img
          src="/oslo-logo-hvit.svg"
          alt={t('app.kommune')}
          className="app-header__logo"
        />
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
