import { useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile.js'
import { useT } from '../../i18n/index.jsx'

const TERSKEL_TEGN = 220  // forkort tekst over ~220 tegn på mobil

/**
 * Tekstblokk som forkortes på mobil (default) og kan ekspanderes med
 * «Vis mer». På desktop vises hele teksten alltid. Lov-sitater og
 * andre lange avsnitt får dermed mindre scroll på mobil uten å koste
 * desktop-brukeren noe.
 *
 * Bruk:
 *   <ExpandableText>{teksten}</ExpandableText>
 *   <ExpandableText terskel={300}>{teksten}</ExpandableText>
 */
export default function ExpandableText({ children, terskel = TERSKEL_TEGN, className = '' }) {
  const erMobil = useIsMobile()
  const t = useT()
  const [ekspandert, setEkspandert] = useState(false)

  if (typeof children !== 'string') {
    // Hvis det ikke er en streng (f.eks. JSX-tekst), vis uendret
    return <div className={className}>{children}</div>
  }

  const lengde = children.length

  if (!erMobil || lengde <= terskel || ekspandert) {
    return (
      <div className={className}>
        {children}
        {erMobil && ekspandert && lengde > terskel && (
          <button
            type="button"
            className="expandable-text__knapp"
            onClick={() => setEkspandert(false)}
          >
            {t('expandable.vis-mindre')}
          </button>
        )}
      </div>
    )
  }

  // Forkortet visning — finn nærmeste setningsbrudd hvis mulig
  let kuttPunkt = terskel
  const nesteSetning = children.indexOf('. ', terskel - 20)
  if (nesteSetning > 0 && nesteSetning < terskel + 60) {
    kuttPunkt = nesteSetning + 1
  }
  const kortTekst = children.slice(0, kuttPunkt).trim()

  return (
    <div className={className}>
      {kortTekst}…{' '}
      <button
        type="button"
        className="expandable-text__knapp"
        onClick={() => setEkspandert(true)}
      >
        {t('expandable.vis-mer')}
      </button>
    </div>
  )
}
