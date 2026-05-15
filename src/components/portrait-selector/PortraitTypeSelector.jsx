export default function PortraitTypeSelector({ onSelect, onBack }) {
  const options = [
    {
      type: 'naturtypeportrett',
      tittel: 'Naturtypeportrett',
      beskrivelse: 'Detaljert portrett av en konkret naturtype i området — vegetasjon, økologiske forhold, trusler, tidsaspekter og samspill med mennesker.',
      ikon: '🌳',
    },
    {
      type: 'artsportrett',
      tittel: 'Artsportrett',
      beskrivelse: 'Detaljert portrett av en konkret dyreart (fugl, pattedyr, insekt) — beskrivelse, årssyklus, næringskilder, atferd og praktiske designtiltak.',
      ikon: '🦜',
    },
    {
      type: 'planteportrett',
      tittel: 'Planteportrett',
      beskrivelse: 'Detaljert portrett av en konkret plante — habitatkrav, blomstringstid, pollinator-verdi, samplanting og erfaringsgrunnlag i Norge.',
      ikon: '🌿',
    },
  ]

  return (
    <div className="portrait-type-selector">
      <h1 className="portrait-page-title">Velg portrettype</h1>
      <p style={{ color: '#555', marginBottom: 'var(--space-6)' }}>
        Et naturportrett kan utdypes med tre typer detaljportretter. Velg hva du ønsker å fordype deg i.
      </p>

      <div className="portrait-type-grid">
        {options.map(opt => (
          <button
            key={opt.type}
            type="button"
            className="portrait-type-card"
            onClick={() => onSelect(opt.type)}
          >
            <div className="portrait-type-card__icon">{opt.ikon}</div>
            <div className="portrait-type-card__title">{opt.tittel}</div>
            <div className="portrait-type-card__desc">{opt.beskrivelse}</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Tilbake til naturportrett
        </button>
      </div>
    </div>
  )
}
