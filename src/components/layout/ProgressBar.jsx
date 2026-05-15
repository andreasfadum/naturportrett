import { useEffect, useRef, useState } from 'react'

/**
 * ProgressBar med jevn framdrift fra 0 til 100 og stage-tekster.
 *
 * - 0–95 % linært over forventet varighet (jevn framdrift)
 * - 95–99 % asymptotisk hvis det tar lenger enn forventet (fortsetter sakte)
 * - 100 % når operasjonen faktisk er ferdig
 */
export default function ProgressBar({
  isActive,
  stages = ['Behandler…'],
  expectedDurationMs = 18000,
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
        const ratio = elapsed / expectedDurationMs

        let p
        if (ratio < 1) {
          // Linær 0–95 % over forventet varighet
          p = 95 * ratio
        } else {
          // Etter forventet varighet: kryp asymptotisk mot 99 %
          const overrun = ratio - 1
          p = 95 + 4 * (1 - Math.exp(-1.5 * overrun))
        }
        setProgress(p)

        const stageRatio = Math.min(ratio, 1)
        const newStage = Math.min(stages.length - 1, Math.floor(stageRatio * stages.length))
        setStageIdx(newStage)
      }, 60)

      return () => clearInterval(interval)
    } else if (wasActive.current) {
      // Hopp til 100 % ved fullføring, fade ut etterpå
      setProgress(100)
      setStageIdx(stages.length - 1)
      const t = setTimeout(() => {
        setProgress(0)
        wasActive.current = false
      }, 500)
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
