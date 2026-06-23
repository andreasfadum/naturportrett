import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'
import { useT } from '../../i18n/index.jsx'

const LS_HEATMAP = 'naturportrett.kart.heatmap'

// Cache heatmap-data mellom kart-mounts — den er ~1 MB og endres ved
// rebuild. Promise-cache slik at flere kart i samme session deler én
// fetch.
let heatmapDataPromise = null

function hentHeatmapData() {
  if (!heatmapDataPromise) {
    heatmapDataPromise = fetch('/heatmap-data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .catch(err => {
        heatmapDataPromise = null  // tillat retry ved feil
        throw err
      })
  }
  return heatmapDataPromise
}

export default function AreaMap({ lat, lon, radiusM = 500, label }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const heatLayerRef = useRef(null)
  const t = useT()

  const [visHeatmap, setVisHeatmap] = useState(() => {
    try {
      const lagret = window.localStorage.getItem(LS_HEATMAP)
      return lagret === null ? true : lagret === '1'  // default ON
    } catch { return true }
  })
  const [heatmapData, setHeatmapData] = useState(null)
  const [heatmapFeil, setHeatmapFeil] = useState(false)

  // Lagre toggle-valg
  useEffect(() => {
    try { window.localStorage.setItem(LS_HEATMAP, visHeatmap ? '1' : '0') } catch { /* noop */ }
  }, [visHeatmap])

  // Hent heatmap-data ved mount (kun hvis vi skal vise heatmap)
  useEffect(() => {
    if (!visHeatmap || heatmapData) return
    let kansellert = false
    hentHeatmapData()
      .then(d => { if (!kansellert) setHeatmapData(d) })
      .catch(() => { if (!kansellert) setHeatmapFeil(true) })
    return () => { kansellert = true }
  }, [visHeatmap, heatmapData])

  // Initialiser basis-kart kun én gang
  useEffect(() => {
    if (!containerRef.current || !lat || !lon) return

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat, lon],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap-bidragsytere',
      }).addTo(map)

      const markerIcon = L.divIcon({
        className: 'area-map__marker-icon',
        html: '<div class="area-map__marker"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })
      L.marker([lat, lon], { icon: markerIcon }).addTo(map)
        .bindPopup(label || 'Prosjektadresse')

      // Influenssone-sirkel — alltid synlig, også når heatmap er på
      L.circle([lat, lon], {
        radius: radiusM,
        color: '#2A2859',
        weight: 2,
        fillColor: visHeatmap ? 'transparent' : '#43F8B6',
        fillOpacity: visHeatmap ? 0 : 0.18,
      }).addTo(map)

      map.fitBounds(L.latLng(lat, lon).toBounds(radiusM * 2.5))

      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        heatLayerRef.current = null
      }
    }
  }, [lat, lon, radiusM, label, visHeatmap])

  // Toggle heatmap-laget — kun celler i nærheten av eiendommen, av
  // hensyn til ytelse (full heatmap har ~20-50k punkter).
  useEffect(() => {
    if (!mapRef.current || !heatmapData) return

    // Fjern eksisterende lag
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (!visHeatmap) return
    if (typeof L.heatLayer !== 'function') return

    // Filtrer til celler innenfor utvidet bbox (3× influenssone) for å
    // gi kontekst utenfor sirkelen uten å rendere hele Oslo.
    const radiusGrader = (radiusM * 3) / 111000
    const minLat = lat - radiusGrader
    const maxLat = lat + radiusGrader
    const lonRadiusGrader = radiusGrader / Math.cos(lat * Math.PI / 180)
    const minLon = lon - lonRadiusGrader
    const maxLon = lon + lonRadiusGrader

    const naerliggendeCeller = (heatmapData.celler || []).filter(c =>
      c.lat >= minLat && c.lat <= maxLat && c.lon >= minLon && c.lon <= maxLon
    )

    if (naerliggendeCeller.length === 0) return

    // Skala intensitet til median for å unngå at ekstreme celler suger
    // synlighet. Når brukeren har valgt liten influenssone (f.eks. 200 m)
    // er kartet sterkt zoomet inn og heat-cellene blir for små med
    // konservative verdier. Vi øker radius+blur+minOpacity både på
    // desktop og mobil slik at effekten er tydelig synlig uansett zoom.
    const erMobil = typeof window !== 'undefined' && window.innerWidth < 720
    const sortert = [...naerliggendeCeller].sort((a, b) => a.antall - b.antall)
    const median = sortert[Math.floor(sortert.length / 2)]?.antall || 1
    const maxVerdi = erMobil
      ? Math.max(1.2, median * 1.1)
      : Math.max(1.5, median * 1.3)

    const punkter = naerliggendeCeller.map(c => [c.lat, c.lon, c.antall])

    heatLayerRef.current = L.heatLayer(punkter, {
      radius: erMobil ? 45 : 35,
      blur: erMobil ? 55 : 45,
      maxZoom: 18,
      max: maxVerdi,
      minOpacity: erMobil ? 0.6 : 0.55,
      gradient: {
        0.0: 'rgba(67, 248, 182, 0.7)',
        0.3: 'rgba(67, 248, 182, 1.0)',
        0.5: 'rgba(249, 198, 107, 1.0)',
        0.75: 'rgba(255, 130, 116, 1.0)',
        1.0: 'rgba(42, 40, 89, 1.0)',
      },
    }).addTo(mapRef.current)
  }, [heatmapData, visHeatmap, lat, lon, radiusM])

  if (!lat || !lon) {
    return (
      <div className="portrait-doc__map-placeholder">
        {t('kart.mangler-koordinater')}
      </div>
    )
  }

  const radiusTekst = radiusM >= 1000
    ? (Number.isInteger(radiusM / 1000) ? `${radiusM / 1000} km` : `${(radiusM / 1000).toFixed(1)} km`)
    : `${radiusM} m`

  return (
    <div className="area-map-wrap">
      <div className="area-map__controls no-print">
        <label className="heatmap-toggle" title={t('naturportrett.kart.heatmap-hjelp')}>
          <input
            type="checkbox"
            className="heatmap-toggle__input"
            checked={visHeatmap}
            onChange={e => setVisHeatmap(e.target.checked)}
          />
          <span className="heatmap-toggle__track" aria-hidden="true">
            <span className="heatmap-toggle__thumb" />
          </span>
          <span className="heatmap-toggle__text">{t('naturportrett.kart.heatmap-toggle')}</span>
        </label>
        {visHeatmap && !heatmapData && !heatmapFeil && (
          <span className="heatmap-toggle__status">{t('naturportrett.kart.heatmap-laster')}</span>
        )}
        {visHeatmap && heatmapFeil && (
          <span className="heatmap-toggle__status heatmap-toggle__status--feil">{t('naturportrett.kart.heatmap-feil')}</span>
        )}
      </div>
      <div ref={containerRef} className="area-map" />
      <div className="area-map__legend">
        <span className="area-map__legend-dot" /> {t('naturportrett.kart.legend.adresse')}
        <span className="area-map__legend-circle" /> {t('naturportrett.kart.legend.sone', { radius: radiusTekst })}
      </div>
    </div>
  )
}
