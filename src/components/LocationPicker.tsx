import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

export const GAZA_CENTER: [number, number] = [31.42, 34.38];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))) });
  return null;
}

interface Props { lat?: number; lng?: number; onPick: (lat: number, lng: number) => void }

/** Click-to-pick map (OpenStreetMap tiles). Loaded lazily because Leaflet is heavy. */
export default function LocationPicker({ lat, lng, onPick }: Props) {
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);
  return (
    <div className="map-box" style={{ height: 300 }}>
      <MapContainer center={hasPoint ? [lat!, lng!] : GAZA_CENTER} zoom={hasPoint ? 13 : 10} style={{ height: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} />
        {hasPoint && <CircleMarker center={[lat!, lng!]} radius={9} pathOptions={{ color: '#0b63b5', fillOpacity: 0.7 }} />}
      </MapContainer>
    </div>
  );
}
