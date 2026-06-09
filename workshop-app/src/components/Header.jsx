import React from 'react'

export default function Header() {
  const logo = (import.meta.env.BASE_URL || './') + 'oslo-logo-hvit.svg'
  return (
    <header>
      <div className="brandrow">
        <img className="logo" src={logo} alt="Oslo kommune" />
        <div className="brandtxt">Oslo kommune<br /><span>Plan- og bygningsetaten</span></div>
        <span className="pilot">TIDLIG PILOTFASE</span>
      </div>
      <h1>Naturportrett — spørreskjema &amp; workshop</h1>
      <p>Dette prosjektet er i en <b>tidlig pilotfase</b>. Vi viser noe som er under utvikling, og innspillene dine former veien videre. Ingen navn lagres.</p>
    </header>
  )
}
