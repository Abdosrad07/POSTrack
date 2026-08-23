import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Carte interactive de couverture des BTS — Module A4 (Lead Frontend).
 *
 * Implémentation professionnelle utilisant React-Leaflet + OpenStreetMap
 * (fond cartographique réel). Affiche les marqueurs des BTS, leur étendue de
 * couverture (rayon circulaire) et permet de sélectionner une BTS au clic.
 * Le clic remonte la BTS via `onSelect`.
 */
const DEFAULT_POSITION = [4.2, 10.0] // Cameroun par défaut
const DEFAULT_ZOOM = 7

const STATUS_STYLE = {
  ACTIF: { color: '#16a34a', fillColor: '#16a34a', label: 'Actif' },
  MAINTENANCE: { color: '#eab308', fillColor: '#eab308', label: 'Maintenance' },
  HORS_SERVICE: { color: '#dc2626', fillColor: '#dc2626', label: 'Hors service' },
}

/** Convertit un rayon en km en mètres (Leaflet Circle utilise des mètres). */
const rayonKmToMeters = (km) => (km || 20) * 1000

export default function CarteBTS({ btsList = [], selectedId = null, onSelect = () => {}, rayonEnKm = 20 }) {
  const [hover, setHover] = useState(null)

  // Normalisation des BTS avec coordonnées valides
  const validBts = useMemo(
    () =>
      btsList
        .map((bts) => {
          const lat = parseFloat(bts.latitude ?? bts.lat)
          const lng = parseFloat(bts.longitude ?? bts.lng)
          if (isNaN(lat) || isNaN(lng)) return null
          return {
            ...bts,
            lat,
            lng,
            statut: bts.statut || 'ACTIF',
            nom: bts.nom || bts.code_bts,
          }
        })
        .filter(Boolean),
    [btsList]
  )

  const center = validBts.length > 0
    ? [
        validBts.reduce((s, b) => s + b.lat, 0) / validBts.length,
        validBts.reduce((s, b) => s + b.lng, 0) / validBts.length,
      ]
    : DEFAULT_POSITION

  const rayonMeters = rayonKmToMeters(rayonEnKm)

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[420px] lg:h-[520px]">
      <MapContainer
        center={center}
        zoom={validBts.length > 0 ? 13 : DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Étendues de couverture + marqueurs */}
        {validBts.map((bts) => {
          const style = STATUS_STYLE[bts.statut] || STATUS_STYLE.ACTIF
          const selected = bts.id === selectedId || bts.id === hover?.id
          return (
            <div key={bts.id}>
              <Circle
                center={[bts.lat, bts.lng]}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fillColor,
                  fillOpacity: 0.15,
                }}
                radius={rayonMeters}
                interactive={false}
              />

              <Marker
                position={[bts.lat, bts.lng]}
                eventHandlers={{
                  click: () => onSelect(bts),
                  mouseover: () => setHover(bts),
                  mouseout: () => setHover(null),
                }}
                title={`${bts.nom} - ${style.label}`}
              >
                {selected && (
                  <Popup>
                    <div className="min-w-[200px] p-2 text-left">
                      <div className="font-medium text-gray-800">{bts.nom}</div>
                      <div className="text-sm text-gray-600">Opérateur : {bts.operateur || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Technologie : {bts.technologie || 'N/A'}</div>
                      <div className="text-sm text-gray-600 mt-1">Région : {bts.region || 'N/A'} | Ville : {bts.ville || 'N/A'}</div>
                      <div className="text-sm text-gray-600 mt-1">Capacité : {bts.capacite_max || 'N/A'}</div>
                      <div className="text-sm mt-1">Statut : <span style={{ color: style.color }}>{style.label}</span></div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${bts.lat},${bts.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline"
                      >
                        📍 Ouvrir dans le planificateur cartographique
                      </a>
                    </div>
                  </Popup>
                )}
              </Marker>
            </div>
          )
        })}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-3 left-3 rounded bg-white/95 border border-gray-200 p-2 text-xs shadow-sm">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: v.fillColor }} />
            <span className="text-gray-700">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}