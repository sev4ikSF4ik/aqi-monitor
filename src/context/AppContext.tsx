import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CityData, Settings, Snapshot } from '../types';
import { CITIES } from '../data/cities';
import { loadSnapshot } from '../lib/api';
import { aqiLevel } from '../lib/aqi';
import { loadFavorites, loadSettings, markNotified, saveFavorites, saveSettings, shouldNotify } from '../lib/storage';

const REFRESH_MS = 15 * 60_000;

interface AppState {
  snapshot: Snapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  /** обрані міста, де AQI перевищує поріг користувача */
  alerts: CityData[];
  dismissedAlerts: boolean;
  dismissAlerts: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [dismissedAlerts, setDismissed] = useState(false);
  const reqId = useRef(0);

  const refresh = useCallback(() => {
    const id = ++reqId.current;
    setLoading(true);
    loadSnapshot(CITIES, settings.forceDemo).then(({ snapshot: s, error: e }) => {
      if (id !== reqId.current) return;             // відповідь застарілого запиту ігнорується
      setSnapshot(s);
      setError(e ?? null);
      setLoading(false);
      setDismissed(false);
    });
  }, [settings.forceDemo]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [refresh]);

  // тема оформлення
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const alerts = useMemo(() => {
    if (!snapshot) return [];
    return favorites
      .map((id) => snapshot.cities[id])
      .filter((d): d is CityData => !!d && Number.isFinite(d.current.aqi) && d.current.aqi >= settings.threshold)
      .sort((a, b) => b.current.aqi - a.current.aqi);
  }, [snapshot, favorites, settings.threshold]);

  // системні сповіщення браузера (не частіше 1 разу на 3 год для міста)
  useEffect(() => {
    if (!settings.notifications || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    for (const d of alerts) {
      if (!shouldNotify(d.city.id)) continue;
      const lvl = aqiLevel(d.current.aqi);
      try {
        new Notification(`${d.city.name}: якість повітря «${lvl.label.toLowerCase()}»`, {
          body: `AQI ${Math.round(d.current.aqi)} (ваш поріг ${settings.threshold}). ${lvl.advice}`,
          tag: `aqi-${d.city.id}`,
        });
        markNotified(d.city.id);
      } catch {
        /* деякі браузери дозволяють сповіщення лише через Service Worker */
      }
    }
  }, [alerts, settings.notifications, settings.threshold]);

  const value: AppState = {
    snapshot, loading, error, refresh,
    favorites, isFavorite: (id) => favorites.includes(id), toggleFavorite,
    settings, updateSettings,
    alerts, dismissedAlerts, dismissAlerts: () => setDismissed(true),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
