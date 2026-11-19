import { AQI_LEVELS } from '../lib/aqi';

const RANGES = ['0–20', '20–40', '40–60', '60–80', '80–100', '100+'];

/** Шкала European AQI */
export default function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`legend ${compact ? 'legend-compact' : ''}`} aria-label="Шкала якості повітря">
      {AQI_LEVELS.map((l, i) => (
        <li key={l.key}>
          <span className="legend-sw" style={{ background: l.color }} />
          <span>{l.label}</span>
          {!compact && <span className="muted">{RANGES[i]}</span>}
        </li>
      ))}
    </ul>
  );
}
