/** Місто, для якого відображаються дані */
export interface City {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  /** приблизне населення, тис. — використовується в демо-генераторі */
  population: number;
}

/** Ключі забруднювачів, які показує застосунок */
export type PollutantKey = 'pm2_5' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co';

/** Поточні показники в місті */
export interface Reading {
  time: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
}

/** Точка погодинного ряду (минулі 24 год + прогноз) */
export interface HourPoint {
  time: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
}

export interface CityData {
  city: City;
  current: Reading;
  hourly: HourPoint[];
}

export type DataSource = 'live' | 'demo';

/** Знімок даних для всіх міст */
export interface Snapshot {
  source: DataSource;
  fetchedAt: string;
  cities: Record<string, CityData>;
}

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  threshold: number;
  notifications: boolean;
  forceDemo: boolean;
  theme: Theme;
}
