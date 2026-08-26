import { useEffect, useState, useMemo } from 'react';
import { geoService } from '../services/geoService';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_POSITION = [4.2, 10.0]; // Cameroun par défaut
const DEFAULT_ZOOM = 7;

const STATUS_STYLE = {
  actif: { color: '#16a34a', fillColor: '#16a34a', label: 'Actif' },
  maintenance: { color: '#eab308', fillColor: '#eab308', label: 'Maintenance' },
  hors_service: { color: '#dc2626', fillColor: '#dc2626', label: 'Hors service' },
  inconnu: { color: '#6b7280', fillColor: '#6b7280', label: 'Inconnu' },
};

export default function PartnerTerritoryMap({ partnerId, onSelect }) {
  const [hover, setHover] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerTerritory(partnerId);
  }, [partnerId]);

  const fetchPartnerTerritory = async () => {
    try {
      setLoading(true);
      const response = await geoService.getPartnerGeo(partnerId);
      setGeoData(response.data || response);
    } catch (err) {
      console.error('Failed to fetch partner territory:', err);
      setGeoData(null);
    } finally {
      setLoading(false);
    }
  };

  const center = useMemo(() => {
    if (!geoData?.bts || geoData.bts.length === 0) return DEFAULT_POSITION;
    
    const validBts = geoData.bts.filter(b => b.latitude != null && b.longitude != null);
    if (validBts.length === 0) return DEFAULT_POSITION;
    
    const avgLat = validBts.reduce((s, b) => s + b.latitude, 0) / validBts.length;
    const avgLng = validBts.reduce((s, b) => s + b.longitude, 0) / validBts.length;
    return [avgLat, avgLng];
  }, [geoData]);

  const zoomLevel = geoData?.bts?.length > 0 ? 12 : DEFAULT_ZOOM;

  if (loading) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[480px] lg:h-[560px] flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  if (!geoData || !geoData.has_geo_data) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[480px] lg:h-[560px] flex items-center justify-center">
        <div className="text-sm text-gray-500">Aucune donnée géographique disponible pour ce partenaire</div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[480px] lg:h-[560px]">
      <MapContainer
        center={center}
        zoom={zoomLevel}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Territory polygon (client-provided or convex hull) */}
        {geoData.territory && (
          <Polygon
            positions={geoData.territory.coordinates?.[0]?.map(c => [c[1], c[0]]) || []}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
            }}
          />
        )}

        {/* Zones (quartiers) with convex hull boundaries */}
        {geoData.zones?.map((zone, idx) => (
          zone.boundaries?.coordinates?.[0] && (
            <Polygon
              key={`zone-${idx}`}
              positions={zone.boundaries.coordinates[0].map(c => [c[1], c[0]])}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.15,
                weight: 1.5,
              }}
            />
          )
        ))}

        {/* Micro-zones with boundaries */}
        {geoData.micro_zones?.map((mz) => (
          mz.boundaries?.coordinates?.[0] && (
            <Polygon
              key={`mz-${mz.id}`}
              positions={mz.boundaries.coordinates[0].map(c => [c[1], c[0]])}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          )
        ))}

        {/* Micro-zones center points (as fallback when no boundaries) */}
        {geoData.micro_zones?.map((mz) => (
          mz.latitude != null && mz.longitude != null && !mz.boundaries && (
            <CircleMarker
              key={`mz-center-${mz.id}`}
              center={[mz.latitude, mz.longitude]}
              radius={8}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[150px]">
                  <div className="font-medium text-gray-800">{mz.name}</div>
                  {mz.code && <div className="text-sm text-gray-600">Code: {mz.code}</div>}
                </div>
              </Popup>
            </CircleMarker>
          )
        ))}

        {/* BTS markers */}
        {geoData.bts?.filter(b => b.latitude != null && b.longitude != null).map((bts) => {
          const statusStyle = STATUS_STYLE[bts.statut] || STATUS_STYLE.inconnu;
          const selected = bts.id === hover?.id;

          return (
            <CircleMarker
              key={bts.id}
              center={[bts.latitude, bts.longitude]}
              radius={selected ? 10 : 6}
              pathOptions={{
                color: statusStyle.color,
                fillColor: statusStyle.fillColor,
                fillOpacity: 0.7,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(bts),
                mouseover: () => setHover(bts),
                mouseout: () => setHover(null),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-2 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: statusStyle.fillColor }} />
                    <div>
                      <div className="font-medium text-gray-800">{bts.code}</div>
                      <div className="text-sm text-gray-600">{bts.nom || 'Sans nom'}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    Opérateur : <span className="font-medium">{bts.operateur || '-'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Technologie : <span className="font-medium">{bts.technologie || '-'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Statut : <span style={{ color: statusStyle.color }}>{statusStyle.label}</span>
                  </div>
                  {bts.saturation != null && (
                    <div className="text-sm text-gray-600">
                      Saturation : <span className="font-medium">{bts.saturation.toFixed(1)}%</span>
                    </div>
                  )}
                  {bts.quartier && (
                    <div className="text-sm text-gray-600 mt-1">
                      Quartier : {bts.quartier}
                    </div>
                  )}
                  {bts.micro_zone && (
                    <div className="text-sm text-gray-600">
                      Micro-zone : {bts.micro_zone}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded bg-white/95 border border-gray-200 p-3 text-xs shadow-sm space-y-2">
        <div className="font-medium text-gray-700">Légende</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-gray-700">Territoire partenaire</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-gray-700">Zones / Quartiers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-gray-700">Micro-zones</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-green-600" />
          <span className="text-gray-700">BTS Actif</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-gray-700">BTS Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
          <span className="text-gray-700">BTS Hors service</span>
        </div>
      </div>

      {/* Info badges */}
      <div className="absolute top-3 right-3 z-[1000] space-y-2">
        {geoData.territory_source && (
          <div className="rounded bg-blue-50 border border-blue-200 px-3 py-2 text-xs shadow-sm">
            Source: {geoData.territory_source === 'client' ? 'Client' : 'Calculé (convex hull)'}
          </div>
        )}
        {geoData.bts?.length > 0 && (
          <div className="rounded bg-white/95 border border-gray-200 px-3 py-2 text-xs shadow-sm">
            BTS: {geoData.bts.length}
          </div>
        )}
        {geoData.micro_zones?.length > 0 && (
          <div className="rounded bg-white/95 border border-gray-200 px-3 py-2 text-xs shadow-sm">
            Micro-zones: {geoData.micro_zones.length}
          </div>
        )}
        {geoData.zones?.length > 0 && (
          <div className="rounded bg-white/95 border border-gray-200 px-3 py-2 text-xs shadow-sm">
            Zones: {geoData.zones.length}
          </div>
        )}
      </div>
    </div>
  );
}
