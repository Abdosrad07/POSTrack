import { useMemo, useState, useCallback } from 'react'

/**
 * Carte interactive de couverture des BTS — Module A4 (Lead Frontend).
 *
 * Implémentation autonome (SVG) sans dépendance externe : projette les BTS
 * (lat/lng) sur une grille, dessine leur rayon/étendue de couverture et permet
 * de sélectionner une BTS au clic. Le clic remonte la BTS via `onSelect`.
 */
const WIDTH = 800
const HEIGHT = 500
const PAD = 60
const DEFAULT_CENTER = { lat: 4.2, lng: 10.0 } // Cameroun par défaut
const DEFAULT_SPAN = 4 // degrés de latitude affichés

const STATUS_STYLE = {
  ACTIF: { fill: '#16a34a', color: '#15803d', label: 'Actif' },
  MAINTENANCE: { fill: '#eab308', color: '#ca8a04', label: 'Maintenance' },
  HORS_SERVICE: { fill: '#dc2626', color: '#b91c1c', label: 'Hors service' },
}

/** Projection équirectangulaire simple lat/lng -> px */
function buildProjector(center, span) {
  const lngSpan = span * (WIDTH / HEIGHT) * 1.2
  const minLat = center.lat - span / 2
  const maxLat = center.lat + span / 2
  const minLng = center.lng - lngSpan / 2
  const maxLng = center.lng + lngSpan / 2
  const toX = (lng) => PAD + ((lng - minLng) / (maxLng - minLng)) * (WIDTH - 2 * PAD)
  const toY = (lat) => PAD + ((maxLat - lat) / (maxLat - minLat)) * (HEIGHT - 2 * PAD)
  return { toX, toY, minLat, maxLat, minLng, maxLng }
}

/** Convertit les champs BTS possibles (lat/lattitude...) en numérique défini. */
const toNum = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

export default function CarteBTS({ btsList = [], selectedId = null, onSelect = () => {}, rayonParDefaut = 20 }) {
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [span, setSpan] = useState(DEFAULT_SPAN)
  const [hover, setHover] = useState(null)

  const { toX, toY, minLat, maxLat, minLng, maxLng } = useMemo(
    () => buildProjector(center, span),
    [center, span]
  )

  // Grille de fond
  const gridLines = useMemo(() => {
    const latLines = []
    const lngLines = []
    const latStep = Math.max(0.5, span / 4)
    const lngStep = latStep * (WIDTH / HEIGHT) * 1.2
    for (let lat = Math.ceil(minLat / latStep) * latStep; lat <= maxLat; lat += latStep) {
      latLines.push({ y: toY(lat), label: `${lat.toFixed(2)}°` })
    }
    for (let lng = Math.ceil(minLng / lngStep) * lngStep; lng <= maxLng; lng += lngStep) {
      lngLines.push({ x: toX(lng), label: `${lng.toFixed(2)}°` })
    }
    return { latLines, lngLines }
  }, [toX, toY, minLat, maxLat, minLng, maxLng, span])

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      setSpan((s) => Math.min(12, Math.max(1, s + (e.deltaY > 0 ? 0.5 : -0.5))))
    },
    []
  )

  const handleDrag = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const dx = e.clientX - rect.left - WIDTH / 2
      const dy = e.clientY - rect.top - HEIGHT / 2
      const lngStep = span * (WIDTH / HEIGHT) * 1.2
      setCenter((c) => ({
        lat: c.lat - (dy / (HEIGHT - 2 * PAD)) * span,
        lng: c.lng - (dx / (WIDTH - 2 * PAD)) * lngStep,
      }))
    },
    [span]
  )

  const zoomIn = () => setSpan((s) => Math.max(1, s / 1.5))
  const zoomOut = () => setSpan((s) => Math.min(12, s * 1.5))

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full select-none"
        onWheel={handleWheel}
        onPointerMove={handleDrag}
      >
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#f3f4f6" />

        {/* Grille */}
        {gridLines.latLines.map((l, i) => (
          <line key={`lat-${i}`} x1="0" y1={l.y} x2={WIDTH} y2={l.y} stroke="#d1d5db" strokeWidth="0.5" />
        ))}
        {gridLines.lngLines.map((l, i) => (
          <line key={`lng-${i}`} x1={l.x} y1="0" x2={l.x} y2={HEIGHT} stroke="#d1d5db" strokeWidth="0.5" />
        ))}
        {gridLines.latLines.map((l, i) => (
          <text key={`ll-${i}`} x="6" y={l.y - 4} className="text-[10px] fill-gray-400">{l.label}</text>
        ))}
        {gridLines.lngLines.map((l, i) => (
          <text key={`lg-${i}`} x={l.x + 4} y={HEIGHT - 8} className="text-[10px] fill-gray-400">{l.label}</text>
        ))}

        {/* Étendues de couverture + marqueurs */}
        {btsList.map((bts) => {
          const lat = toNum(bts.latitude ?? bts.lat)
          const lng = toNum(bts.longitude ?? bts.lng)
          if (lat == null || lng == null) return null
          const x = toX(lng)
          const y = toY(lat)
          const style = STATUS_STYLE[bts.statut] || STATUS_STYLE.ACTIF
          const rayon = toNum(bts.rayon_km) ?? rayonParDefaut
          const radiusPx = ((rayon / 111) / span) * (HEIGHT - 2 * PAD)
          const selected = bts.id === selectedId || bts.id === hover?.id
          return (
            <g
              key={bts.id}
              transform={`translate(${x},${y})`}
              onClick={() => onSelect(bts)}
              onMouseEnter={() => setHover(bts)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <circle r={radiusPx} fill={style.fill} fillOpacity="0.15" stroke={style.fill} strokeWidth="1" />
              <circle
                r={Math.max(radiusPx, 2)}
                fill="none"
                stroke={style.color}
                strokeWidth={selected ? 2.5 : 1.5}
                strokeDasharray={selected ? 'none' : '4,3'}
              />
              <circle r={selected ? 9 : 6} fill={selected ? style.color : style.fill} stroke="#fff" strokeWidth="2" />
              {selected && (
                <text y="-14" textAnchor="middle" className="text-xs font-semibold fill-gray-800">
                  {bts.nom || bts.code_bts}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Contrôles zoom */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button onClick={zoomIn} className="h-8 w-8 rounded bg-white shadow border border-gray-200 text-gray-700 font-bold hover:bg-gray-50">+</button>
        <button onClick={zoomOut} className="h-8 w-8 rounded bg-white shadow border border-gray-200 text-gray-700 font-bold hover:bg-gray-50">−</button>
      </div>

      {/* Légende */}
      <div className="absolute bottom-3 left-3 rounded bg-white/95 border border-gray-200 p-2 text-xs shadow-sm">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: v.fill }} />
            <span className="text-gray-700">{v.label}</span>
          </div>
        ))}
        <div className="mt-1 text-gray-400">Molette: zoom · Glisser: déplacer</div>
      </div>
    </div>
  )
}

