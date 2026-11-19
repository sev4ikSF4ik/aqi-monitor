import type { City, CityData, HourPoint, Reading, Snapshot } from '../types';

/** Детермінований псевдовипадковий шум [0, 1) за рядком-ключем (FNV-1a + xorshift) */
export function noise(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
  return ((h >>> 0) % 100000) / 100000;
}

/** Обчислення European AQI з концентрацій (максимум субіндексів, лінійна інтерполяція) */
export function computeAqi(pm2_5: number, pm10: number, no2: number, o3: number): number {
  const sub = (v: number, b: number[]) => {
    const bands = [0, ...b];
    for (let i = 1; i < bands.length; i++) {
      if (v <= bands[i]) return 20 * (i - 1) + (20 * (v - bands[i - 1])) / (bands[i] - bands[i - 1]);
    }
    return 100 + (v - bands[bands.length - 1]) / 5;
  };
  return Math.round(Math.max(sub(pm2_5, [10, 20, 25, 50, 75]), sub(pm10, [20, 40, 50, 100, 150]), sub(no2, [40, 90, 120, 230, 340]), sub(o3, [50, 100, 130, 240, 380])));
}

function hourValues(city: City, t: Date): Omit<HourPoint, 'time' | 'aqi'> & { so2: number; co: number } {
  const hour = t.getHours() + t.getMinutes() / 60;
  const dayKey = `${city.id}-${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
  const size = Math.log10(city.population) / Math.log10(3000);              // 0.6 … 1.0
  const dayFactor = 0.7 + 0.8 * noise(dayKey);                              // «погода» дня
  const rush = Math.exp(-((hour - 8.5) ** 2) / 4) + 0.8 * Math.exp(-((hour - 19) ** 2) / 5);
  const n = noise(`${city.id}-${t.toISOString().slice(0, 13)}`);
  const pm2_5 = Math.max(2, (6 + 14 * size) * dayFactor * (0.75 + 0.6 * rush) * (0.85 + 0.3 * n));
  const pm10 = pm2_5 * (1.5 + 0.4 * noise(dayKey + 'pm10'));
  const no2 = Math.max(3, (10 + 30 * size) * (0.6 + 0.9 * rush) * (0.85 + 0.3 * n));
  const sun = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI));
  const o3 = Math.max(5, (35 + 45 * sun) * (1.1 - 0.3 * size) * (0.9 + 0.2 * n));
  const so2 = Math.max(1, (3 + 9 * size) * dayFactor * (0.8 + 0.4 * n));
  const co = Math.max(120, (180 + 260 * size) * (0.7 + 0.7 * rush) * (0.9 + 0.2 * n));
  return { pm2_5, pm10, no2, o3, so2, co };
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Дані одного міста: 24 год назад + 48 год прогнозу, поточна година */
export function demoCity(city: City, now: Date = new Date()): CityData {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() - 24);
  const hourly: HourPoint[] = [];
  for (let i = 0; i < 72; i++) {
    const t = new Date(start.getTime() + i * 3600_000);
    const v = hourValues(city, t);
    hourly.push({ time: t.toISOString(), aqi: computeAqi(v.pm2_5, v.pm10, v.no2, v.o3), pm2_5: round1(v.pm2_5), pm10: round1(v.pm10), no2: round1(v.no2), o3: round1(v.o3) });
  }
  const cur = hourValues(city, now);
  const current: Reading = {
    time: now.toISOString(),
    aqi: computeAqi(cur.pm2_5, cur.pm10, cur.no2, cur.o3),
    pm2_5: round1(cur.pm2_5), pm10: round1(cur.pm10), no2: round1(cur.no2), o3: round1(cur.o3), so2: round1(cur.so2), co: Math.round(cur.co),
  };
  return { city, current, hourly };
}

export function demoSnapshot(cities: City[], now: Date = new Date()): Snapshot {
  return {
    source: 'demo',
    fetchedAt: now.toISOString(),
    cities: Object.fromEntries(cities.map((c) => [c.id, demoCity(c, now)])),
  };
}
