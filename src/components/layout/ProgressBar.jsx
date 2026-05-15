import { useEffect, useRef, useState } from 'react'

/**
 * ProgressBar med animert framdrift og stage-tekster.
 * Siden Claude-API-en ikke streamer JSON, viser vi en estimert framdrift
 * basert på forventet varighet. Når operasjonen er ferdig hopper baren til 100 %.
 */
export default function ProgressBar({
  isActive,
  stages = ['Behandler…'],
  expectedDurationMs = 12000,
}) {
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const wasActive = useRef(false)

  useEffect(() => {
    if (isActive) {
      wasActive.current = true
      setProgress(0)
      setStageIdx(0)

      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const ratio = Math.min(1, elapsed / expectedDurationMs)
        // Asymptotisk kurve som flater ut mot 92 % — så det ikke "henger på 99 %"
        const eased = 92 * (1 - Math.exp(-2.5 * ratio))
        setProgress(eased)

        const newStage = Math.min(stages.length - 1, Math.floor(ratio * stages.length))
        setStageIdx(newStage)

        if (ratio >= 1) clearInterval(interval)
      }, 80)

      return () => clearInterval(interval)
    } else if (wasActive.current) {
      // Hopp til 100 % ved fullføring, deretter fade ut
      setProgress(100)
      setStageIdx(stages.length - 1)
      const t = setTimeout(() => {
        setProgress(0)
        wasActive.current = false
      }, 600)
      return () => clearTimeout(t)
    }
  }, [isActive, stages.length, expectedDurationMs])

  if (!isActive && progress === 0) return null

  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress__bar">
        <div className="progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress__stage">
        {stages[stageIdx] || stages[0]}
        <span className="progress__pct">{Math.round(progress)} %</span>
      </div>
    </div>
  )
}
