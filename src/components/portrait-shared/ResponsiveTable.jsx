import { useIsMobile } from '../../hooks/useIsMobile.js'

/**
 * Bytter mellom tabell og card-layout basert på viewport-bredde. På
 * mobil rendres hver rad som et eget kort med felt-label over verdi —
 * unngår horisontal scroll.
 *
 * Bruk:
 *   <ResponsiveTable
 *     headers={[t('tabell.naturtype'), t('tabell.beskrivelse')]}
 *     rows={naturtyper.map(nt => [
 *       { value: <strong>{nt.navn}</strong>, key: 'navn' },
 *       { value: nt.beskrivelse, key: 'beskrivelse' }
 *     ])}
 *   />
 *
 * `rows` er et array av arrays. Hver indre array har én oppføring per
 * kolonne — enten en ReactNode direkte, eller et { value }-objekt.
 */
export default function ResponsiveTable({ headers, rows, className = '' }) {
  const erMobil = useIsMobile()

  if (!Array.isArray(headers) || !Array.isArray(rows)) return null

  const finalRows = rows.map(rad =>
    Array.isArray(rad)
      ? rad.map(c => (c && typeof c === 'object' && 'value' in c) ? c.value : c)
      : []
  )

  if (erMobil) {
    return (
      <div className={`responsive-cards ${className}`.trim()}>
        {finalRows.map((rad, i) => (
          <article key={i} className="responsive-card">
            {rad.map((celle, j) => (
              <div key={j} className="responsive-card__rad">
                <div className="responsive-card__label">{headers[j]}</div>
                <div className="responsive-card__verdi">{celle ?? '–'}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    )
  }

  return (
    <table className={`portrait-doc__table ${className}`.trim()}>
      <thead>
        <tr>{headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {finalRows.map((rad, i) => (
          <tr key={i}>
            {rad.map((celle, j) => <td key={j}>{celle ?? '–'}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
