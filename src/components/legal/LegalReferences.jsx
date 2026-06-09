export default function LegalReferences({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">Relevant lovgrunnlag</h2>
      <p className="portrait-doc__textblock legal-disclaimer">
        Lover og paragrafer som har relevans for dette portrettet. Sitater er hentet ordrett fra den arkiverte lovteksten. Naturportrett gir ingen juridisk tolkning — kvalifisert vurdering må gjøres av saksbehandler.
      </p>
      {items.map((lov, i) => (
        <div className="legal-block" key={`${lov.kortKode}-${i}`}>
          <header className="legal-block__header">
            <h3 className="legal-block__title">{lov.lov}</h3>
            {lov.kortBegrunnelse && (
              <p className="legal-block__why">{lov.kortBegrunnelse}</p>
            )}
          </header>
          {Array.isArray(lov.paragrafer) && lov.paragrafer.map((p, j) => (
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
                <blockquote className="legal-paragraph__quote">{p.sitat}</blockquote>
              )}
              {p.endretAv && (
                <div className="legal-paragraph__changed">Endret: {p.endretAv}</div>
              )}
            </article>
          ))}
          {Array.isArray(lov.ukjentParagrafer) && lov.ukjentParagrafer.length > 0 && (
            <p className="legal-block__missing">
              KI foreslo paragrafer som ikke finnes i lovbasen: §{lov.ukjentParagrafer.join(', §')}
            </p>
          )}
        </div>
      ))}
    </section>
  )
}
