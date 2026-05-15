import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function AreaMap({ lat, lon, radiusM = 500, label }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !lat || !lon) return

    // Initialiser kart kun én gang
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat, lon],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      // OpenStreetMap-tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap-bidragsytere',
      }).addTo(map)

      // Markør
      const markerIcon = L.divIcon({
        className: 'area-map__marker-icon',
        html: '<div class="area-map__marker"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })
      L.marker([lat, lon], { icon: markerIcon }).addTo(map)
        .bindPopup(label || 'Prosjektadresse')

      // Influenssone-sirkel
      L.circle([lat, lon], {
        radius: radiusM,
        color: '#2A2859',
        weight: 2,
        fillColor: '#43F8B6',
        fillOpacity: 0.18,
      }).addTo(map)

      // Pass på at zoom-nivået dekker hele sirkelen
      map.fitBounds(L.latLng(lat, lon).toBounds(radiusM * 2.5))

      mapRef.current = map
    }

    return () => {
      // Rydd opp ved unmount
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lon, radiusM, label])

  if (!lat || !lon) {
    return (
      <div className="portrait-doc__map-placeholder">
        Mangler koordinater for visning av kart.
      </div>
    )
  }

  return (
    <div className="area-map-wrap">
      <div ref={containerRef} className="area-map" />
      <div className="area-map__legend">
        <span className="area-map__legend-dot" /> Prosjektadresse
        <span className="area-map__legend-circle" /> 500 m influenssone
      </div>
    </div>
  )
}
