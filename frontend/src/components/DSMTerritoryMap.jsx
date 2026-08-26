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

const POS_STATUS_STYLE = {
  ACTIF: { color: '#3b82f6', fillColor: '#3b82f6', label: 'Actif' },
  SUSPENDU: { color: '#f59e0b', fillColor: '#f59e0b', label: 'Suspendu' },
  FERME: { color: '#dc2626', fillColor: '#dc2626', label: 'Fermé' },
};

const POS_TYPE_STYLE = {
  NOUVEAU: { color: '#8b5cf6', fillColor: '#8b5cf6', label: 'Nouveau' },
  RECONDUIT: { color: '#06b6d4', fillColor: '#06b6d4', label: 'Reconduit' },
};

export default function DSMTerritoryMap({ partnerId, dsmId, onSelect }) {
  const [hover, setHover] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDSMTerritory(partnerId, dsmId);
  }, [partnerId, dsmId]);

  const fetchDSMTerritory = async () => {
    try {
      setLoading(true);
      const response = await geoService.getDsmGeo(partnerId, dsmId);
      setGeoData(response.data || response);
    } catch (err) {
      console.error('Failed to fetch DSM territory:', err);
      setGeoData(null);
    } finally {
      setLoading(false);
    }
  };

  const center = useMemo(() => {
    if (!geoData?.pos || geoData.pos.length === 0) return DEFAULT_POSITION;
    
    const validPos = geoData.pos.filter(p => p.latitude != null && p.longitude != null);
    if (validPos.length === 0) return DEFAULT_POSITION;
    
    const avgLat = validPos.reduce((s, p) => s + p.latitude, 0) / validPos.length;
    const avgLng = validPos.reduce((s, p) => s + p.longitude, 0) / validPos.length;
    return [avgLat, avgLng];
  }, [geoData]);

  const zoomLevel = geoData?.pos?.length > 0 ? 12 : DEFAULT_ZOOM;

  if (loading) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[480px] lg:h-[560px] flex items-center justify-center">
        <div className="text-sm text-gray-500">Chargement de la carte DSM...</div>
      </div>
    );
  }

  if (!geoData || !geoData.has_geo_data) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:h-[480px] lg:h-[560px] flex items-center justify-center">
        <div className="text-sm text-gray-500">Aucune donnée géographique disponible pour ce DSM</div>
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

        {/* DSM Territory polygon (convex hull of POS) */}
        {geoData.territory && (
          <Polygon
            positions={geoData.territory.coordinates?.[0]?.map(c => [c[1], c[0]]) || []}
            pathOptions={{
              color: '#8b5cf6',
              fillColor: '#8b5cf6',
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '5, 5',
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
                fillOpacity: 0.1,
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
                fillOpacity: 0.15,
                weight: 1.5,
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
              radius={6}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.5,
                weight: 1.5,
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

        {/* POS markers (DSM-specific) */}
        {geoData.pos?.filter(p => p.latitude != null && p.longitude != null).map((pos) => {
          const statusStyle = POS_STATUS_STYLE[pos.status] || POS_STATUS_STYLE.ACTIF;
          const typeStyle = POS_TYPE_STYLE[pos.type_pos] || POS_TYPE_STYLE.NOUVEAU;
          const selected = pos.id === hover?.id;

          return (
            <CircleMarker
              key={pos.id}
              center={[pos.latitude, pos.longitude]}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: typeStyle.color,
                fillColor: statusStyle.fillColor,
                fillOpacity: 0.8,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(pos),
                mouseover: () => setHover(pos),
                mouseout: () => setHover(null),
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-2 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: typeStyle.fillColor }} />
                    <div>
                      <div className="font-medium text-gray-800">{pos.code_pos}</div>
                      <div className="text-sm text-gray-600">{pos.name || 'Sans nom'}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    Type : <span style={{ color: typeStyle.color }}>{typeStyle.label}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Statut : <span style={{ color: statusStyle.color }}>{statusStyle.label}</span>
                  </div>
                  {pos.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      Adresse : {pos.address}
                    </div>
                  )}
                  {pos.quartier && (
                    <div className="text-sm text-gray-600 mt-1">
                      Quartier : {pos.quartier}
                    </div>
                  )}
                  {pos.micro_zone && (
                    <div className="text-sm text-gray-600">
                      Micro-zone : {pos.micro_zone}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* BTS markers (partner-level, shown for context) */}
        {geoData.bts?.filter(b => b.latitude != null && b.longitude != null).map((bts) => {
          const statusStyle = STATUS_STYLE[bts.statut] || STATUS_STYLE.inconnu;
          const selected = bts.id === hover?.id;

          return (
            <CircleMarker
              key={`bts-${bts.id}`}
              center={[bts.latitude, bts.longitude]}
              radius={selected ? 8 : 4}
              pathOptions={{
                color: statusStyle.color,
                fillColor: statusStyle.fillColor,
                fillOpacity: 0.5,
                weight: 1,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(bts),
                mouseover: () => setHover(bts),
                mouseout: () => setHover(null),
              }}
            >
              <Popup>
                <div className="min-w-[180px] p-2 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: statusStyle.fillColor }} />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{bts.code}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Opérateur : <span className="font-medium">{bts.operateur || '-'}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Statut : <span style={{ color: statusStyle.color }}>{statusStyle.label}</span>
                  </div>
                  {bts.saturation != null && (
                    <div className="text-xs text-gray-600">
                      Saturation : <span className="font-medium">{bts.saturation.toFixed(1)}%</span>
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
        <div className="font-medium text-gray-700">Légende DSM</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-violet-500" />
          <span className="text-gray-700">Territoire DSM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-gray-700">POS Actif</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-violet-500" />
          <span className="text-gray-700">POS Nouveau</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-cyan-500" />
          <span className="text-gray-700">POS Reconduit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-gray-700">POS Suspendu</span>
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
          <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
          <span className="text-gray-700">BTS (contexte)</span>
        </div>
      </div>

      {/* Info badges */}
      <div className="absolute top-3 right-3 z-[1000] space-y-2">
        {geoData.dsm_name && (
          <div className="rounded bg-violet-50 border border-violet-200 px-3 py-2 text-xs shadow-sm">
            <div className="font-medium text-violet-800">DSM: {geoData.dsm_name}</div>
            {geoData.dsm_zone && <div className="text-violet-600">Zone: {geoData.dsm_zone}</div>}
          </div>
        )}
        {geoData.pos?.length > 0 && (
          <div className="rounded bg-white/95 border border-gray-200 px-3 py-2 text-xs shadow-sm">
            POS: {geoData.pos.length}
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
