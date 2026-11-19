import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AqiMap from '../components/AqiMap';
import AqiBadge from '../components/AqiBadge';
import FavButton from '../components/FavButton';
import Legend from '../components/Legend';
import { aqiLevel } from '../lib/aqi';
import type { CityData } from '../types';

type Sort = 'aqi-desc' | 'aqi-asc' | 'name';

export default function HomePage() {
  const { snapshot, loading, isFavorite } = useApp();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('aqi-desc');
  const [onlyFav, setOnlyFav] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const all = useMemo(() => (snapshot ? Object.values(snapshot.cities) : []), [snapshot]);
  const valid = all.filter((d) => Number.isFinite(d.current.aqi));

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res = all.filter((d) => (!q || d.city.name.toLowerCase().includes(q) || d.city.region.toLowerCase().includes(q)) && (!onlyFav || isFavorite(d.city.id)));
    const key = (d: CityData) => (Number.isFinite(d.current.aqi) ? d.current.aqi : -1);
    if (sort === 'name') res.sort((a, b) => a.city.name.localeCompare(b.city.name, 'uk'));
    else res.sort((a, b) => (sort === 'aqi-desc' ? key(b) - key(a) : key(a) - key(b)));
    return res;
  }, [all, query, sort, onlyFav, isFavorite]);

  if (!snapshot) {
    return <div className="loading" aria-busy="true"><div className="spinner" /> {loading ? 'Завантаження даних…' : 'Немає даних'}</div>;
  }

  const avg = valid.length ? Math.round(valid.reduce((s, d) => s + d.current.aqi, 0) / valid.length) : NaN;
  const sorted = [...valid].sort((a, b) => a.current.aqi - b.current.aqi);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <>
      <section className="hero">
        <div>
          <h1>Якість повітря в містах України</h1>
          <p className="lead">Європейський індекс AQI для {all.length} міст: поточні значення, прогноз на 48 годин і сповіщення про перевищення.</p>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Середній AQI</span>
            <AqiBadge aqi={avg} size="lg" />
            <span className="stat-sub">{Number.isFinite(avg) ? aqiLevel(avg).label : '—'}</span>
          </div>
          {best && (
            <Link to={`/city/${best.city.id}`} className="stat">
              <span className="stat-label">Найчистіше</span>
              <AqiBadge aqi={best.current.aqi} size="lg" />
              <span className="stat-sub">{best.city.name}</span>
            </Link>
          )}
          {worst && (
            <Link to={`/city/${worst.city.id}`} className="stat">
              <span className="stat-label">Найбрудніше</span>
              <AqiBadge aqi={worst.current.aqi} size="lg" />
              <span className="stat-sub">{worst.city.name}</span>
            </Link>
          )}
        </div>
      </section>

      <section className="home-grid">
        <div className="card map-card">
          <AqiMap data={all} highlight={hover} onHover={setHover} />
          <Legend compact />
        </div>

        <div className="card list-card">
          <div className="list-tools">
            <label className="search">
              <span className="sr-only">Пошук міста</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              <input type="search" placeholder="Пошук міста або області" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="tools-row">
              <label className="select">
                <span className="sr-only">Сортування</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="aqi-desc">Спершу забруднені</option>
                  <option value="aqi-asc">Спершу чисті</option>
                  <option value="name">За назвою</option>
                </select>
              </label>
              <label className="check">
                <input type="checkbox" checked={onlyFav} onChange={(e) => setOnlyFav(e.target.checked)} /> Лише обрані
              </label>
            </div>
          </div>
          <ul className="city-list" aria-live="polite">
            {list.length === 0 && <li className="empty">Нічого не знайдено</li>}
            {list.map((d) => {
              const ok = Number.isFinite(d.current.aqi);
              return (
                <li key={d.city.id} onMouseEnter={() => setHover(d.city.id)} onMouseLeave={() => setHover(null)} className={hover === d.city.id ? 'hot' : ''}>
                  <Link to={`/city/${d.city.id}`} className="city-row">
                    <AqiBadge aqi={d.current.aqi} />
                    <span className="city-name">
                      <b>{d.city.name}</b>
                      <span className="muted small">{d.city.region}</span>
                    </span>
                    <span className="city-lvl">{ok ? aqiLevel(d.current.aqi).label : 'немає даних'}</span>
                  </Link>
                  <FavButton id={d.city.id} name={d.city.name} />
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
