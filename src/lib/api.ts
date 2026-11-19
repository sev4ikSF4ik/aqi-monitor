import type { City, CityData, HourPoint, Snapshot } from '../types';
import { demoSnapshot } from './demo';

/** Open-Meteo Air Quality API — безкоштовний, без ключа (дані моделі CAMS Europe) */
export const API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
export const REQUEST_TIMEOUT_MS = 8000;

const CURRENT = 'european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide';
const HOURLY = 'european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone';

interface ApiLocation {
  current?: Record<string, number | string | null>;
  hourly?: Record<string, (number | string | null)[]>;
}

export function buildUrl(cities: City[]): string {
  const p = new URLSearchParams({
    latitude: cities.map((c) => c.lat.toFixed(4)).join(','),
    longitude: cities.map((c) => c.lon.toFixed(4)).join(','),
    current: CURRENT,
    hourly: HOURLY,
    past_days: '1',
    forecast_days: '3',
    timezone: 'Europe/Kyiv',
    timeformat: 'unixtime',
  });
  return `${API_URL}?${p.toString()}`;
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
const iso = (v: unknown): string => new Date(num(v) * 1000).toISOString();

/** Залишає вікно «24 год назад … 48 год уперед» відносно now */
export function trimWindow(points: HourPoint[], now: number = Date.now()): HourPoint[] {
  return points.filter((p) => {
    const t = new Date(p.time).getTime();
    return t >= now - 24 * 3600_000 && t <= now + 48 * 3600_000;
  });
}

/** Перетворення відповіді API для одного міста у внутрішній формат */
export function parseLocation(city: City, loc: ApiLocation, now?: number): CityData {
  const c = loc.current ?? {};
  const h = loc.hourly ?? {};
  const times = h.time ?? [];
  const hourly: HourPoint[] = times.map((t, i) => ({
    time: iso(t),
    aqi: num(h.european_aqi?.[i]),
    pm2_5: num(h.pm2_5?.[i]),
    pm10: num(h.pm10?.[i]),
    no2: num(h.nitrogen_dioxide?.[i]),
    o3: num(h.ozone?.[i]),
  })).filter((p) => Number.isFinite(p.aqi));
  const trimmed = now === undefined ? hourly : trimWindow(hourly, now);
  return {
    city,
    current: {
      time: iso(c.time),
      aqi: num(c.european_aqi),
      pm2_5: num(c.pm2_5),
      pm10: num(c.pm10),
      no2: num(c.nitrogen_dioxide),
      o3: num(c.ozone),
      so2: num(c.sulphur_dioxide),
      co: num(c.carbon_monoxide),
    },
    hourly: trimmed,
  };
}

/** Завантаження даних для всіх міст одним запитом; кидає помилку, якщо API недоступне */
export async function fetchLive(cities: City[], signal?: AbortSignal): Promise<Snapshot> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(buildUrl(cities), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as ApiLocation | ApiLocation[];
    const list = Array.isArray(body) ? body : [body];
    if (list.length !== cities.length) throw new Error('Неочікувана кількість локацій у відповіді');
    const now = Date.now();
    const data = Object.fromEntries(cities.map((c, i) => [c.id, parseLocation(c, list[i], now)]));
    if (!Object.values(data).some((d) => Number.isFinite(d.current.aqi))) throw new Error('Порожні дані');
    return { source: 'live', fetchedAt: new Date().toISOString(), cities: data };
  } finally {
    clearTimeout(timer);
  }
}

/** Живі дані з автоматичним переходом у демо-режим */
export async function loadSnapshot(cities: City[], forceDemo: boolean): Promise<{ snapshot: Snapshot; error?: string }> {
  if (forceDemo) return { snapshot: demoSnapshot(cities) };
  try {
    return { snapshot: await fetchLive(cities) };
  } catch (e) {
    const msg = e instanceof Error ? (e.name === 'AbortError' ? 'перевищено час очікування' : e.message) : String(e);
    return { snapshot: demoSnapshot(cities), error: msg };
  }
}
