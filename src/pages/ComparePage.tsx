import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITIES, CITY_BY_ID } from '../data/cities';
import { POLLUTANTS, formatValue, pollutantLevel } from '../lib/aqi';
import { CompareChart, type Series } from '../components/HourlyChart';
import AqiBadge from '../components/AqiBadge';
import type { HourPoint } from '../types';

const COLORS = ['#2f6fdb', '#e8590c', '#7b2cbf'];
const MAX = 3;
type Metric = keyof Omit<HourPoint, 'time'>;
const METRICS: { key: Metric; label: string }[] = [
  { key: 'aqi', label: 'AQI' }, { key: 'pm2_5', label: 'PM2.5' }, { key: 'pm10', label: 'PM10' }, { key: 'no2', label: 'NO₂' }, { key: 'o3', label: 'O₃' },
];

export default function ComparePage() {
  const { snapshot, favorites } = useApp();
  const [params, setParams] = useSearchParams();
  const [metric, setMetric] = useState<Metric>('aqi');

  const selected = useMemo(() => {
    const fromUrl = (params.get('c') ?? '').split(',').filter((x) => CITY_BY_ID[x]);
    const base = fromUrl.length ? fromUrl : favorites.filter((x) => CITY_BY_ID[x]);
    const ids = [...new Set(base.length ? base : ['kyiv', 'lviv'])];
    if (ids.length === 1) ids.push(ids[0] === 'kyiv' ? 'lviv' : 'kyiv');
    return ids.slice(0, MAX);
  }, [params, favorites]);

  const setSelected = (ids: string[]) => setParams({ c: ids.join(',') }, { replace: true });
  const toggle = (id: string) => {
    if (selected.includes(id)) { if (selected.length > 1) setSelected(selected.filter((x) => x !== id)); }
    else if (selected.length < MAX) setSelected([...selected, id]);
  };

  const series: Series[] = selected
    .map((id, i) => ({ id, name: CITY_BY_ID[id].name, color: COLORS[i], points: snapshot?.cities[id]?.hourly ?? [] }))
    .filter((s) => s.points.length > 0);

  return (
    <>
      <h1>Порівняння міст</h1>
      <p className="lead">Оберіть до трьох міст, щоб порівняти поточні показники та погодинну динаміку.</p>

      <section className="card">
        <h2 className="h3">Міста <span className="muted small">({selected.length}/{MAX})</span></h2>
        <div className="chips" role="group" aria-label="Вибір міст">
          {CITIES.map((c) => {
            const i = selected.indexOf(c.id);
            const on = i >= 0;
            return (
              <button key={c.id} className={`chip ${on ? 'chip-on' : ''}`} aria-pressed={on} disabled={!on && selected.length >= MAX}
                style={on ? { borderColor: COLORS[i], background: `color-mix(in srgb, ${COLORS[i]} 14%, transparent)` } : undefined} onClick={() => toggle(c.id)}>
                {on && <span className="chip-dot" style={{ background: COLORS[i] }} />}{c.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="h3">Динаміка</h2>
          <div className="seg" role="radiogroup" aria-label="Показник">
            {METRICS.map((m) => (
              <button key={m.key} role="radio" aria-checked={metric === m.key} className={metric === m.key ? 'on' : ''} onClick={() => setMetric(m.key)}>{m.label}</button>
            ))}
          </div>
        </div>
        {series.length ? <CompareChart series={series} metric={metric} /> : <p className="muted">Немає даних</p>}
      </section>

      <section className="card table-card">
        <h2 className="h3">Поточні значення</h2>
        <div className="table-scroll">
          <table className="cmp">
            <thead>
              <tr>
                <th scope="col">Показник</th>
                {selected.map((id, i) => <th key={id} scope="col"><span className="chip-dot" style={{ background: COLORS[i] }} /><Link to={`/city/${id}`}>{CITY_BY_ID[id].name}</Link></th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">AQI</th>
                {selected.map((id) => <td key={id}><AqiBadge aqi={snapshot?.cities[id]?.current.aqi ?? NaN} showLabel /></td>)}
              </tr>
              {POLLUTANTS.map((p) => {
                const vals = selected.map((id) => snapshot?.cities[id]?.current[p.key] ?? NaN);
                const worst = Math.max(...vals.filter(Number.isFinite));
                return (
                  <tr key={p.key}>
                    <th scope="row">{p.label} <span className="muted small">{p.unit}</span></th>
                    {vals.map((v, i) => {
                      const pl = pollutantLevel(p.key, v);
                      return (
                        <td key={selected[i]} className={selected.length > 1 && v === worst ? 'worst' : ''}>
                          {pl && <span className="dot" style={{ background: pl.color }} aria-hidden="true" />}{formatValue(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="muted small">Жирним виділено найвище значення серед обраних міст.</p>
      </section>
    </>
  );
}
