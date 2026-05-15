export default function PortrettMetadata({ referanseprosjekt }) {
  return (
    <section className="portrait-doc__section portrait-doc__metadata">
      <h2 className="portrait-doc__h2">Portrettdata</h2>
      <table className="portrait-doc__table">
        <tbody>
          <tr>
            <th>Produksjonsdato</th>
            <td>{__BUILD_DATE__}</td>
          </tr>
          <tr>
            <th>Produksjonsmåte</th>
            <td>KI uten faglig kvalitetssikring</td>
          </tr>
          <tr>
            <th>Kilder</th>
            <td>iNaturalist, GBIF, Artsdatabanken (Rødlista 2021, Fremmedartslista 2023), Kartverket, Anthropic Claude (claude-sonnet-4-6)</td>
          </tr>
          <tr>
            <th>Produsent</th>
            <td>Plan- og bygningsetaten, Oslo kommune</td>
          </tr>
          <tr>
            <th>Fagansvar</th>
            <td>Utarbeidet maskinelt — må kvalitetssikres av fagkyndige</td>
          </tr>
          <tr>
            <th>Kontaktopplysninger</th>
            <td>Plan- og bygningsetaten, Oslo kommune</td>
          </tr>
          <tr>
            <th>Referanseprosjekt</th>
            <td>{referanseprosjekt || 'Naturportrett – prototype'}</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}
