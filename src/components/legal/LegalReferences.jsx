/**
 * Render et lovtekstutdrag der markdown-lenker `[tekst](url)` er konvertert
 * til klikkbare <a>-elementer. Beholder linjeskift som <br>. Bare lenker
 * tolkes — vi vil ikke render full markdown for å unngå at sitater muteres.
 */
function renderSitat(tekst) {
  if (!tekst) return null
  const linker = /\[([^\]]+)\]\(([^)]+)\)/g
  const linjer = tekst.split('\n')
  return linjer.map((linje, lineIdx) => {
    const noder = []
    let lastIndex = 0
    let m
    linker.lastIndex = 0
    while ((m = linker.exec(linje)) !== null) {
      if (m.index > lastIndex) {
        noder.push(linje.slice(lastIndex, m.index))
      }
      noder.push(
        <a
          key={`${lineIdx}-${m.index}`}
          href={m[2]}
          target="_blank"
          rel="noreferrer"
          className="legal-paragraph__inline-link"
        >
          {m[1]}
        </a>
      )
      lastIndex = m.index + m[0].length
    }
    if (lastIndex < linje.length) noder.push(linje.slice(lastIndex))
    return (
      <span key={lineIdx} className="legal-paragraph__line">
        {noder}
        {lineIdx < linjer.length - 1 && <br />}
      </span>
    )
  })
}

import { useEffect } from 'react'
import { useT } from '../../i18n/index.jsx'

export default function LegalReferences({ items }) {
  const t = useT()

  // Åpne alle <details> ved print så sitater er med i PDF-eksport.
  // Lukker dem igjen etter print så bruker kommer tilbake til samme tilstand.
  useEffect(() => {
    function snapshotOgAapne() {
      const detailsList = document.querySelectorAll('.legal-paragraph__details')
      const tilstand = []
      detailsList.forEach(d => {
        tilstand.push(d.open)
        d.open = true
      })
      window.__legalDetailsTilstand = tilstand
    }
    function tilbakestill() {
      const tilstand = window.__legalDetailsTilstand
      if (!tilstand) return
      const detailsList = document.querySelectorAll('.legal-paragraph__details')
      detailsList.forEach((d, i) => { d.open = !!tilstand[i] })
      delete window.__legalDetailsTilstand
    }
    window.addEventListener('beforeprint', snapshotOgAapne)
    window.addEventListener('afterprint', tilbakestill)
    return () => {
      window.removeEventListener('beforeprint', snapshotOgAapne)
      window.removeEventListener('afterprint', tilbakestill)
    }
  }, [])

  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('lov.tittel')}</h2>
      <p className="portrait-doc__textblock legal-disclaimer">
        {t('lov.disclaimer')}
      </p>
      {items.map((lov, i) => (
        <div className="legal-block" key={`${lov.kortKode}-${i}`}>
          <header className="legal-block__header">
            <h3 className="legal-block__title">{lov.lov}</h3>
            {lov.kortBegrunnelse && (
              <p className="legal-block__why">{lov.kortBegrunnelse}</p>
            )}
          </header>
          {Array.isArray(lov.paragrafer) && lov.paragrafer
            .filter(p => p && (p.nummer || p.tema || p.sitat))
            .map((p, j) => (
            <article className="legal-paragraph" key={`${lov.kortKode}-${p.nummer}-${j}`}>
              <header className="legal-paragraph__header">
                <span className="legal-paragraph__num">{p.nummer}</span>
                {p.tema && <span className="legal-paragraph__theme"> — {p.tema}</span>}
                {p.lovdataUrl && (
                  <a
                    className="legal-paragraph__link"
                    href={p.lovdataUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lovdata ↗
                  </a>
                )}
              </header>
              {p.kapittel && (
                <div className="legal-paragraph__chapter">{p.kapittel}</div>
              )}
              {p.sitat && (
                <details className="legal-paragraph__details">
                  <summary className="legal-paragraph__summary">
                    <span className="legal-paragraph__summary-vis">{t('lov.vis-sitat')}</span>
                    <span className="legal-paragraph__summary-skjul">{t('lov.skjul-sitat')}</span>
                  </summary>
                  <blockquote className="legal-paragraph__quote">{renderSitat(p.sitat)}</blockquote>
                </details>
              )}
              {p.endretAv && (
                <div className="legal-paragraph__changed">{t('lov.endret')} {p.endretAv}</div>
              )}
            </article>
          ))}
          {Array.isArray(lov.ukjentParagrafer) && lov.ukjentParagrafer.length > 0 && (
            <p className="legal-block__missing">
              {t('lov.ukjente-paragrafer', { paragrafer: lov.ukjentParagrafer.join(', §') })}
            </p>
          )}
        </div>
      ))}
    </section>
  )
}
