import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { CityData } from '../types';
import { aqiLevel } from '../lib/aqi';

interface Props {
  data: CityData[];
  highlight?: string | null;
  onHover?: (id: string | null) => void;
}

/** Карта України з кольоровими маркерами AQI */
export default function AqiMap({ data, highlight, onHover }: Props) {
  const navigate = useNavigate();
  return (
    <div className="map-wrap">
      <MapContainer bounds={[[46.2, 22.0], [51.8, 36.6]]} boundsOptions={{ padding: [18, 18] }} zoomSnap={0.25} minZoom={4.5} maxZoom={11} scrollWheelZoom={false} className="map" aria-label="Карта якості повітря">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {data.map((d) => {
          const ok = Number.isFinite(d.current.aqi);
          const lvl = aqiLevel(d.current.aqi);
          const hot = highlight === d.city.id;
          return (
            <CircleMarker
              key={d.city.id}
              center={[d.city.lat, d.city.lon]}
              radius={hot ? 15 : 10 + Math.min(4, d.city.population / 700)}
              pathOptions={{ color: hot ? '#111' : '#ffffff', weight: hot ? 3 : 2, fillColor: ok ? lvl.color : '#999', fillOpacity: 0.92 }}
              eventHandlers={{
                click: () => navigate(`/city/${d.city.id}`),
                mouseover: () => onHover?.(d.city.id),
                mouseout: () => onHover?.(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <b>{d.city.name}</b>: AQI {ok ? Math.round(d.current.aqi) : '—'} · {ok ? lvl.label.toLowerCase() : 'немає даних'}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
