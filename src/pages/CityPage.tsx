import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITY_BY_ID } from '../data/cities';
import { POLLUTANTS, aqiLevel, dominantPollutant, formatValue, pollutantLevel, pollutantShare } from '../lib/aqi';
import { fmtDayTime, fmtFull } from '../lib/format';
import { AqiAreaChart } from '../components/HourlyChart';
import FavButton from '../components/FavButton';
import Legend from '../components/Legend';

/** Кругова шкала AQI */
function Gauge({ aqi }: { aqi: number }) {
  const ok = Number.isFinite(aqi);
  const lvl = aqiLevel(aqi);
  const share = ok ? Math.min(1, aqi / 120) : 0;
  const R = 52, C = 2 * Math.PI * R, arc = C * 0.75;
  return (
    <div className="gauge" role="img" aria-label={ok ? `AQI ${Math.round(aqi)}, ${lvl.label}` : 'Немає даних'}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} className="gauge-bg" strokeDasharray={`${arc} ${C}`} transform="rotate(135 60 60)" />
        <circle cx="60" cy="60" r={R} className="gauge-fg" stroke={lvl.color} strokeDasharray={`${arc * share} ${C}`} transform="rotate(135 60 60)" />
      </svg>
      <div className="gauge-val">
        <b>{ok ? Math.round(aqi) : '—'}</b>
        <span>European AQI</span>
      </div>
    </div>
  );
}

export default function CityPage() {
  const { id = '' } = useParams();
  const { snapshot, settings } = useApp();
  const city = CITY_BY_ID[id];
  if (!city) {
    return <div className="card empty-page"><h1>Місто не знайдено</h1><Link to="/" className="btn">На головну</Link></div>;
  }
  const d = snapshot?.cities[id];
  if (!d) return <div className="loading" aria-busy="true"><div className="spinner" /> Завантаження…</div>;

  const cur = d.current;
  const lvl = aqiLevel(cur.aqi);
  const dom = dominantPollutant(cur);
  const now = Date.now();
  const future = d.hourly.filter((p) => new Date(p.time).getTime() > now);
  const peak = future.reduce<typeof future[number] | null>((m, p) => (!m || p.aqi > m.aqi ? p : m), null);
  const minF = future.reduce<typeof future[number] | null>((m, p) => (!m || p.aqi < m.aqi ? p : m), null);
  const overHours = future.filter((p) => p.aqi >= settings.threshold).length;

  return (
    <>
      <nav className="crumbs" aria-label="Навігаційний ланцюжок"><Link to="/">Карта</Link> / <span>{city.name}</span></nav>

      <section className="city-head card" style={{ ['--lvl' as string]: lvl.color }}>
        <Gauge aqi={cur.aqi} />
        <div className="city-head-text">
          <div className="city-title">
            <h1>{city.name}</h1>
            <FavButton id={city.id} name={city.name} withText />
          </div>
          <p className="muted">{city.region} · дані на {fmtFull(cur.time)}</p>
          <p className="level-tag" style={{ background: lvl.color, color: lvl.ink }}>Якість повітря: {lvl.label.toLowerCase()}</p>
          <p>{lvl.advice}</p>
          <p className="muted"><b>Чутливим групам:</b> {lvl.sensitiveAdvice}</p>
          {dom && <p className="muted">Головний забруднювач зараз: <b>{POLLUTANTS.find((p) => p.key === dom)?.label}</b></p>}
          <div className="actions">
            <Link className="btn" to={`/compare?c=${city.id}`}>Порівняти з іншими</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="poll-h">
        <h2 id="poll-h">Забруднювачі</h2>
        <div className="poll-grid">
          {POLLUTANTS.map((p) => {
            const v = cur[p.key];
            const pl = pollutantLevel(p.key, v);
            return (
              <article key={p.key} className={`card poll ${dom === p.key ? 'poll-dom' : ''}`}>
                <header>
                  <b>{p.label}</b>
                  <span className="muted small">{p.name}</span>
                </header>
                <p className="poll-val">{formatValue(v)} <span className="muted small">{p.unit}</span></p>
                {pl ? (
                  <>
                    <div className="bar" aria-hidden="true"><span style={{ width: `${Math.max(4, pollutantShare(p.key, v) * 100)}%`, background: pl.color }} /></div>
                    <p className="small">{pl.label}</p>
                  </>
                ) : (
                  <p className="small muted">Не входить до індексу AQI</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="card" aria-labelledby="chart-h">
        <div className="card-head">
          <h2 id="chart-h">AQI: минулі 24 год і прогноз на 48 год</h2>
          <Legend compact />
        </div>
        <AqiAreaChart points={d.hourly} threshold={settings.threshold} />
        <div className="forecast-facts">
          {peak && <p><span className="muted">Максимум у прогнозі</span><b>{Math.round(peak.aqi)}</b><span className="small">{fmtDayTime(peak.time)}</span></p>}
          {minF && <p><span className="muted">Найчистіше повітря</span><b>{Math.round(minF.aqi)}</b><span className="small">{fmtDayTime(minF.time)}</span></p>}
          <p><span className="muted">Годин понад поріг {settings.threshold}</span><b>{overHours}</b><span className="small">з {future.length} у прогнозі</span></p>
        </div>
      </section>
    </>
  );
}
