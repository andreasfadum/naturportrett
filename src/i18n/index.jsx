import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { oversettelser, SPRAK, DEFAULT_SPRAK } from './translations.js'

const LS_KEY = 'naturportrett.sprak'

const SprakContext = createContext({ sprak: DEFAULT_SPRAK, settSprak: () => {} })

function lesLagretSprak() {
  if (typeof window === 'undefined') return DEFAULT_SPRAK
  const lagret = window.localStorage.getItem(LS_KEY)
  if (lagret && SPRAK[lagret]) return lagret
  return DEFAULT_SPRAK
}

export function SprakProvider({ children }) {
  const [sprak, setSprakState] = useState(() => lesLagretSprak())

  const settSprak = useCallback(kode => {
    if (!SPRAK[kode]) return
    setSprakState(kode)
    try {
      window.localStorage.setItem(LS_KEY, kode)
      window.document.documentElement.lang = kode
    } catch { /* localStorage kan være blokkert i private mode */ }
  }, [])

  useEffect(() => {
    try { window.document.documentElement.lang = sprak } catch { /* noop */ }
  }, [sprak])

  return (
    <SprakContext.Provider value={{ sprak, settSprak }}>
      {children}
    </SprakContext.Provider>
  )
}

/**
 * Henter en oversettelse. Bruk slik:
 *   const t = useT()
 *   <h1>{t('app.tittel')}</h1>
 *
 * Med interpolasjon:
 *   t('feedback.opphav', { sender: 'Andreas' })
 *
 * Hvis nøkkelen ikke finnes returneres nøkkelen selv (nyttig for å se
 * manglende oversettelser under utvikling).
 */
export function useT() {
  const { sprak } = useContext(SprakContext)
  return useCallback((nokkel, vars = {}) => {
    const oppslag = oversettelser[nokkel]
    if (!oppslag) return nokkel
    const tekst = oppslag[sprak] || oppslag[DEFAULT_SPRAK] || nokkel
    if (!vars || Object.keys(vars).length === 0) return tekst
    return tekst.replace(/\{(\w+)\}/g, (_, navn) => (navn in vars ? vars[navn] : `{${navn}}`))
  }, [sprak])
}

export function useSprak() {
  return useContext(SprakContext)
}
