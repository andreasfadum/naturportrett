import { useT } from '../../i18n/index.jsx'

const STEP_KEYS = [
  { num: 1, key: 'steg.adresse' },
  { num: 2, key: 'steg.naturportrett' },
  { num: 3, key: 'steg.portrettype' },
  { num: 4, key: 'steg.detaljportrett' },
]

const PORTRAIT_STEG_KEY = {
  artsportrett: 'steg.artsportrett',
  planteportrett: 'steg.planteportrett',
  naturtypeportrett: 'steg.naturtypeportrett',
}

export default function StepIndicator({ currentStep, portraitType }) {
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
        return (
          <span key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className={`step-indicator__item${isActive ? ' step-indicator__item--active' : ''}${isDone ? ' step-indicator__item--done' : ''}`}
            >
              <span className="step-indicator__num">
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.num}
              </span>
              <span className="step-indicator__label">{step.label}</span>
            </span>
            {i < steps.length - 1 && (
              <span className="step-indicator__arrow">›</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
