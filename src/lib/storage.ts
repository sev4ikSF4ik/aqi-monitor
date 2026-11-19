import type { Settings } from '../types';

const KEY_FAV = 'aqi.favorites';
const KEY_SET = 'aqi.settings';
const KEY_NOTIFIED = 'aqi.notified';

export const DEFAULT_SETTINGS: Settings = { threshold: 60, notifications: false, forceDemo: false, theme: 'system' };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* сховище недоступне (приватний режим) — працюємо без збереження */
  }
}

export const loadFavorites = (): string[] => {
  const v = read<unknown>(KEY_FAV, ['kyiv']);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : ['kyiv'];
};
export const saveFavorites = (ids: string[]) => write(KEY_FAV, ids);

export const loadSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEY_SET, {}) });
export const saveSettings = (s: Settings) => write(KEY_SET, s);

/** Сповіщення про місто надсилається не частіше одного разу на 3 години */
export function shouldNotify(cityId: string, now = Date.now()): boolean {
  const log = read<Record<string, number>>(KEY_NOTIFIED, {});
  return !log[cityId] || now - log[cityId] > 3 * 3600_000;
}
export function markNotified(cityId: string, now = Date.now()): void {
  const log = read<Record<string, number>>(KEY_NOTIFIED, {});
  log[cityId] = now;
  write(KEY_NOTIFIED, log);
}
