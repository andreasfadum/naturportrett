import { useEffect, useState } from 'react'

const MOBIL_TERSKEL_PX = 720

/**
 * Returnerer true når nettleseren er på mobil-bredde (default < 720 px).
 * Hører på resize-eventer + matchMedia for orientering. Brukes til å
 * bytte mellom tabell og card-layout, vise/skjule "vis mer"-knapper,
 * og generelt unngå horisontal scroll på mobil.
 *
 * Disse endringene skal kun gjelde mobil — desktop forblir som før.
 */
export function useIsMobile(terskelPx = MOBIL_TERSKEL_PX) {
  const [erMobil, setErMobil] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < terskelPx
  })

  useEffect(() => {
    function oppdater() {
      setErMobil(window.innerWidth < terskelPx)
    }
    window.addEventListener('resize', oppdater)
    return () => window.removeEventListener('resize', oppdater)
  }, [terskelPx])

  return erMobil
}
