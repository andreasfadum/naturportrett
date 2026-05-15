import PortrettMetadata from '../detail-portrait/PortrettMetadata.jsx'
import AreaMap from './AreaMap.jsx'

export default function NaturportrettView({ portrait, address, species }) {
  const p = portrait || {}

  return (
    <article className="portrait-doc">
      {/* Header */}
      <header className="portrait-doc__header">
        <div>
          <h1 className="portrait-doc__title">Naturportrett</h1>
        </div>
        <div className="portrait-doc__header-right">
          <div className="portrait-doc__date">{__BUILD_DATE__}</div>
          <img src="/oslo-logo.svg" alt="Oslo kommune" className="portrait-doc__logo" />
        </div>
      </header>

      {/* Prosjektområde */}
      <section className="portrait-doc__section">
        <div className="portrait-doc__fact-grid">
          <FactBox label="Prosjektnavn" value={p.prosjektnavn} />
          <FactBox label="Lokasjon" value={p.lokasjon} />
          <FactBox label="Antall verdifulle naturområder" value={p.antallVerdifulleNaturomrader} />
        </div>
      </section>

      {/* Oversiktskart */}
      <section className="portrait-doc__section">
        <h2 className="portrait-doc__h2">Oversiktskart</h2>
        <AreaMap
          lat={address.representasjonspunkt?.lat}
          lon={address.representasjonspunkt?.lon}
          radiusM={500}
          label={p.prosjektnavn || address.adressenavn}
        />
      </section>

      {/* Naturtyper */}
      {Array.isArray(p.naturtyper) && p.naturtyper.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Naturtyper i området og rødlistestatus</h2>
          <table className="portrait-doc__table">
            <thead>
              <tr>
                <th>Naturtype</th>
                <th>NiN-kode</th>
                <th>Rødliste</th>
                <th>Beskrivelse</th>
              </tr>
            </thead>
            <tbody>
              {p.naturtyper.map((nt, i) => (
                <tr key={i}>
                  <td><strong>{nt.navn}</strong></td>
                  <td>{nt.ninKode || '–'}</td>
                  <td>{nt.rodlisteStatus || '–'}</td>
                  <td>{nt.beskrivelse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Arter */}
      {Array.isArray(p.arterAvHoyOkologiskVerdi) && p.arterAvHoyOkologiskVerdi.length > 0 && (
        <section className="portrait-doc__section">
          <h2 className="portrait-doc__h2">Registrerte arter av høy økologisk verdi</h2>
          <table className="portrait-doc__table">
            <thead>
              <tr>
                <th>Norsk navn</th>
                <th>Vitenskapelig</th>
                <th>Kategori</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {p.arterAvHoyOkologiskVerdi.map((a, i) => (
                <tr key={i}>
                  <td><strong>{a.navn}</strong></td>
                  <td><em>{a.vitenskapelig}</em></td>
                  <td>{a.kategori}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Tekstseksjoner */}
      <TextSection title="Økologiske sammenhenger og barrierer" body={p.okologiskeSammenhenger} />
      <TextSection title="Trusler og fremtidig potensiale" body={p.trusler} />
      <TextSection title="Spesielt viktige områder" body={p.spesieltViktigeOmrader} />
      <TextSection title="Føringer og juridiske hensyn" body={p.foringerOgJuridiskeHensyn} />
      <TextSection title="Andre kilder for informasjon om området" body={p.andreKilder} />

      <PortrettMetadata referanseprosjekt={p.prosjektnavn || address.adressenavn} />
    </article>
  )
}

function FactBox({ label, value }) {
  if (!value) return null
  return (
    <div className="portrait-doc__factbox">
      <div className="portrait-doc__factbox-label">{label}</div>
      <div className="portrait-doc__factbox-value">{value}</div>
    </div>
  )
}

function TextSection({ title, body }) {
  if (!body) return null
  return (
    <section className="portrait-doc__section">
      <h2 className="portrait-doc__h2">{title}</h2>
      <div className="portrait-doc__textblock">{body}</div>
    </section>
  )
}
