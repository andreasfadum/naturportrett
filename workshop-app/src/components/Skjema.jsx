import React, { useState } from 'react'
import { ETATER, STILLINGER, GENERAL, TAILORED } from '../data/questions.js'
import Field from './Field.jsx'
import { api } from '../api.js'

export default function Skjema() {
  const [etat, setEtat] = useState('')
  const [stilling, setStilling] = useState('')
  const [vals, setVals] = useState({})
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const tail = stilling && TAILORED[stilling] ? TAILORED[stilling] : []
  const set = (id, v) => setVals(s => ({ ...s, [id]: v }))

  async function submit() {
    const contrib = ['Testbruker', 'Faglig referansegruppe', 'Dele eksempelsaker']
    const g7 = vals.g7 || []
    const wants = Array.isArray(g7) && g7.some(x => contrib.includes(x))
    const epost = (vals.epost || '').trim()
    if (wants && !epost) { alert('Du har valgt å bidra videre — skriv inn e-post nederst så vi kan kontakte deg.'); return }

    const all = [...GENERAL, ...tail]
    const svar = []
    all.forEach(q => {
      if (q.id === 'epost') return
      const a = vals[q.id]
      if (a != null && a !== '' && !(Array.isArray(a) && a.length === 0)) svar.push({ spørsmål: q.label, svar: a })
    })

    setBusy(true)
    try {
      const r = await fetch(api('/submit'), {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ etat, stilling: STILLINGER[stilling] || stilling, epost: epost || null, svar })
      })
      if (!r.ok) throw new Error()
      setDone(true)
    } catch { alert('Klarte ikke å sende inn. Prøv igjen.') }
    finally { setBusy(false) }
  }

  function reset() { setEtat(''); setStilling(''); setVals({}); setDone(false) }

  if (done) return (
    <div className="wrap">
      <div className="thanks">Takk! Svaret ditt er registrert.</div>
      <button className="btn" onClick={reset}>Registrer ny deltaker</button>
    </div>
  )

  return (
    <div className="wrap">
      <div className="card"><h2>Om deg</h2>
        <div className="q"><label className="lab">Etat</label>
          <select value={etat} onChange={e => setEtat(e.target.value)}>
            <option value="">— velg —</option>{ETATER.map(e => <option key={e}>{e}</option>)}
          </select></div>
        <div className="q"><label className="lab">Stilling / rolle</label>
          <select value={stilling} onChange={e => setStilling(e.target.value)}>
            <option value="">— velg —</option>{Object.entries(STILLINGER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
      </div>

      {etat && stilling && <>
        <div className="card"><h2>Generelle spørsmål</h2>
          {GENERAL.map(q => <Field key={q.id} q={q} value={vals[q.id]} onChange={v => set(q.id, v)} />)}
        </div>
        <div className="card"><h2>Tilpassede spørsmål — {STILLINGER[stilling]}</h2>
          <p className="muted" style={{ margin: '-2px 0 10px' }}>Disse spørsmålene er tilpasset rollen du valgte: {etat} · {STILLINGER[stilling]}.</p>
          {tail.map(q => <Field key={q.id} q={q} value={vals[q.id]} onChange={v => set(q.id, v)} />)}
        </div>
        <button className="btn" onClick={submit} disabled={busy}>{busy && <span className="spinner" />}Send inn svar</button>
      </>}
    </div>
  )
}
