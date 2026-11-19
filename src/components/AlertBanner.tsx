import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aqiLevel } from '../lib/aqi';

/** Банер про перевищення порогу в обраних містах */
export default function AlertBanner() {
  const { alerts, dismissedAlerts, dismissAlerts, settings } = useApp();
  if (alerts.length === 0 || dismissedAlerts) return null;
  const worst = alerts[0];
  const lvl = aqiLevel(worst.current.aqi);
  return (
    <div className="alert" role="alert" style={{ ['--lvl' as string]: lvl.color }}>
      <div className="container alert-in">
        <span className="alert-icon" aria-hidden="true">!</span>
        <p>
          Перевищено ваш поріг AQI {settings.threshold}:{' '}
          {alerts.map((d, i) => (
            <span key={d.city.id}>
              {i > 0 && ', '}
              <Link to={`/city/${d.city.id}`}>{d.city.name}</Link> — {Math.round(d.current.aqi)}
            </span>
          ))}
          . {lvl.advice}
        </p>
        <button className="link-btn" onClick={dismissAlerts}>Закрити</button>
      </div>
    </div>
  );
}
