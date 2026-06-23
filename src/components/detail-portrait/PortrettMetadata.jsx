import { useT } from '../../i18n/index.jsx'

export default function PortrettMetadata({ referanseprosjekt }) {
  const t = useT()
  return (
    <section className="portrait-doc__section portrait-doc__metadata">
      <h2 className="portrait-doc__h2">{t('metadata.tittel')}</h2>
      <table className="portrait-doc__table">
        <tbody>
          <tr>
            <th>{t('metadata.produksjonsdato')}</th>
            <td>{__BUILD_DATE__}</td>
          </tr>
          <tr>
            <th>{t('metadata.produksjonsmate')}</th>
            <td>{t('metadata.produksjonsmate.verdi')}</td>
          </tr>
          <tr>
            <th>{t('metadata.kilder')}</th>
            <td>GBIF, iNaturalist, {t('om-tjenesten.kilde.artsdatabanken')}, {t('om-tjenesten.kilde.kartverket')}, Anthropic Claude (claude-sonnet-4-6)</td>
          </tr>
          <tr>
            <th>{t('metadata.produsent')}</th>
            <td>{t('metadata.produsent.verdi')}</td>
          </tr>
          <tr>
            <th>{t('metadata.fagansvar')}</th>
            <td>{t('metadata.fagansvar.verdi')}</td>
          </tr>
          <tr>
            <th>{t('metadata.kontakt')}</th>
            <td>{t('metadata.produsent.verdi')}</td>
          </tr>
          <tr>
            <th>{t('metadata.referanseprosjekt')}</th>
            <td>{referanseprosjekt || t('metadata.referanseprosjekt.default')}</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}
