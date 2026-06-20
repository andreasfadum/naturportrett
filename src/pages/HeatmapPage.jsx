import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'
import AppHeader from '../components/layout/AppHeader.jsx'
import AppFooter from '../components/layout/AppFooter.jsx'

const OSLO_SENTER = [59.91, 10.74]
const OSLO_ZOOM = 11

const KATEGORI_REKKEFOLGE = [
  'Fugl',
  'Plante',
  'Insekt',
  'Pattedyr',
  'Sopp',
  'Edderkoppdyr',
  'Reptil',
  'Amfibium',
  'Fisk',
  'Bløtdyr',
  'Dyr',
  'Annet',
]

export default function HeatmapPage() {
  const mapRef = useRef(null)
  const heatLayerRef = useRef(null)
  const containerRef = useRef(null)
  const [data, setData] = useState(null)
  const [feil, setFeil] = useState('')
  const [valgtKategori, setValgtKategori] = useState('alle')
  const [intensitet, setIntensitet] = useState(1.5)

  useEffect(() => {
    fetch('/heatmap-data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(err => setFeil(`Klarte ikke å hente heatmap-data: ${err.message}. Kjør \`npm run build:heatmap-data\` lokalt for å regenerere.`))
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const kart = L.map(containerRef.current, {
      center: OSLO_SENTER,
      zoom: OSLO_ZOOM,
      scrollWheelZoom: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap-bidragsytere',
    }).addTo(kart)
    mapRef.current = kart
    return () => {
      kart.remove()
      mapRef.current = null
    }
  }, [])

  const filtrerteCeller = useMemo(() => {
    if (!data || !Array.isArray(data.celler)) return []
    if (valgtKategori === 'alle') return data.celler
    return data.celler.filter(c => c.kategori === valgtKategori)
  }, [data, valgtKategori])

  useEffect(() => {
    if (!mapRef.current || !data) return

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (filtrerteCeller.length === 0) return

    if (typeof L.heatLayer !== 'function') {
      console.warn('leaflet.heat ikke lastet — heat-laget kan ikke rendres')
      return
    }

    // Bruker rå antall som intensitet; leaflet.heat tar `max` som taket.
    // For å hindre at ekstrem-celler (Akerselva med 100+ obs) suger all
    // synlighet fra mer moderate, bruker vi en konstant som er nær gjennomsnittet
    // av de aktive cellene multiplisert med brukerens intensitets-faktor.
    const sortertEtterAntall = [...filtrerteCeller].sort((a, b) => a.antall - b.antall)
    const median = sortertEtterAntall[Math.floor(sortertEtterAntall.length / 2)]?.antall || 1
    const maxVerdi = Math.max(2, median * 2) / intensitet

    const punkter = filtrerteCeller.map(c => [c.lat, c.lon, c.antall])

    heatLayerRef.current = L.heatLayer(punkter, {
      radius: 25,
      blur: 30,
      maxZoom: 17,
      max: maxVerdi,
      minOpacity: 0.35,
      gradient: {
        0.0: 'rgba(67, 248, 182, 0.6)',
        0.3: 'rgba(67, 248, 182, 0.9)',
        0.5: 'rgba(249, 198, 107, 0.95)',
        0.75: 'rgba(255, 130, 116, 1.0)',
        1.0: 'rgba(42, 40, 89, 1.0)',
      },
    }).addTo(mapRef.current)
  }, [filtrerteCeller, intensitet, data])

  const kategorierMedAntall = useMemo(() => {
    if (!data) return []
    const teller = {}
    for (const c of data.celler) {
      teller[c.kategori] = (teller[c.kategori] || 0) + c.antall
    }
    const ordnet = KATEGORI_REKKEFOLGE
      .filter(k => teller[k])
      .map(k => ({ kategori: k, antall: teller[k] }))
    for (const k of Object.keys(teller)) {
      if (!KATEGORI_REKKEFOLGE.includes(k)) ordnet.push({ kategori: k, antall: teller[k] })
    }
    return ordnet
  }, [data])

  const totaltAntall = data
    ? data.celler.reduce((sum, c) => sum + c.antall, 0)
    : 0
  const visAntall = filtrerteCeller.reduce((sum, c) => sum + c.antall, 0)

  return (
    <div className="heatmap-page">
      <AppHeader />
      <div className="heatmap-page__wrap">
        <div className="heatmap-page__intro">
          <h1>Heatmap — kartlagte arts-registreringer i Oslo</h1>
          <p>
            Hvor er det registrert mest arter? Og hvor er det «kvitt»? Heatmapet viser tettheten av GBIF-observasjoner i Oslo kommune, aggregert til 100&nbsp;×&nbsp;100&nbsp;m grid. Mørke flekker = mye data. Hvite flekker = lite eller ingen registreringer — kandidater for ny kartlegging.
          </p>
          {data && (
            <p className="heatmap-page__metadata">
              Sist oppdatert: {data.generertTid?.slice(0, 10) || '—'} · {data.antallObservasjoner?.toLocaleString('no-NO') || '—'} observasjoner · {data.antallCeller?.toLocaleString('no-NO') || '—'} grid-celler · {data.gridResolusjon * 111000 | 0}&nbsp;m oppløsning
            </p>
          )}
        </div>

        {feil && (
          <div className="heatmap-page__feil">{feil}</div>
        )}

        {data && !feil && (
          <div className="heatmap-page__kontroller">
            <div className="heatmap-page__filtergruppe">
              <span className="heatmap-page__filtertittel">Artsgruppe:</span>
              <button
                className={`heatmap-pill ${valgtKategori === 'alle' ? 'heatmap-pill--aktiv' : ''}`}
                onClick={() => setValgtKategori('alle')}
              >
                Alle ({totaltAntall.toLocaleString('no-NO')})
              </button>
              {kategorierMedAntall.map(k => (
                <button
                  key={k.kategori}
                  className={`heatmap-pill ${valgtKategori === k.kategori ? 'heatmap-pill--aktiv' : ''}`}
                  onClick={() => setValgtKategori(k.kategori)}
                >
                  {k.kategori} ({k.antall.toLocaleString('no-NO')})
                </button>
              ))}
            </div>
            <div className="heatmap-page__intensitet">
              <label htmlFor="intensitet">Intensitet</label>
              <input
                id="intensitet"
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={intensitet}
                onChange={e => setIntensitet(parseFloat(e.target.value))}
              />
              <span>{intensitet.toFixed(1)}×</span>
            </div>
          </div>
        )}

        {data && !feil && valgtKategori !== 'alle' && (
          <p className="heatmap-page__hint">Viser {visAntall.toLocaleString('no-NO')} observasjoner for «{valgtKategori}»</p>
        )}

        <div ref={containerRef} className="heatmap-page__kart" />

        <div className="heatmap-page__forbehold">
          <h2>Hva betyr dette egentlig?</h2>
          <ul>
            <li><strong>Mørke flekker</strong> betyr ofte at mange folk er der med kamera (Akerselva, sentrum, populære turstier) — ikke nødvendigvis at det er mest natur.</li>
            <li><strong>Hvite flekker</strong> betyr ikke at det ikke finnes natur — det betyr at <em>vi ikke har registreringer der</em>. Det er disse områdene som kan trenge feltkartlegging før et byggetiltak.</li>
            <li>Datagrunnlaget er et utvalg av ~{data?.antallObservasjoner?.toLocaleString('no-NO') || '?'} GBIF-observasjoner. Oslo har totalt ~2,9 millioner registreringer — heatmapet er en representativ skisse, ikke en fullstendig oversikt.</li>
            <li>Regenerér data med <code>npm run build:heatmap-data</code> (~5 min).</li>
          </ul>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
