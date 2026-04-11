import { formatFullAddress } from '../../utils/norwegianText.js'

export default function InfluenceZoneInfo({ address }) {
  return (
    <div className="influence-zone" role="status">
      <img src="/icons/Kart.svg" alt="" className="influence-zone__icon" />
      <div className="influence-zone__text">
        Søker innenfor <strong>500 m</strong> fra{' '}
        <span className="influence-zone__address">{formatFullAddress(address)}</span>
      </div>
    </div>
  )
}
