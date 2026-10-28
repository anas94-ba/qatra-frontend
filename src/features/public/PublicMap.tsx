import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { MapCamp } from '../../api/types';
import { formatLiters } from '../../lib/format';

const GAZA_CENTER: [number, number] = [31.42, 34.38];

/** Confirmed (green) takes priority, then pending (amber), then planned only (blue), else gray */
function colorOf(c: MapCamp): string {
  if (c.confirmedLiters > 0) return '#138a52';
  if (c.pendingLiters > 0) return '#d98a00';
  if (c.plannedLiters > 0) return '#0b63b5';
  return '#8793a3';
}

/** Public map: rounded coordinates, planned vs confirmed vs pending-confirmation per camp */
export default function PublicMap({ camps }: { camps: MapCamp[] }) {
  return (
    <div className="map-box">
      <MapContainer center={GAZA_CENTER} zoom={10} style={{ height: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {camps.map((c) => (
          <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={10} pathOptions={{ color: colorOf(c), fillColor: colorOf(c), fillOpacity: 0.7 }}>
            <Popup>
              <strong>{c.name}</strong>
              <br />{c.region}
              <hr />
              مخطط: {formatLiters(c.plannedLiters)}<br />
              مؤكد: {formatLiters(c.confirmedLiters)}<br />
              قيد التأكيد: {formatLiters(c.pendingLiters)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
