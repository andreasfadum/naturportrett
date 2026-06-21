import { useState, useEffect } from 'react'
import AppHeader from '../layout/AppHeader.jsx'
import AppFooter from '../layout/AppFooter.jsx'

const PWD_NOKKEL = 'naturportrett_admin_pwd'

const TYPE_ETIKETT = {
  feil_innhold: 'Feil i innhold',
  manglende_info: 'Mangler info',
  hallusinasjon: 'Hallusinasjon',
  tekstforslag: 'Tekstforslag',
  annet: 'Annet',
}

const PORTRETT_ETIKETT = {
  naturportrett: 'Naturportrett',
  artsportrett: 'Artsportrett',
  planteportrett: 'Planteportrett',
  naturtypeportrett: 'Naturtypeportrett',
}

function hentPwd() { return sessionStorage.getItem(PWD_NOKKEL) || '' }
function settPwd(p) { sessionStorage.setItem(PWD_NOKKEL, p) }
function tomPwd() { sessionStorage.removeItem(PWD_NOKKEL) }

async function adminFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), 'X-Workshop-Admin': hentPwd() }
  })
}

export default function FeedbackAdminSide() {
  const [autorisert, setAutorisert] = useState(!!hentPwd())
  const [pwdInput, setPwdInput] = useState('')
  const [feil, setFeil] = useState('')
  const [data, setData] = useState(null)
  const [laster, setLaster] = useState(false)

  function lastInn() {
    if (!autorisert) return
    setLaster(true)
    adminFetch('/api/feedback/admin')
      .then(r => {
        if (r.status === 401) {
          tomPwd()
          setAutorisert(false)
          throw new Error('Feil passord')
        }
        return r.json()
      })
      .then(setData)
      .catch(err => setFeil(err.message))
      .finally(() => setLaster(false))
  }

  useEffect(() => { if (autorisert) lastInn() }, [autorisert])

  async function lasOpp(e) {
    e?.preventDefault?.()
    setFeil('')
    const p = pwdInput.trim()
    if (!p) { setFeil('Skriv inn passord'); return }
    settPwd(p)
    const r = await adminFetch('/api/feedback/admin')
    if (r.status === 401) {
      tomPwd()
      setFeil('Feil passord')
      return
    }
    setAutorisert(true)
    setPwdInput('')
  }

  function logUt() {
    tomPwd()
    setAutorisert(false)
    setData(null)
  }

  function lastNed() {
    if (!data || !data.innslag.length) return
    const stempel = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const blob = new Blob([JSON.stringify(data.innslag, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `naturportrett-feedback-${stempel}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!autorisert) {
    return (
      <div className="app-container">
        <AppHeader />
        <main className="main-content">
          <div className="feedback-admin">
            <h1>Tilbakemeldinger — admin</h1>
            <p>Skriv inn admin-passord for å se brukerinnspill.</p>
            <form onSubmit={lasOpp}>
              <div className="feedback-felt">
                <label htmlFor="pwd">Passord</label>
                <input
                  id="pwd"
                  type="password"
                  value={pwdInput}
                  onChange={e => setPwdInput(e.target.value)}
                  autoFocus
                />
              </div>
              {feil && <div className="feedback-modal__feil">{feil}</div>}
              <button type="submit" className="btn-feedback">Lås opp</button>
            </form>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  return (
    <div className="app-container">
      <AppHeader />
      <main className="main-content">
        <div className="feedback-admin">
          <header className="feedback-admin__header">
            <h1>Tilbakemeldinger — admin</h1>
            <div className="feedback-admin__knapper">
              <button className="btn-feedback btn-feedback--sek" onClick={lastInn} disabled={laster}>
                {laster ? 'Henter…' : 'Oppdatér'}
              </button>
              <button className="btn-feedback btn-feedback--sek" onClick={lastNed} disabled={!data || data.innslag.length === 0}>
                Last ned JSON
              </button>
              <button className="btn-feedback btn-feedback--sek" onClick={logUt}>Lås igjen</button>
            </div>
          </header>

          {data && (
            <>
              <section className="feedback-admin__stats">
                <strong>{data.antall}</strong> tilbakemeldinger totalt — {data.antallMedEpost} med e-post for oppfølging
                <div className="feedback-admin__fordeling">
                  {Object.entries(data.antallPerPortretttype).map(([k, n]) => (
                    <span key={k} className="feedback-admin__pill">
                      {PORTRETT_ETIKETT[k] || k}: {n}
                    </span>
                  ))}
                </div>
              </section>

              {data.innslag.length === 0 ? (
                <p>Ingen tilbakemeldinger ennå.</p>
              ) : (
                <ol className="feedback-admin__liste">
                  {data.innslag.map((i, idx) => (
                    <li key={idx} className="feedback-admin__kort">
                      <header className="feedback-admin__kort-header">
                        <span className="feedback-admin__type">{TYPE_ETIKETT[i.type] || i.type}</span>
                        <span className="feedback-admin__portrett">{PORTRETT_ETIKETT[i.portretttype] || i.portretttype}</span>
                        <time>{new Date(i.tidspunkt).toLocaleString('no-NO')}</time>
                      </header>
                      {i.kontekst && (
                        <p className="feedback-admin__kontekst">
                          {i.kontekst.adresse && <>📍 {i.kontekst.adresse}</>}
                          {i.kontekst.subjekt && <> · 🌿 {i.kontekst.subjekt}</>}
                          {i.seksjon && <> · Seksjon: {i.seksjon}</>}
                        </p>
                      )}
                      <p className="feedback-admin__fritekst">{i.fritekst}</p>
                      {i.epost && (
                        <p className="feedback-admin__epost">
                          ↳ <a href={`mailto:${i.epost}`}>{i.epost}</a>
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
