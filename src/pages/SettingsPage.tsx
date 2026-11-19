import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CITY_BY_ID } from '../data/cities';
import { AQI_LEVELS, aqiLevel } from '../lib/aqi';
import AqiBadge from '../components/AqiBadge';
import FavButton from '../components/FavButton';
import type { Theme } from '../types';

const PRESETS = [40, 60, 80];

export default function SettingsPage() {
  const { settings, updateSettings, favorites, snapshot, alerts } = useApp();
  const supported = typeof Notification !== 'undefined';
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(supported ? Notification.permission : 'unsupported');
  const lvl = aqiLevel(settings.threshold);

  async function toggleNotifications(on: boolean) {
    if (!on) { updateSettings({ notifications: false }); return; }
    if (!supported) return;
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    setPerm(p);
    updateSettings({ notifications: p === 'granted' });
  }

  return (
    <>
      <h1>Сповіщення та налаштування</h1>
      <p className="lead">Застосунок стежить за обраними містами й попереджає, коли AQI досягає вашого порогу.</p>

      <div className="settings-grid">
        <section className="card">
          <h2 className="h3">Поріг сповіщення</h2>
          <div className="threshold">
            <AqiBadge aqi={settings.threshold} size="lg" />
            <div>
              <p><b>AQI ≥ {settings.threshold}</b> — рівень «{lvl.label.toLowerCase()}»</p>
              <p className="muted small">Рекомендовано 40 для чутливих людей, 60 — для більшості.</p>
            </div>
          </div>
          <label className="range">
            <span className="sr-only">Поріг AQI</span>
            <input type="range" min={20} max={100} step={5} value={settings.threshold} onChange={(e) => updateSettings({ threshold: Number(e.target.value) })}
              style={{ ['--track' as string]: `linear-gradient(90deg, ${AQI_LEVELS.map((l, i) => `${l.color} ${i * 20}%`).join(',')})` }} />
          </label>
          <div className="seg">
            {PRESETS.map((p) => <button key={p} className={settings.threshold === p ? 'on' : ''} onClick={() => updateSettings({ threshold: p })}>{p}</button>)}
          </div>

          <h2 className="h3">Сповіщення браузера</h2>
          <label className="switch">
            <input type="checkbox" checked={settings.notifications} disabled={!supported || perm === 'denied'} onChange={(e) => toggleNotifications(e.target.checked)} />
            <span>Показувати системне сповіщення при перевищенні</span>
          </label>
          {perm === 'denied' && <p className="small warn">Сповіщення заблоковано в налаштуваннях браузера. Банер у застосунку працюватиме й без них.</p>}
          {perm === 'unsupported' && <p className="small warn">Цей браузер не підтримує сповіщення.</p>}
          <p className="muted small">Про одне місто сповіщення надходить не частіше ніж раз на 3 години. Дані оновлюються кожні 15 хвилин, поки вкладка відкрита.</p>
        </section>

        <section className="card">
          <h2 className="h3">Обрані міста <span className="muted small">({favorites.length})</span></h2>
          {favorites.length === 0 && <p className="muted">Додайте міста зірочкою у списку на <Link to="/">головній</Link>.</p>}
          <ul className="fav-list">
            {favorites.filter((id) => CITY_BY_ID[id]).map((id) => {
              const d = snapshot?.cities[id];
              const over = alerts.some((a) => a.city.id === id);
              return (
                <li key={id} className={over ? 'over' : ''}>
                  <AqiBadge aqi={d?.current.aqi ?? NaN} />
                  <Link to={`/city/${id}`}>{CITY_BY_ID[id].name}</Link>
                  {over && <span className="pill pill-danger">понад поріг</span>}
                  <FavButton id={id} name={CITY_BY_ID[id].name} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <h2 className="h3">Оформлення та дані</h2>
          <label className="field">
            <span>Тема</span>
            <select value={settings.theme} onChange={(e) => updateSettings({ theme: e.target.value as Theme })}>
              <option value="system">Як у системі</option>
              <option value="light">Світла</option>
              <option value="dark">Темна</option>
            </select>
          </label>
          <label className="switch">
            <input type="checkbox" checked={settings.forceDemo} onChange={(e) => updateSettings({ forceDemo: e.target.checked })} />
            <span>Демо-режим (змодельовані дані без інтернету)</span>
          </label>
          <p className="muted small">Якщо сервер даних недоступний, застосунок перемикається в демо-режим автоматично.</p>
        </section>
      </div>
    </>
  );
}
