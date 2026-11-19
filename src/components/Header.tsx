import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Theme } from '../types';

const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<Theme, string> = { system: 'Тема: як у системі', light: 'Тема: світла', dark: 'Тема: темна' };

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>;
  if (theme === 'light') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M8.5 20h7M12 16.5V20" /></svg>;
}

export default function Header() {
  const { settings, updateSettings, alerts } = useApp();
  return (
    <header className="header">
      <div className="container header-in">
        <Link to="/" className="brand" aria-label="Повітря UA — на головну">
          <svg viewBox="0 0 32 32" className="brand-mark" aria-hidden="true">
            <circle cx="16" cy="16" r="15" />
            <path d="M8 13h11a3 3 0 1 0-3-3M8 18h15a3 3 0 1 1-3 3" />
          </svg>
          <span>Повітря<b>UA</b></span>
        </Link>
        <nav className="nav" aria-label="Основна навігація">
          <NavLink to="/" end>Карта</NavLink>
          <NavLink to="/compare">Порівняння</NavLink>
          <NavLink to="/settings">
            Сповіщення{alerts.length > 0 && <span className="nav-dot" aria-label={`${alerts.length} перевищень`}>{alerts.length}</span>}
          </NavLink>
        </nav>
        <button className="icon-btn" onClick={() => updateSettings({ theme: NEXT[settings.theme] })} title={THEME_LABEL[settings.theme]} aria-label={THEME_LABEL[settings.theme]}>
          <ThemeIcon theme={settings.theme} />
        </button>
      </div>
    </header>
  );
}
