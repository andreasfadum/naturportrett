export default function SpeciesLoadingState({ count = 12 }) {
  return (
    <div className="species-grid" aria-busy="true" aria-label="Laster arter...">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="species-skeleton">
          <div className="species-skeleton__photo" />
          <div className="species-skeleton__body">
            <div className="species-skeleton__line species-skeleton__line--short" />
            <div className="species-skeleton__line species-skeleton__line--medium" />
            <div className="species-skeleton__line species-skeleton__line--short" />
          </div>
        </div>
      ))}
    </div>
  )
}
