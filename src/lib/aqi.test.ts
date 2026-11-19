import { describe, expect, it } from 'vitest';
import { aqiLevel, dominantPollutant, formatValue, pollutantLevel } from './aqi';
import { computeAqi, demoCity, demoSnapshot, noise } from './demo';
import { buildUrl, parseLocation, trimWindow } from './api';
import { CITIES, CITY_BY_ID } from '../data/cities';

describe('aqiLevel', () => {
  it('maps European AQI bounds to levels', () => {
    expect(aqiLevel(0).key).toBe('good');
    expect(aqiLevel(20).key).toBe('good');
    expect(aqiLevel(20.1).key).toBe('fair');
    expect(aqiLevel(55).key).toBe('moderate');
    expect(aqiLevel(80).key).toBe('poor');
    expect(aqiLevel(99).key).toBe('very-poor');
    expect(aqiLevel(150).key).toBe('extreme');
  });
  it('treats invalid values as the first level', () => {
    expect(aqiLevel(NaN).key).toBe('good');
    expect(aqiLevel(-5).key).toBe('good');
  });
});

describe('pollutants', () => {
  it('uses EEA bands per pollutant', () => {
    expect(pollutantLevel('pm2_5', 8)?.key).toBe('good');
    expect(pollutantLevel('pm2_5', 30)?.key).toBe('poor');
    expect(pollutantLevel('no2', 300)?.key).toBe('very-poor');
    expect(pollutantLevel('co', 500)).toBeNull();
  });
  it('finds the dominant pollutant', () => {
    expect(dominantPollutant({ pm2_5: 40, pm10: 30, no2: 20, o3: 40 })).toBe('pm2_5');
    expect(dominantPollutant({ pm2_5: 5, pm10: 10, no2: 150, o3: 40 })).toBe('no2');
  });
  it('formats numbers the Ukrainian way', () => {
    expect(formatValue(12.34)).toBe('12,3');
    expect(formatValue(412.6)).toBe('413');
    expect(formatValue(NaN)).toBe('—');
  });
});

describe('demo data', () => {
  it('noise is deterministic and in [0, 1)', () => {
    expect(noise('kyiv')).toBe(noise('kyiv'));
    for (const k of ['a', 'b', 'lviv-2026', 'x'.repeat(50)]) {
      const v = noise(k);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
  it('computeAqi is the max of sub-indices', () => {
    expect(computeAqi(10, 0, 0, 0)).toBe(20);
    expect(computeAqi(0, 0, 0, 100)).toBe(40);
    expect(computeAqi(75, 0, 0, 0)).toBe(100);
  });
  it('generates 72 hourly points and a current reading for each city', () => {
    const now = new Date('2026-11-19T12:30:00Z');
    const d = demoCity(CITY_BY_ID.kyiv, now);
    expect(d.hourly).toHaveLength(72);
    expect(d.current.aqi).toBeGreaterThan(0);
    expect(demoCity(CITY_BY_ID.kyiv, now)).toEqual(d);
    const s = demoSnapshot(CITIES, now);
    expect(s.source).toBe('demo');
    expect(Object.keys(s.cities)).toHaveLength(CITIES.length);
  });
});

describe('api helpers', () => {
  it('builds one request for all cities', () => {
    const url = new URL(buildUrl(CITIES.slice(0, 2)));
    expect(url.searchParams.get('latitude')).toBe('50.4501,49.9935');
    expect(url.searchParams.get('current')).toContain('european_aqi');
    expect(url.searchParams.get('past_days')).toBe('1');
  });
  it('trims hourly data to the 24h back / 48h ahead window', () => {
    const now = Date.parse('2026-11-19T12:00:00Z');
    const pts = [-30, -24, 0, 47, 48, 60].map((h) => ({ time: new Date(now + h * 3600_000).toISOString(), aqi: 10, pm2_5: 1, pm10: 1, no2: 1, o3: 1 }));
    expect(trimWindow(pts, now).map((p) => (Date.parse(p.time) - now) / 3600_000)).toEqual([-24, 0, 47, 48]);
  });
  it('parses an API location and drops empty hours', () => {
    const d = parseLocation(CITY_BY_ID.lviv, {
      current: { time: 1795089600, european_aqi: 33, pm2_5: 12.1, pm10: 18, nitrogen_dioxide: 20, ozone: 41, sulphur_dioxide: 3, carbon_monoxide: 210 },
      hourly: { time: [1795086000, 1795089600], european_aqi: [30, null], pm2_5: [11, 12], pm10: [17, 18], nitrogen_dioxide: [19, 20], ozone: [40, 41] },
    });
    expect(d.current.aqi).toBe(33);
    expect(d.current.co).toBe(210);
    expect(d.hourly).toHaveLength(1);
    expect(d.hourly[0].time).toBe(new Date(1795086000 * 1000).toISOString());
  });
});
