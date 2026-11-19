import type { PollutantKey } from '../types';

/**
 * Європейський індекс якості повітря (European AQI, EEA).
 * Межі рівнів: 0–20, 20–40, 40–60, 60–80, 80–100, понад 100.
 */
export interface AqiLevel {
  index: number;
  key: 'good' | 'fair' | 'moderate' | 'poor' | 'very-poor' | 'extreme';
  label: string;
  color: string;
  /** колір тексту, читабельний на фоні color */
  ink: string;
  advice: string;
  sensitiveAdvice: string;
}

export const AQI_LEVELS: AqiLevel[] = [
  {
    index: 0, key: 'good', label: 'Добра', color: '#50f0e6', ink: '#073b38',
    advice: 'Чудовий день для прогулянок і спорту на вулиці.',
    sensitiveAdvice: 'Обмежень немає.',
  },
  {
    index: 1, key: 'fair', label: 'Задовільна', color: '#50ccaa', ink: '#06352a',
    advice: 'Повітря прийнятне, можна проводити час надворі.',
    sensitiveAdvice: 'Обмежень немає.',
  },
  {
    index: 2, key: 'moderate', label: 'Помірна', color: '#f0e641', ink: '#3d3800',
    advice: 'Більшості людей можна виходити на вулицю як зазвичай.',
    sensitiveAdvice: 'Людям з астмою та серцевими захворюваннями варто скоротити інтенсивні навантаження надворі.',
  },
  {
    index: 3, key: 'poor', label: 'Погана', color: '#ff5050', ink: '#ffffff',
    advice: 'Зменште тривалі фізичні навантаження на вулиці, провітрюйте коротко.',
    sensitiveAdvice: 'Дітям, літнім людям і людям із хронічними хворобами краще залишатися в приміщенні.',
  },
  {
    index: 4, key: 'very-poor', label: 'Дуже погана', color: '#960032', ink: '#ffffff',
    advice: 'Уникайте фізичних навантажень надворі, зачиніть вікна.',
    sensitiveAdvice: 'Залишайтеся в приміщенні, за наявності — увімкніть очищувач повітря.',
  },
  {
    index: 5, key: 'extreme', label: 'Надзвичайно погана', color: '#7d2181', ink: '#ffffff',
    advice: 'Без нагальної потреби не виходьте на вулицю.',
    sensitiveAdvice: 'Залишайтеся в приміщенні з зачиненими вікнами; за погіршення самопочуття зверніться до лікаря.',
  },
];

const AQI_BOUNDS = [20, 40, 60, 80, 100];

/** Рівень якості повітря за значенням European AQI */
export function aqiLevel(aqi: number): AqiLevel {
  if (!Number.isFinite(aqi) || aqi < 0) return AQI_LEVELS[0];
  const i = AQI_BOUNDS.findIndex((b) => aqi <= b);
  return AQI_LEVELS[i === -1 ? AQI_LEVELS.length - 1 : i];
}

export interface PollutantInfo {
  key: PollutantKey;
  label: string;
  name: string;
  unit: string;
  /** межі рівнів EEA (мкг/м³) для 5 переходів; null — індекс не визначено */
  bounds: number[] | null;
}

export const POLLUTANTS: PollutantInfo[] = [
  { key: 'pm2_5', label: 'PM2.5', name: 'Дрібнодисперсні частки', unit: 'мкг/м³', bounds: [10, 20, 25, 50, 75] },
  { key: 'pm10', label: 'PM10', name: 'Тверді частки', unit: 'мкг/м³', bounds: [20, 40, 50, 100, 150] },
  { key: 'no2', label: 'NO₂', name: 'Діоксид азоту', unit: 'мкг/м³', bounds: [40, 90, 120, 230, 340] },
  { key: 'o3', label: 'O₃', name: 'Озон', unit: 'мкг/м³', bounds: [50, 100, 130, 240, 380] },
  { key: 'so2', label: 'SO₂', name: 'Діоксид сірки', unit: 'мкг/м³', bounds: [100, 200, 350, 500, 750] },
  { key: 'co', label: 'CO', name: 'Чадний газ', unit: 'мкг/м³', bounds: null },
];

/** Рівень окремого забруднювача (null, якщо для нього немає шкали) */
export function pollutantLevel(key: PollutantKey, value: number): AqiLevel | null {
  const p = POLLUTANTS.find((x) => x.key === key);
  if (!p || !p.bounds || !Number.isFinite(value)) return null;
  const i = p.bounds.findIndex((b) => value <= b);
  return AQI_LEVELS[i === -1 ? AQI_LEVELS.length - 1 : i];
}

/** Частка від верхньої межі «доброго» рівня — для смужки на картці */
export function pollutantShare(key: PollutantKey, value: number): number {
  const p = POLLUTANTS.find((x) => x.key === key);
  if (!p || !p.bounds) return 0;
  return Math.max(0, Math.min(1, value / p.bounds[p.bounds.length - 1]));
}

/** Головний забруднювач — той, чий рівень найвищий відносно своєї шкали */
export function dominantPollutant(values: Partial<Record<PollutantKey, number>>): PollutantKey | null {
  let best: PollutantKey | null = null;
  let bestScore = -1;
  for (const p of POLLUTANTS) {
    const v = values[p.key];
    if (!p.bounds || v === undefined) continue;
    const score = v / p.bounds[2];
    if (score > bestScore) {
      bestScore = score;
      best = p.key;
    }
  }
  return best;
}

export function formatValue(v: number): string {
  if (!Number.isFinite(v)) return '—';
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1).replace('.', ',');
}
