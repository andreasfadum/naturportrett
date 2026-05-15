const STEPS = [
  { num: 1, label: 'Adresse' },
  { num: 2, label: 'Naturportrett' },
  { num: 3, label: 'Portrettype' },
  { num: 4, label: 'Detaljportrett' },
]

const PORTRAIT_LABELS = {
  artsportrett: 'Artsportrett',
  planteportrett: 'Planteportrett',
  naturtypeportrett: 'Naturtypeportrett',
}

export default function StepIndicator({ currentStep, portraitType }) {
  const steps = STEPS.map(s => {
    if (s.num === 4 && portraitType && PORTRAIT_LABELS[portraitType]) {
      return { ...s, label: PORTRAIT_LABELS[portraitType] }
    }
    return s
  })

  return (
    <nav className="step-indicator no-print" aria-label="Fremdrift">
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
