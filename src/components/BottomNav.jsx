import { useFolio } from '../useFolio.js';

const tabs = [
  ['home', 'Home', 'M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  ['discover', 'Discover', 'M15.5 8.5l-2 5-5 2 2-5z M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'],
  ['create', 'Create', 'M12 5v14M5 12h14'],
  ['clubs', 'Book Clubs', 'M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z M12 6v14'],
  ['library', 'Bookshelf', 'M4 3h5v18H4z M11 3h5v18h-5z M19 5l3 .8-3.5 14.5-3-.8z'],
];

export function BottomNav() {
  const { state, actions } = useFolio();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map(([id, label, path]) => (
        <button
          type="button"
          key={id}
          className={state.screen === id || (id === 'clubs' && state.screen === 'book') ? 'active' : ''}
          aria-current={state.screen === id ? 'page' : undefined}
          onClick={() => actions.navigate(id)}
        >
          {id === 'create' ? (
            <span className="create-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={path} />
              </svg>
            </span>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={path} />
            </svg>
          )}
          <span>{label}</span>
          {id === 'create' && <span className="nav-lock" aria-hidden="true">⌑</span>}
        </button>
      ))}
    </nav>
  );
}
