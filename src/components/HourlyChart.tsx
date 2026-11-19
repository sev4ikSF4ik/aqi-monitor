import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend as RLegend } from 'recharts';
import type { HourPoint } from '../types';
import { AQI_LEVELS } from '../lib/aqi';
import { fmtDayTime, fmtTime } from '../lib/format';

const BANDS = [0, 20, 40, 60, 80, 100, 140];

function nowIndexTime(points: { time: string }[]): string | undefined {
  const now = Date.now();
  let best: string | undefined;
  let d = Infinity;
  for (const p of points) {
    const x = Math.abs(new Date(p.time).getTime() - now);
    if (x < d) { d = x; best = p.time; }
  }
  return best;
}

/** Погодинний AQI одного міста: фонові смуги рівнів, лінія «зараз» і поріг */
export function AqiAreaChart({ points, threshold }: { points: HourPoint[]; threshold?: number }) {
  const nowT = nowIndexTime(points);
  const max = Math.max(60, ...points.map((p) => p.aqi)) + 10;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={points} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        {BANDS.slice(0, -1).map((b, i) => (
          <ReferenceArea key={b} y1={b} y2={Math.min(BANDS[i + 1], max)} fill={AQI_LEVELS[i].color} fillOpacity={0.13} ifOverflow="hidden" />
        ))}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis dataKey="time" tickFormatter={fmtTime} minTickGap={36} stroke="var(--muted)" fontSize={12} />
        <YAxis domain={[0, max]} stroke="var(--muted)" fontSize={12} allowDecimals={false} />
        <Tooltip labelFormatter={(t) => fmtDayTime(String(t))} formatter={(v) => [Math.round(Number(v)), 'AQI']} contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10 }} />
        {threshold !== undefined && <ReferenceLine y={threshold} stroke="var(--danger)" strokeDasharray="6 4" label={{ value: `поріг ${threshold}`, position: 'insideTopRight', fill: 'var(--danger)', fontSize: 12 }} />}
        {nowT && <ReferenceLine x={nowT} stroke="var(--text)" strokeWidth={1.5} label={{ value: 'зараз', position: 'insideTopLeft', fill: 'var(--text)', fontSize: 12 }} />}
        <Area type="monotone" dataKey="aqi" stroke="var(--accent)" strokeWidth={2.5} fill="var(--accent)" fillOpacity={0.18} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export interface Series { id: string; name: string; color: string; points: HourPoint[] }

/** Порівняння погодинного AQI кількох міст */
export function CompareChart({ series, metric }: { series: Series[]; metric: keyof Omit<HourPoint, 'time'> }) {
  const base = series[0]?.points ?? [];
  const rows = base.map((p, i) => {
    const r: Record<string, number | string> = { time: p.time };
    for (const s of series) r[s.id] = s.points[i]?.[metric] ?? NaN;
    return r;
  });
  const nowT = nowIndexTime(base);
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
        <XAxis dataKey="time" tickFormatter={fmtTime} minTickGap={36} stroke="var(--muted)" fontSize={12} />
        <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
        <Tooltip labelFormatter={(t) => fmtDayTime(String(t))} formatter={(v, n) => [Math.round(Number(v) * 10) / 10, series.find((s) => s.id === n)?.name ?? n]} contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10 }} />
        <RLegend formatter={(v) => series.find((s) => s.id === v)?.name ?? v} />
        {nowT && <ReferenceLine x={nowT} stroke="var(--text)" strokeWidth={1.5} label={{ value: 'зараз', position: 'insideTopLeft', fill: 'var(--text)', fontSize: 12 }} />}
        {series.map((s) => (
          <Line key={s.id} type="monotone" dataKey={s.id} stroke={s.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
