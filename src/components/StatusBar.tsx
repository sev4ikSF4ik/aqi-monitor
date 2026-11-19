import { useApp } from '../context/AppContext';
import { ago, fmtFull } from '../lib/format';

/** Підвал: джерело даних, час оновлення, режим роботи */
export default function StatusBar() {
  const { snapshot, loading, error, refresh, settings } = useApp();
  const demo = snapshot?.source === 'demo';
  return (
    <footer className="footer">
      <div className="container footer-in">
        <p className="status">
          {snapshot && <span className={`pill ${demo ? 'pill-warn' : 'pill-ok'}`}>{demo ? 'Демо-режим' : 'Живі дані'}</span>}
          {snapshot && <span title={fmtFull(snapshot.fetchedAt)}>Оновлено {ago(snapshot.fetchedAt)}</span>}
          {demo && !settings.forceDemo && error && <span className="muted">API недоступне ({error}), показано змодельовані дані</span>}
          {demo && settings.forceDemo && <span className="muted">Демо-режим увімкнено в налаштуваннях</span>}
          <button className="link-btn" onClick={refresh} disabled={loading}>{loading ? 'Оновлення…' : 'Оновити'}</button>
        </p>
        <p className="muted small">
          Дані: <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Open-Meteo Air Quality API</a> (модель CAMS Europe, Copernicus).
          Індекс — European AQI (EEA). Карта © <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>.
          STEM-проєкт, Всеволод Ковальчук, ІПЗ-31, КНУ імені Тараса Шевченка.
        </p>
      </div>
    </footer>
  );
}
