import React, { useState, useEffect } from 'react'
import { RESERVE_TASKS } from '../data/tasks.js'
import { api } from '../api.js'

const PWD_KEY = 'workshop_admin_pwd'

function getPwd() { return sessionStorage.getItem(PWD_KEY) || '' }
function setPwd(p) { sessionStorage.setItem(PWD_KEY, p) }
function clearPwd() { sessionStorage.removeItem(PWD_KEY) }
function adminFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), 'X-Workshop-Admin': getPwd() }
  })
}

export default function Admin() {
  const [autorisert, setAutorisert] = useState(!!getPwd())
  const [pwdInput, setPwdInput] = useState('')
  const [feil, setFeil] = useState('')
  const [data, setData] = useState({ antallSvar: 0, antallEpost: 0, antallWorkshop: 0, responses: [], answers: [] })
  const [tasks, setTasks] = useState(null)
  const [genInfo, setGenInfo] = useState('')
  const [summary, setSummary] = useState('')
  const [busyG, setBusyG] = useState(false)
  const [busyS, setBusyS] = useState(false)

  const load = () => adminFetch(api('/admin'))
    .then(r => {
      if (r.status === 401) { clearPwd(); setAutorisert(false); return null }
      return r.json()
    })
    .then(d => { if (d) setData(d) })
    .catch(() => {})

  useEffect(() => { if (autorisert) load() }, [autorisert])

  async function lasOpp(e) {
    e?.preventDefault?.()
    setFeil('')
    const p = pwdInput.trim()
    if (!p) { setFeil('Skriv inn passord'); return }
    setPwd(p)
    const r = await adminFetch(api('/admin'))
    if (r.status === 401) { clearPwd(); setFeil('Feil passord'); return }
    setAutorisert(true); setPwdInput('')
  }

  function logUt() { clearPwd(); setAutorisert(false); setData({ antallSvar: 0, antallEpost: 0, antallWorkshop: 0, responses: [], answers: [] }); setTasks(null); setSummary(''); setGenInfo('') }

  async function generate() {
    setBusyG(true); setGenInfo('')
    try {
      const r = await adminFetch(api('/generate'), { method: 'POST' })
      const d = await r.json()
      setTasks(d.tasks)
      setGenInfo(d.generert ? 'Generert fra svarene.' : ('Bruker reserve' + (d.grunn ? ' (' + d.grunn + ')' : '') + '.'))
    } catch { setTasks(RESERVE_TASKS); setGenInfo('Feil — bruker reserve.') }
    finally { setBusyG(false) }
  }

  async function summarize() {
    setBusyS(true)
    try {
      const r = await adminFetch(api('/summarize'), { method: 'POST' })
      const d = await r.json()
      setSummary(d.markdown || ('Feil: ' + (d.feil || 'ukjent')))
    } catch { setSummary('Klarte ikke å lage oppsummering.') }
    finally { setBusyS(false) }
  }

  function dl(name, txt) {
    const b = new Blob([txt], { type: 'text/plain' })
    const u = URL.createObjectURL(b); const a = document.createElement('a')
    a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u)
  }

  function dlJson(name, obj) {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const b = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const u = URL.createObjectURL(b); const a = document.createElement('a')
    a.href = u; a.download = `${name}-${stamp}.json`; a.click(); URL.revokeObjectURL(u)
  }

  if (!autorisert) return (
    <div className="wrap">
      <div className="card">
        <h2>Admin-tilgang</h2>
        <p className="muted">Denne fanen er kun for arrangøren. Skriv passordet for å fortsette.</p>
        <form onSubmit={lasOpp}>
          <div className="q">
            <label className="lab">Passord</label>
            <input type="password" value={pwdInput} onChange={e => setPwdInput(e.target.value)} placeholder="Passord" autoFocus />
          </div>
          {feil && <p style={{ color: '#b3261e', margin: '0 0 10px', fontSize: 13 }}>{feil}</p>}
          <button className="btn" type="submit">Lås opp</button>
        </form>
      </div>
    </div>
  )

  const shown = tasks || RESERVE_TASKS
  return (
    <div className="wrap">
      <div className="card"><h2>Steg 1 — Skjemasvar <span className="badge">{data.antallSvar}</span></h2>
        {data.responses.length
          ? <table><thead><tr><th>#</th><th>Etat</th><th>Stilling</th><th>Svar</th><th>Override</th></tr></thead><tbody>
            {data.responses.map((d, i) => <tr key={i}><td>{i + 1}</td><td>{d.etat}</td><td>{d.stilling}</td><td>{(d.svar || []).length}</td><td>{d.erOverride ? 'Ja' : ''}</td></tr>)}
          </tbody></table>
          : <p className="muted">Ingen svar ennå.</p>}
        <p className="muted">{data.antallEpost} deltaker(e) har lagt igjen e-post for videre kontakt.</p>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={generate} disabled={busyG}>{busyG && <span className="spinner" />}Generer workshop-oppgaver</button>
          <button className="btn sec" onClick={load}>Oppdater</button>
          <button className="btn sec" onClick={() => dlJson('skjemasvar-radata', data.responses)} disabled={!data.responses.length}>Last ned skjemasvar (JSON)</button>
          <button className="btn sec" onClick={logUt}>Lås igjen</button>
        </div>
        {genInfo && <p className="muted">{genInfo}</p>}
      </div>

      <div className="card"><h2>Workshop-oppgaver (5)</h2>
        <p className="muted">Disse vises på Workshop-fanen for deltakerne.</p>
        {shown.map(t => <div className="task" key={t.nr}><h3>Oppgave {t.nr} — {t.tittel}</h3><p className="lev">{t.instruks}<br /><b>Leveranse:</b> {t.leveranse}</p></div>)}
      </div>

      <div className="card"><h2>Steg 2 — Workshop-svar <span className="badge">{data.antallWorkshop}</span></h2>
        {data.answers.length
          ? <table><thead><tr><th>Gruppe</th><th>Besvarte oppgaver</th></tr></thead><tbody>
            {data.answers.map((d, i) => <tr key={i}><td>{d.gruppe}</td><td>{(d.besvarelser || []).map(b => String(b.oppgave).split('—')[0].trim()).join(', ')}</td></tr>)}
          </tbody></table>
          : <p className="muted">Ingen workshop-svar ennå.</p>}
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn sec" onClick={() => dlJson('workshop-svar-radata', data.answers)} disabled={!data.answers.length}>Last ned workshop-svar (JSON)</button>
        </div>
      </div>

      <div className="card"><h2>Avslutt og oppsummer</h2>
        <p className="muted">Lager kort oppsummering + sortert arkiv av alle skjema- og workshop-svar (komplette svar beholdes i arkivet).</p>
        <div className="row">
          <button className="btn" onClick={summarize} disabled={busyS}>{busyS && <span className="spinner" />}Avslutt – lag oppsummering</button>
          {summary && <button className="btn sec" onClick={() => dl('oppsummering.md', summary)}>Last ned</button>}
        </div>
        {summary && <pre className="archive">{summary}</pre>}
      </div>
    </div>
  )
}
