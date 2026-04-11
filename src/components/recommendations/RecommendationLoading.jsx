export default function RecommendationLoading() {
  return (
    <div className="recommendation-loading" role="status" aria-live="polite">
      <div className="recommendation-loading__dots">
        <div className="recommendation-loading__dot" />
        <div className="recommendation-loading__dot" />
        <div className="recommendation-loading__dot" />
      </div>
      <span>Genererer faglig vurdering...</span>
    </div>
  )
}
