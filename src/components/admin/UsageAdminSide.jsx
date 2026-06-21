import { useEffect, useState } from 'react'
import AppHeader from '../layout/AppHeader.jsx'
import AppFooter from '../layout/AppFooter.jsx'

const PWD_NOKKEL = 'naturportrett_admin_pwd'

const KONTEKST_ETIKETT = {
  'portrait:naturportrett': 'Naturportrett',
  'portrait:artsportrett': 'Artsportrett',
  'portrait:planteportrett': 'Planteportrett',
  'portrait:naturtypeportrett': 'Naturtypeportrett',
  'vurdering': 'Faglig vurdering (eldre flyt)',
}

function hentPwd() { return sessionStorage.getItem(PWD_NOKKEL) || '' }
function settPwd(p) { sessionStorage.setItem(PWD_NOKKEL, p) }
function tomPwd() { sessionStorage.removeItem(PWD_NOKKEL) }

function fmtUsd(n) {
  if (typeof n !== 'number' || isNaN(n)) return '–'
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1) return `$${n.toFixed(3)}`
  return `$${n.toFixed(2)}`
}

function fmtTokens(n) {
  if (typeof n !== 'number') return '–'
  if (n > 1000000) return `${(n / 1000000).toFixed(2)} M`
  if (n > 1000) return `${(n / 1000).toFixed(1)} k`
  return String(n)
}

function fmtTid(iso) {
  if (!iso) return '–'
  return new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short' })
}

async function adminFetch(url) {
  return fetch(url, { headers: { 'X-Workshop-Admin': hentPwd() } })
}

export default function UsageAdminSide() {
  const [autorisert, setAutorisert] = useState(!!hentPwd())
  const [pwdInput, setPwdInput] = useState('')
  const [feil, setFeil] = useState('')
  const [data, setData] = useState(null)
  const [laster, setLaster] = useState(false)

  function lastInn() {
    if (!autorisert) return
    setLaster(true)
    adminFetch('/api/usage/admin')
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
    const r = await adminFetch('/api/usage/admin')
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

  if (!autorisert) {
    return (
      <div className="app-container">
        <AppHeader />
        <main className="main-content">
          <div className="feedback-admin">
            <h1>Forbruk — admin</h1>
            <p>Skriv inn admin-passord for å se token- og kostnadsstatistikk.</p>
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
            <h1>Forbruk — Claude API</h1>
            <div className="feedback-admin__knapper">
              <button className="btn-feedback btn-feedback--sek" onClick={lastInn} disabled={laster}>
                {laster ? 'Henter…' : 'Oppdatér'}
              </button>
              <button className="btn-feedback btn-feedback--sek" onClick={logUt}>Lås igjen</button>
            </div>
          </header>

          {data && (
            <>
              <p className="legal-disclaimer">
                USD-tallene er estimater basert på Anthropic sin offisielle prisliste (sonnet $3/$15, opus $15/$75, haiku $1/$5 per million input/output-tokens). <strong>Fasiten ligger i Anthropic Console</strong> — bruk denne siden for å se trender og fordeling, ikke som faktura-grunnlag.
              </p>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Førstegangsbruk: {fmtTid(data.forstegangBruk)} · Siste kall: {fmtTid(data.sistKall)}
              </p>

              <ForbrukKort tittel="I dag" stats={data.idag} />
              <ForbrukKort tittel="Siste 7 dager" stats={data.syvDager} />
              <ForbrukKort tittel="Totalt" stats={data.totalt} />

              {Object.keys(data.perDag).length > 0 && (
                <section style={{ marginTop: 'var(--space-6)' }}>
                  <h2>Per dag (siste 14 dager)</h2>
                  <table className="portrait-doc__table" style={{ marginTop: 'var(--space-3)' }}>
                    <thead>
                      <tr><th>Dato</th><th>Antall kall</th><th>USD</th></tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.perDag).sort((a, b) => b[0].localeCompare(a[0])).map(([dato, d]) => (
                        <tr key={dato}>
                          <td>{dato}</td>
                          <td>{d.antallKall}</td>
                          <td>{fmtUsd(d.usd)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}

function ForbrukKort({ tittel, stats }) {
  return (
    <section className="feedback-admin__stats" style={{ marginTop: 'var(--space-4)' }}>
      <h2 style={{ marginTop: 0 }}>{tittel}</h2>
      <div className="portrait-doc__fact-grid">
        <Fakta etikett="Antall API-kall" verdi={stats.antallKall} />
        <Fakta etikett="USD-kost" verdi={fmtUsd(stats.usd)} />
        <Fakta etikett="Input-tokens" verdi={fmtTokens(stats.inputTokens)} />
        <Fakta etikett="Output-tokens" verdi={fmtTokens(stats.outputTokens)} />
        <Fakta etikett="Sessions (unike IP, 30 min)" verdi={stats.antallSesjoner} />
        <Fakta etikett="Snitt USD / session" verdi={fmtUsd(stats.snittUsdPerSession)} />
        <Fakta etikett="Snitt kall / session" verdi={typeof stats.snittKallPerSession === 'number' ? stats.snittKallPerSession.toFixed(1) : '–'} />
      </div>

      {stats.perKontekst && Object.keys(stats.perKontekst).length > 0 && (
        <div className="feedback-admin__fordeling" style={{ marginTop: 'var(--space-3)' }}>
          {Object.entries(stats.perKontekst)
            .sort((a, b) => b[1].usd - a[1].usd)
            .map(([k, v]) => (
              <span key={k} className="feedback-admin__pill">
                {KONTEKST_ETIKETT[k] || k}: {v.antallKall} kall · {fmtUsd(v.usd)}
              </span>
            ))}
        </div>
      )}

      {stats.perModell && Object.keys(stats.perModell).length > 0 && (
        <div className="feedback-admin__fordeling" style={{ marginTop: 'var(--space-2)' }}>
          {Object.entries(stats.perModell)
            .sort((a, b) => b[1].usd - a[1].usd)
            .map(([k, v]) => (
              <span key={k} className="feedback-admin__pill">
                {k}: {v.antallKall} kall · {fmtUsd(v.usd)}
              </span>
            ))}
        </div>
      )}
    </section>
  )
}

function Fakta({ etikett, verdi }) {
  return (
    <div className="portrait-doc__fact-box">
      <div className="portrait-doc__fact-label">{etikett}</div>
      <div className="portrait-doc__fact-value">{verdi}</div>
    </div>
  )
}
