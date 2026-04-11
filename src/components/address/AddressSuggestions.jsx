import { formatAddress, formatFullAddress } from '../../utils/norwegianText.js'

export default function AddressSuggestions({ results, onSelect, error, query }) {
  if (error) {
    return (
      <div className="address-suggestions">
        <div className="address-suggestions__empty">{error}</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="address-suggestions">
        <div className="address-suggestions__empty">
          Ingen adresser funnet for «{query}» i Oslo
        </div>
      </div>
    )
  }

  return (
    <div className="address-suggestions" role="listbox" aria-label="Adresseforslag">
      {results.map((hit, i) => (
        <div
          key={`${hit.adressetekst}-${i}`}
          className="address-suggestions__item"
          role="option"
          tabIndex={0}
          onClick={() => onSelect(hit)}
          onKeyDown={e => e.key === 'Enter' && onSelect(hit)}
        >
          <img src="/icons/Lokasjon.svg" alt="" className="address-suggestions__item-icon" />
          <div className="address-suggestions__item-text">
            <div className="address-suggestions__main">{formatAddress(hit)}</div>
            <div className="address-suggestions__sub">
              {hit.postnummer && `${hit.postnummer} `}{hit.poststed || 'Oslo'}
              {hit.grunnkretsnavn ? ` · ${hit.grunnkretsnavn}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
