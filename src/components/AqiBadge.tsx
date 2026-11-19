import { aqiLevel } from '../lib/aqi';

interface Props {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/** Кольоровий значок значення AQI */
export default function AqiBadge({ aqi, size = 'md', showLabel = false }: Props) {
  const ok = Number.isFinite(aqi);
  const lvl = aqiLevel(aqi);
  return (
    <span className={`badge badge-${size}`} style={{ background: ok ? lvl.color : 'var(--line)', color: ok ? lvl.ink : 'var(--muted)' }} title={ok ? `AQI ${Math.round(aqi)} — ${lvl.label}` : 'Немає даних'}>
      <b>{ok ? Math.round(aqi) : '—'}</b>
      {showLabel && ok && <span>{lvl.label}</span>}
    </span>
  );
}
