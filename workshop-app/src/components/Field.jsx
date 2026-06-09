import React from 'react'

export default function Field({ q, value, onChange }) {
  const lab = (
    <label className="lab">{q.label} {q.hint && <span className="hint">{q.hint}</span>}</label>
  )

  if (q.type === 'text' || q.type === 'email') {
    return (
      <div className="q">{lab}
        {q.type === 'email'
          ? <input type="email" value={value || ''} placeholder="navn@etat.oslo.kommune.no" onChange={e => onChange(e.target.value)} />
          : <textarea value={value || ''} placeholder="Kort svar..." onChange={e => onChange(e.target.value)} />}
      </div>
    )
  }

  if (q.type === 'likert') {
    return (
      <div className="q">{lab}
        <div className="likert">
          {[1, 2, 3, 4, 5].map(n => (
            <label key={n}><input type="radio" name={q.id} checked={String(value) === String(n)} onChange={() => onChange(String(n))} />{n}</label>
          ))}
          <span className="hint" style={{ alignSelf: 'center' }}>1 = lite · 5 = mye</span>
        </div>
      </div>
    )
  }

  if (q.type === 'single') {
    return (
      <div className="q">{lab}
        {q.options.map(o => (
          <label className="opt" key={o}><input type="radio" name={q.id} checked={value === o} onChange={() => onChange(o)} />{o}</label>
        ))}
      </div>
    )
  }

  // multi / rank
  const arr = Array.isArray(value) ? value : []
  const toggle = o => arr.includes(o) ? onChange(arr.filter(x => x !== o)) : onChange([...arr, o])
  return (
    <div className="q">{lab}
      {q.options.map(o => (
        <label className="opt" key={o}><input type="checkbox" checked={arr.includes(o)} onChange={() => toggle(o)} />{o}</label>
      ))}
    </div>
  )
}
