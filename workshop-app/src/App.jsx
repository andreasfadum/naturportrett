import React, { useState } from 'react'
import Header from './components/Header.jsx'
import Skjema from './components/Skjema.jsx'
import Workshop from './components/Workshop.jsx'
import Admin from './components/Admin.jsx'

export default function App() {
  const [tab, setTab] = useState('skjema')
  return (
    <>
      <Header />
      <div className="tabs">
        <button className={tab === 'skjema' ? 'on' : ''} onClick={() => setTab('skjema')}>1 · Spørreskjema</button>
        <button className={tab === 'workshop' ? 'on' : ''} onClick={() => setTab('workshop')}>2 · Workshop</button>
        <button className={tab === 'admin' ? 'on' : ''} onClick={() => setTab('admin')}>Administrator</button>
      </div>
      {tab === 'skjema' && <Skjema />}
      {tab === 'workshop' && <Workshop />}
      {tab === 'admin' && <Admin />}
    </>
  )
}
