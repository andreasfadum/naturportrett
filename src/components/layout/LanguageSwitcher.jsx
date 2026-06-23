import { useSprak, useT } from '../../i18n/index.jsx'
import { SPRAK } from '../../i18n/translations.js'
import { FlagNO, FlagGB } from './Flags.jsx'

const FLAGG_KOMPONENT = {
  no: FlagNO,
  en: FlagGB,
}

export default function LanguageSwitcher() {
  const { sprak, settSprak } = useSprak()
  const t = useT()
  return (
    <div className="lang-switcher" role="group" aria-label={t('sprak.bytt')}>
      {Object.values(SPRAK).map(s => {
        const Flagg = FLAGG_KOMPONENT[s.kode]
        return (
          <button
            key={s.kode}
            type="button"
            className={`lang-switcher__btn${sprak === s.kode ? ' lang-switcher__btn--aktiv' : ''}`}
            onClick={() => settSprak(s.kode)}
            aria-pressed={sprak === s.kode}
            aria-label={s.navn}
            title={s.navn}
          >
            <span className="lang-switcher__flag" aria-hidden="true">
              {Flagg ? <Flagg size={14} /> : s.flag}
            </span>
            <span className="lang-switcher__kode">{s.kode.toUpperCase()}</span>
          </button>
        )
      })}
    </div>
  )
}
