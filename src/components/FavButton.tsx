import { useApp } from '../context/AppContext';

/** Кнопка «додати до обраних» (зірочка) */
export default function FavButton({ id, name, withText = false }: { id: string; name: string; withText?: boolean }) {
  const { isFavorite, toggleFavorite } = useApp();
  const on = isFavorite(id);
  const label = on ? `Прибрати ${name} з обраних` : `Додати ${name} до обраних`;
  return (
    <button
      className={`fav ${on ? 'fav-on' : ''} ${withText ? 'btn' : 'icon-btn'}`}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.2 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.6l6-.9Z" /></svg>
      {withText && <span>{on ? 'В обраних' : 'До обраних'}</span>}
    </button>
  );
}
