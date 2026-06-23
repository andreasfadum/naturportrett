import { useState, useEffect, useRef } from 'react'
import { useT } from '../../i18n/index.jsx'

const TYPE_NOKLER = [
  { value: 'feil_innhold', key: 'feedback.type.feil_innhold' },
  { value: 'manglende_info', key: 'feedback.type.manglende_info' },
  { value: 'hallusinasjon', key: 'feedback.type.hallusinasjon' },
  { value: 'tekstforslag', key: 'feedback.type.tekstforslag' },
  { value: 'annet', key: 'feedback.type.annet' },
]

const PORTRETT_MODAL_KEY = {
  naturportrett: 'feedback.modal.naturportrettet',
  artsportrett: 'feedback.modal.artsportrettet',
  planteportrett: 'feedback.modal.planteportrettet',
  naturtypeportrett: 'feedback.modal.naturtypeportrettet',
}

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
  const t = useT()
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
      setFeilmelding(t('feedback.kort-beskrivelse-paakrevd'))
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
        setFeilmelding(data.feil || `${t('feedback.send-feil-generisk')} (${respons.status})`)
        return
      }
      setVellykket(true)
      setTimeout(() => {
        setApen(false)
        nullstill()
      }, 2200)
    } catch (err) {
      setFeilmelding(t('feedback.send-feil-generisk'))
    } finally {
      setSender(false)
    }
  }

  const portrettModalNavn = t(PORTRETT_MODAL_KEY[portretttype] || 'feedback.modal.portrettet')

  return (
    <>
      <section className="feedback-trigger">
        <h2 className="portrait-doc__h2">{t('feedback.tittel')}</h2>
        <p className="portrait-doc__textblock">{t('feedback.intro')}</p>
        <button
          type="button"
          className="btn-feedback"
          onClick={() => setApen(true)}
        >
          {t('feedback.knapp')}
        </button>
      </section>

      {apen && (
        <div
          className="feedback-modal__overlay"
          onClick={e => { if (e.target === e.currentTarget) setApen(false) }}
        >
          <div className="feedback-modal" role="dialog" aria-label={t('feedback.aria.send-tilbakemelding')}>
            <header className="feedback-modal__header">
              <h2>{t('feedback.modal.tittel')} — {portrettModalNavn}</h2>
              <button
                type="button"
                className="feedback-modal__lukk"
                onClick={() => setApen(false)}
                aria-label={t('feedback.lukk')}
              >
                ×
              </button>
            </header>

            {vellykket ? (
              <div className="feedback-modal__suksess">
                <strong>{t('feedback.takk')}</strong>
                <p>{t('feedback.bekreftelse')}</p>
              </div>
            ) : (
              <form onSubmit={sendInn} className="feedback-modal__form">
                <div className="feedback-felt">
                  <label htmlFor="feedback-type">{t('feedback.type.label')}</label>
                  <select
                    id="feedback-type"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  >
                    {TYPE_NOKLER.map(tv => (
                      <option key={tv.value} value={tv.value}>{t(tv.key)}</option>
                    ))}
                  </select>
                </div>

                {seksjoner.length > 0 && (
                  <div className="feedback-felt">
                    <label htmlFor="feedback-seksjon">{t('feedback.seksjon.label')}</label>
                    <select
                      id="feedback-seksjon"
                      value={seksjon}
                      onChange={e => setSeksjon(e.target.value)}
                    >
                      <option value="">{t('feedback.gjelder-hele')}</option>
                      {seksjoner.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="feedback-felt">
                  <label htmlFor="feedback-fritekst">{t('feedback.fritekst.label')}</label>
                  <textarea
                    id="feedback-fritekst"
                    ref={textareaRef}
                    value={fritekst}
                    onChange={e => setFritekst(e.target.value)}
                    rows="5"
                    placeholder={t('feedback.fritekst.placeholder')}
                    required
                  />
                </div>

                <div className="feedback-felt">
                  <label htmlFor="feedback-epost">{t('feedback.epost.label')}</label>
                  <input
                    id="feedback-epost"
                    type="email"
                    value={epost}
                    onChange={e => setEpost(e.target.value)}
                    placeholder={t('feedback.epost.placeholder')}
                  />
                </div>

                {feilmelding && (
                  <div className="feedback-modal__feil">{feilmelding}</div>
                )}

                <div className="feedback-modal__knapper">
                  <button type="button" className="btn-feedback btn-feedback--sek" onClick={() => setApen(false)}>
                    {t('knapp.avbryt')}
                  </button>
                  <button type="submit" className="btn-feedback" disabled={sender}>
                    {sender ? t('feedback.sender') : t('knapp.send')}
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
