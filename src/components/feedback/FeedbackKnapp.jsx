import { useState, useEffect, useRef } from 'react'

const TYPE_VALG = [
  { value: 'feil_innhold', label: 'Feil i innholdet (rett feil)' },
  { value: 'manglende_info', label: 'Noe mangler' },
  { value: 'hallusinasjon', label: 'KI har funnet på noe' },
  { value: 'tekstforslag', label: 'Forslag til formulering' },
  { value: 'annet', label: 'Annet' },
]

const KLIENT_NOKKEL = 'naturportrett_klient_id'

function hentEllerLagKlientId() {
  let id = localStorage.getItem(KLIENT_NOKKEL)
  if (!id) {
    id = 'klient-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
    localStorage.setItem(KLIENT_NOKKEL, id)
  }
  return id
}

export default function FeedbackKnapp({ portretttype, kontekst, seksjoner = [] }) {
  const [apen, setApen] = useState(false)
  const [type, setType] = useState('feil_innhold')
  const [seksjon, setSeksjon] = useState('')
  const [fritekst, setFritekst] = useState('')
  const [epost, setEpost] = useState('')
  const [sender, setSender] = useState(false)
  const [feilmelding, setFeilmelding] = useState('')
  const [vellykket, setVellykket] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (apen && textareaRef.current) textareaRef.current.focus()
  }, [apen])

  useEffect(() => {
    function escapeLukker(e) {
      if (e.key === 'Escape' && apen) setApen(false)
    }
    window.addEventListener('keydown', escapeLukker)
    return () => window.removeEventListener('keydown', escapeLukker)
  }, [apen])

  function nullstill() {
    setType('feil_innhold')
    setSeksjon('')
    setFritekst('')
    setEpost('')
    setFeilmelding('')
    setVellykket(false)
  }

  async function sendInn(e) {
    e.preventDefault()
    setFeilmelding('')
    if (!fritekst.trim() || fritekst.trim().length < 3) {
      setFeilmelding('Skriv en kort beskrivelse')
      return
    }
    setSender(true)
    try {
      const respons = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          portretttype,
          kontekst,
          seksjon: seksjon || null,
          type,
          fritekst: fritekst.trim(),
          epost: epost.trim() || null,
          klientId: hentEllerLagKlientId(),
        }),
      })
      if (!respons.ok) {
        const data = await respons.json().catch(() => ({}))
        setFeilmelding(data.feil || `Server svarte ${respons.status}`)
        return
      }
      setVellykket(true)
      setTimeout(() => {
        setApen(false)
        nullstill()
      }, 2200)
    } catch (err) {
      setFeilmelding('Kunne ikke sende — prøv igjen om litt.')
    } finally {
      setSender(false)
    }
  }

  return (
    <>
      <section className="feedback-trigger">
        <h2 className="portrait-doc__h2">Si fra om feil eller mangler</h2>
        <p className="portrait-doc__textblock">
          Portrettet er KI-generert og kan ha feil, mangler eller upresise formuleringer. Ditt innspill brukes til å forbedre verktøyet.
        </p>
        <button
          type="button"
          className="btn-feedback"
          onClick={() => setApen(true)}
        >
          Rapportér feil eller foreslå forbedring
        </button>
      </section>

      {apen && (
        <div
          className="feedback-modal__overlay"
          onClick={e => { if (e.target === e.currentTarget) setApen(false) }}
        >
          <div className="feedback-modal" role="dialog" aria-label="Send inn tilbakemelding">
            <header className="feedback-modal__header">
              <h2>Tilbakemelding på {portretttypeLabel(portretttype)}</h2>
              <button
                type="button"
                className="feedback-modal__lukk"
                onClick={() => setApen(false)}
                aria-label="Lukk"
              >
                ×
              </button>
            </header>

            {vellykket ? (
              <div className="feedback-modal__suksess">
                <strong>Takk!</strong>
                <p>Tilbakemeldingen er registrert. Den brukes til å forbedre verktøyet.</p>
              </div>
            ) : (
              <form onSubmit={sendInn} className="feedback-modal__form">
                <div className="feedback-felt">
                  <label htmlFor="feedback-type">Hva slags innspill?</label>
                  <select
                    id="feedback-type"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    {TYPE_VALG.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {seksjoner.length > 0 && (
                  <div className="feedback-felt">
                    <label htmlFor="feedback-seksjon">Hvilken seksjon? (valgfri)</label>
                    <select
                      id="feedback-seksjon"
                      value={seksjon}
                      onChange={e => setSeksjon(e.target.value)}
                    >
                      <option value="">— gjelder hele portrettet —</option>
                      {seksjoner.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="feedback-felt">
                  <label htmlFor="feedback-fritekst">Beskriv hva som er feil eller mangler</label>
                  <textarea
                    id="feedback-fritekst"
                    ref={textareaRef}
                    value={fritekst}
                    onChange={e => setFritekst(e.target.value)}
                    rows="5"
                    placeholder="F.eks. «Naturtype-listen mangler edelløvskog som faktisk finnes i ravinen sør for tomten.»"
                    required
                  />
                </div>

                <div className="feedback-felt">
                  <label htmlFor="feedback-epost">E-post (valgfri — hvis du vil høre fra oss)</label>
                  <input
                    id="feedback-epost"
                    type="email"
                    value={epost}
                    onChange={e => setEpost(e.target.value)}
                    placeholder="navn@etat.oslo.kommune.no"
                  />
                </div>

                {feilmelding && (
                  <div className="feedback-modal__feil">{feilmelding}</div>
                )}

                <div className="feedback-modal__knapper">
                  <button type="button" className="btn-feedback btn-feedback--sek" onClick={() => setApen(false)}>
                    Avbryt
                  </button>
                  <button type="submit" className="btn-feedback" disabled={sender}>
                    {sender ? 'Sender…' : 'Send inn'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function portretttypeLabel(t) {
  switch (t) {
    case 'naturportrett': return 'naturportrettet'
    case 'artsportrett': return 'artsportrettet'
    case 'planteportrett': return 'planteportrettet'
    case 'naturtypeportrett': return 'naturtypeportrettet'
    default: return 'portrettet'
  }
}
