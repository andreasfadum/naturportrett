const TIDSHORISONT_LABEL = {
  umiddelbart: 'Umiddelbart',
  mellom: '1–3 år',
  langsiktig: 'Langsiktig',
}

const TIDSHORISONT_KLASSE = {
  umiddelbart: 'forvaltningsrad-badge--umiddelbart',
  mellom: 'forvaltningsrad-badge--mellom',
  langsiktig: 'forvaltningsrad-badge--langsiktig',
}

const TIDSHORISONT_REKKEFOLGE = ['umiddelbart', 'mellom', 'langsiktig']

export default function ForvaltningsradListe({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  const sortert = [...items].sort((a, b) => {
    const ai = TIDSHORISONT_REKKEFOLGE.indexOf((a.tidshorisont || '').toLowerCase())
    const bi = TIDSHORISONT_REKKEFOLGE.indexOf((b.tidshorisont || '').toLowerCase())
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">Forvaltningsråd</h2>
      <p className="portrait-doc__textblock">
        Konkrete råd til arkitekt, utvikler eller saksbehandler — sortert etter når i prosjektet de bør gjennomføres.
      </p>
      <ol className="forvaltningsrad-liste">
        {sortert.map((item, i) => {
          const horisont = (item.tidshorisont || '').toLowerCase()
          return (
            <li key={i} className="forvaltningsrad-kort">
              <div className="forvaltningsrad-kort__header">
                <span className={`forvaltningsrad-badge ${TIDSHORISONT_KLASSE[horisont] || 'forvaltningsrad-badge--ukjent'}`}>
                  {TIDSHORISONT_LABEL[horisont] || 'Tidshorisont uklar'}
                </span>
              </div>
              <p className="forvaltningsrad-kort__rad">{item.rad}</p>
              {item.begrunnelse && (
                <p className="forvaltningsrad-kort__begrunnelse">{item.begrunnelse}</p>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
