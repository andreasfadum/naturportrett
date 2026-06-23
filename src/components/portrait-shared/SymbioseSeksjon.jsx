import { useT } from '../../i18n/index.jsx'

const TYPE_KEY = {
  mutualisme: 'symbioser.type.mutualisme',
  kommensalisme: 'symbioser.type.kommensalisme',
  'predator-bytte': 'symbioser.type.predator-bytte',
  parasittisme: 'symbioser.type.parasittisme',
  konkurranse: 'symbioser.type.konkurranse',
  'indikator-relasjon': 'symbioser.type.indikator-relasjon',
}

const TYPE_KLASSE = {
  mutualisme: 'symbiose-badge--mutualisme',
  kommensalisme: 'symbiose-badge--kommensalisme',
  'predator-bytte': 'symbiose-badge--predator',
  parasittisme: 'symbiose-badge--parasittisme',
  konkurranse: 'symbiose-badge--konkurranse',
  'indikator-relasjon': 'symbiose-badge--indikator',
}

/**
 * Symbioser-seksjon for arts-/plante-/naturtypeportretter. Respekterer
 * anti-hallusinerings-prinsippet: hvis `items` er tom eller mangler, viser
 * vi en eksplisitt "ingen funn"-melding i stedet for å skjule seksjonen
 * helt. Da blir det synlig at KI vurderte det, ikke at vi glemte feltet.
 */
export default function SymbioseSeksjon({ items }) {
  const t = useT()
  if (!Array.isArray(items)) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{t('symbioser.tittel')}</h2>
      <p className="portrait-doc__textblock symbioser-intro">{t('symbioser.intro')}</p>

      {items.length === 0 ? (
        <p className="symbioser-tom">{t('symbioser.tom')}</p>
      ) : (
        <div className="symbioser-liste">
          {items.map((s, i) => {
            const typeKey = (s.type || '').toLowerCase()
            const typeLabel = TYPE_KEY[typeKey] ? t(TYPE_KEY[typeKey]) : (s.type || '–')
            const badgeKlasse = TYPE_KLASSE[typeKey] || 'symbiose-badge--annet'
            return (
              <article key={i} className="symbiose-kort">
                <header className="symbiose-kort__header">
                  <span className={`symbiose-badge ${badgeKlasse}`}>{typeLabel}</span>
                  <strong className="symbiose-kort__partner">{s.partnerart}</strong>
                </header>
                {s.forklaring && <p className="symbiose-kort__forklaring">{s.forklaring}</p>}
                {s.lokalRelevans && (
                  <p className="symbiose-kort__meta">
                    <strong>{t('symbioser.lokal-relevans')}</strong> {s.lokalRelevans}
                  </p>
                )}
                {s.evidensgrunnlag && (
                  <p className="symbiose-kort__meta symbiose-kort__meta--evidens">
                    <strong>{t('symbioser.evidensgrunnlag')}</strong> {s.evidensgrunnlag}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
