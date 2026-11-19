import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import StatusBar from './components/StatusBar';

// сторінки завантажуються окремими частинами (code splitting): карта Leaflet і графіки Recharts не блокують перший показ
const HomePage = lazy(() => import('./pages/HomePage'));
const CityPage = lazy(() => import('./pages/CityPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const Fallback = () => <div className="loading" aria-busy="true"><div className="spinner" /> Завантаження…</div>;

export default function App() {
  return (
    <div className="app">
      <a className="skip" href="#main">Перейти до вмісту</a>
      <Header />
      <AlertBanner />
      <main id="main" className="container">
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/city/:id" element={<CityPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <StatusBar />
    </div>
  );
}
