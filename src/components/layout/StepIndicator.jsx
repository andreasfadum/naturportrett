import { useT } from '../../i18n/index.jsx'

const STEP_KEYS = [
  { num: 1, key: 'steg.adresse' },
  { num: 2, key: 'steg.influensomraade' },
  { num: 3, key: 'steg.portrettype' },
  { num: 4, key: 'steg.portrett' },
]

// Når brukeren har valgt portrettype, viser vi den konkrete typen i steg 4.
const PORTRAIT_STEG_KEY = {
  naturportrett: 'steg.naturportrett',
  artsportrett: 'steg.artsportrett',
  planteportrett: 'steg.planteportrett',
  naturtypeportrett: 'steg.naturtypeportrett',
  planportrett: 'steg.planportrett',
}

/**
 * Stegindikator med klikkbar tilbakenavigering. Fullførte steg (`num <
 * currentStep`) er klikkbare knapper som lar brukeren hoppe tilbake.
 * Aktive og fremtidige steg rendres som inert span. Når brukeren hopper
 * tilbake til portretttype-velgeren (steg 3), nullstilles `portraitType`
 * i App.jsx — slik kan brukeren raskt prøve en annen portretttype.
 */
export default function StepIndicator({ currentStep, portraitType, onStepClick }) {
  const t = useT()
  const steps = STEP_KEYS.map(s => {
    if (s.num === 4 && portraitType && PORTRAIT_STEG_KEY[portraitType]) {
      return { ...s, label: t(PORTRAIT_STEG_KEY[portraitType]) }
    }
    return { ...s, label: t(s.key) }
  })

  return (
    <nav className="step-indicator no-print" aria-label={t('steg.fremdrift-aria')}>
      {steps.map((step, i) => {
        const isDone = step.num < currentStep
        const isActive = step.num === currentStep
        const erKlikkbar = isDone && typeof onStepClick === 'function'

        const innhold = (
          <>
            <span className="step-indicator__num">
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : step.num}
            </span>
            <span className="step-indicator__label">{step.label}</span>
          </>
        )

        const klasse = `step-indicator__item${isActive ? ' step-indicator__item--active' : ''}${isDone ? ' step-indicator__item--done' : ''}${erKlikkbar ? ' step-indicator__item--klikkbar' : ''}`

        return (
          <span key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {erKlikkbar ? (
              <button
                type="button"
                className={klasse}
                onClick={() => onStepClick(step.num)}
                aria-label={t('steg.aria.gaa-til', { steg: step.label })}
              >
                {innhold}
              </button>
            ) : (
              <span className={klasse} aria-current={isActive ? 'step' : undefined}>
                {innhold}
              </span>
            )}
            {i < steps.length - 1 && (
              <span className="step-indicator__arrow" aria-hidden="true">›</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
