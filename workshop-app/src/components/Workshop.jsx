import React, { useState, useEffect } from 'react'
import { RESERVE_TASKS } from '../data/tasks.js'
import { api } from '../api.js'

export default function Workshop() {
  const [tasks, setTasks] = useState(RESERVE_TASKS)
  const [generert, setGenerert] = useState(false)
  const [grp, setGrp] = useState('')
  const [sel, setSel] = useState({})
  const [ans, setAns] = useState({})
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(api('/tasks')).then(r => r.json()).then(d => {
      if (d && Array.isArray(d.tasks)) { setTasks(d.tasks); setGenerert(!!d.generert) }
    }).catch(() => {})
  }, [])

  async function submit() {
    const bes = tasks
      .filter(t => sel[t.nr] || (ans[t.nr] && ans[t.nr].trim()))
      .map(t => ({ oppgave: `Oppgave ${t.nr} — ${t.tittel}`, besvart: true, svar: (ans[t.nr] || '').trim() }))
    if (!bes.length) { alert('Velg minst én oppgave eller skriv et svar.'); return }
    setBusy(true)
    try {
      const r = await fetch(api('/answers'), {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gruppe: grp || 'Uten navn', besvarelser: bes })
      })
      if (!r.ok) throw new Error()
      setDone(true)
    } catch { alert('Klarte ikke å sende inn.') }
    finally { setBusy(false) }
  }

  if (done) return (
    <div className="wrap">
      <div className="thanks">Takk! Workshop-svaret er registrert.</div>
      <button className="btn" onClick={() => { setDone(false); setSel({}); setAns({}); setGrp('') }}>Ny gruppe</button>
    </div>
  )

  return (
    <div className="wrap">
      <div className="card"><h2>Workshop — velg oppgave(r)</h2>
        <p className="muted">Dere jobber to og to (gjerne på tvers av etater) i ca. 20 minutter. Velg selv én eller flere oppgaver. Skriv svaret digitalt, eller løs på papir og kryss av for hvilke dere besvarte. {generert ? 'Oppgavene er tilpasset svarene fra spørreskjemaet.' : 'Viser reserve-oppgaver (ikke generert ennå).'}</p>
        <div className="q"><label className="lab">Gruppe (valgfritt)</label>
          <input type="text" value={grp} placeholder="f.eks. BYM + EBY" onChange={e => setGrp(e.target.value)} /></div>
        {tasks.map(t => (
          <div className={'task' + (sel[t.nr] ? ' sel' : '')} key={t.nr}>
            <label className="chk"><input type="checkbox" checked={!!sel[t.nr]} onChange={e => setSel(s => ({ ...s, [t.nr]: e.target.checked }))} /> Oppgave {t.nr} — {t.tittel}</label>
            <p className="lev" style={{ marginTop: 6 }}>{t.instruks}<br /><b>Leveranse:</b> {t.leveranse}</p>
            <textarea value={ans[t.nr] || ''} placeholder="Svar (valgfritt — kan også løses på papir)" onChange={e => setAns(a => ({ ...a, [t.nr]: e.target.value }))} />
          </div>
        ))}
        <button className="btn" onClick={submit} disabled={busy}>{busy && <span className="spinner" />}Lever workshop-svar</button>
      </div>
    </div>
  )
}
