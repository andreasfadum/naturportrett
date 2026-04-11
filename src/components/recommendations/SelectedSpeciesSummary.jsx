export default function SelectedSpeciesSummary({ species }) {
  if (!species || species.length === 0) return null

  return (
    <div className="selected-summary">
      <span className="selected-summary__label">Valgte arter:</span>
      <div className="selected-summary__chips">
        {species.map(sp => (
          <span key={sp.id} className="selected-summary__chip">
            {sp.norwegianName}
          </span>
        ))}
      </div>
    </div>
  )
}
