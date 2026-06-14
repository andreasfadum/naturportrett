import React, { useState, useEffect } from 'react'
import { ETATER, STILLINGER, GENERAL, TAILORED } from '../data/questions.js'
import Field, { OTHER } from './Field.jsx'
import { api } from '../api.js'

const KLIENT_KEY = 'workshop_klient_id'
const INNSENDT_KEY = 'workshop_innsendt'

function ensureKlientId() {
  let id = localStorage.getItem(KLIENT_KEY)
  if (!id) {
    id = (crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2))
    localStorage.setItem(KLIENT_KEY, id)
  }
  return id
}

export default function Skjema({ goToWorkshop }) {
  const [etat, setEtat] = useState('')
  const [stilling, setStilling] = useState('')
  const [vals, setVals] = useState({})
  const [otherTexts, setOtherTexts] = useState({})
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tidligereInnsendt, setTidligereInnsendt] = useState(false)
  const [override, setOverride] = useState(false)
  const [klientId] = useState(ensureKlientId)

  useEffect(() => {
    if (localStorage.getItem(INNSENDT_KEY) === 'true') setTidligereInnsendt(true)
  }, [])

  const tail = stilling && TAILORED[stilling] ? TAILORED[stilling] : []
  const set = (id, v) => setVals(s => ({ ...s, [id]: v }))
  const setOther = (id, v) => setOtherTexts(s => ({ ...s, [id]: v }))

  function flatVerdi(q) {
    const raw = vals[q.id]
    const annet = (otherTexts[q.id] || '').trim()
    if (q.type === 'single') return raw === OTHER ? (annet || null) : raw
    if (q.type === 'multi' || q.type === 'rank') {
      const arr = Array.isArray(raw) ? raw : []
      if (!arr.includes(OTHER)) return arr
      const uten = arr.filter(x => x !== OTHER)
      return annet ? [...uten, annet] : uten
    }
    return raw
  }

  async function submit() {
    const contrib = ['Testbruker', 'Faglig referansegruppe', 'Dele eksempelsaker']
    const g7raw = vals.g7 || []
    const g7 = Array.isArray(g7raw) ? g7raw : []
    const wants = g7.some(x => contrib.includes(x))
    const epost = (vals.epost || '').trim()
    if (wants && !epost) { alert('Du har valgt å bidra videre — skriv inn e-post nederst så vi kan kontakte deg.'); return }

    const all = [...GENERAL, ...tail]
    const svar = []
    all.forEach(q => {
      if (q.id === 'epost') return
      const a = flatVerdi(q)
      if (a != null && a !== '' && !(Array.isArray(a) && a.length === 0)) svar.push({ spørsmål: q.label, svar: a })
    })

    setBusy(true)
    try {
      const r = await fetch(api('/submit'), {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          etat, stilling: STILLINGER[stilling] || stilling, epost: epost || null, svar,
          klientId, override
        })
      })
      if (r.status === 409) {
        const d = await r.json().catch(() => ({}))
        const t = d.tidligereTidspunkt ? new Date(d.tidligereTidspunkt).toLocaleString('no-NO') : 'tidligere'
        alert(`Du har allerede sendt inn (${t}). Trykk «Send likevel» øverst på siden hvis du vil sende på nytt.`)
        setTidligereInnsendt(true)
        return
      }
      if (!r.ok) throw new Error()
      localStorage.setItem(INNSENDT_KEY, 'true')
      setDone(true)
    } catch { alert('Klarte ikke å sende inn. Prøv igjen.') }
    finally { setBusy(false) }
  }

  function reset() {
    setEtat(''); setStilling(''); setVals({}); setOtherTexts({})
    setDone(false); setOverride(false)
  }

  if (done) return (
    <div className="wrap">
      <div className="thanks">Takk! Svaret ditt er registrert.</div>
      <div className="cta-card">
        <h2>Neste steg: workshopen</h2>
        <p>Når du har sendt inn skjemaet, går vi videre til workshop-oppgavene. Trykk knappen under for å åpne workshop-fanen.</p>
        <button className="btn btn--cta" onClick={goToWorkshop}>Gå videre til workshopen →</button>
        <p className="muted" style={{ marginTop: 14 }}>
          Eller <a href="#" onClick={e => { e.preventDefault(); reset() }}>registrer en ny deltaker</a> hvis du fyller ut for noen andre.
        </p>
      </div>
    </div>
  )

  if (tidligereInnsendt && !override) return (
    <div className="wrap">
      <div className="warn">
        <h2>Du har allerede sendt inn et svar</h2>
        <p>Vi registrerte tidligere et svar fra denne nettleseren. Hvis du vil rette eller supplere svaret ditt, kan du sende på nytt — det nye svaret legges ved siden av det forrige og merkes som override.</p>
        <div className="row">
          <button className="btn" onClick={() => setOverride(true)}>Send likevel</button>
          <button className="btn sec" onClick={goToWorkshop}>Gå til workshopen</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="wrap">
      {override && (
        <div className="info">
          Du sender inn på nytt. Det forrige svaret beholdes; det nye merkes som override i admin.
        </div>
      )}
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
          {GENERAL.map(q => (
            <Field key={q.id} q={q} value={vals[q.id]} onChange={v => set(q.id, v)}
              otherText={otherTexts[q.id]} onOtherText={v => setOther(q.id, v)} />
          ))}
        </div>
        <div className="card"><h2>Tilpassede spørsmål — {STILLINGER[stilling]}</h2>
          <p className="muted" style={{ margin: '-2px 0 10px' }}>Disse spørsmålene er tilpasset rollen du valgte: {etat} · {STILLINGER[stilling]}.</p>
          {tail.map(q => (
            <Field key={q.id} q={q} value={vals[q.id]} onChange={v => set(q.id, v)}
              otherText={otherTexts[q.id]} onOtherText={v => setOther(q.id, v)} />
          ))}
        </div>
        <button className="btn" onClick={submit} disabled={busy}>{busy && <span className="spinner" />}Send inn svar</button>
      </>}
    </div>
  )
}
