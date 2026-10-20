import { useEffect } from 'react';
import { useFolio } from '../useFolio.js';
import { BookCover } from './BookCover.jsx';
import { Button } from './Shared.jsx';

export function AddBookSheet() {
  const { state, actions } = useFolio();
  const { closeAddSheet } = actions;
  const book = state.books.find((item) => item.id === state.addingBookId);

  useEffect(() => {
    if (!state.addingBookId) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeAddSheet();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [closeAddSheet, state.addingBookId]);

  if (!state.addingBookId || !book) return null;
  const current = state.bookshelf[book.id];
  const statuses = [
    ['want', 'Want to Read'],
    ['reading', 'Currently Reading'],
    ['finished', 'Finished'],
    ...(current ? [['paused', 'Paused']] : []),
  ];

  return (
    <div
      className="overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeAddSheet();
      }}
    >
      <section className="action-sheet" role="dialog" aria-modal="true" aria-label="Book status">
        <div className="who-row">
          <BookCover book={book} size="xs" design={state.coverDesigns[book.id]} />
          <div>
            <h2>{book.title}</h2>
            <span className="muted">{current ? 'Change reading status' : 'Add to your list'}</span>
          </div>
        </div>
        {statuses.map(([status, label]) => (
          <Button
            key={status}
            variant={current?.status === status ? 'primary' : 'outline'}
            onClick={() => actions.updateStatus(book.id, status)}
          >
            {current?.status === status ? '✓ ' : ''}
            {label}
          </Button>
        ))}
        {current && (
          <Button variant="link" onClick={actions.removeFromList}>
            Remove from my list
          </Button>
        )}
        <div className="action-sheet-dismiss">
          <Button variant="link" onClick={closeAddSheet}>
            Cancel
          </Button>
          <button
            className="action-sheet-close"
            type="button"
            aria-label="Close book status menu"
            onClick={closeAddSheet}
          >
            ×
          </button>
        </div>
      </section>
    </div>
  );
}

export function DiscoverySheet() {
  const { state, actions } = useFolio();
  if (!state.discoveryDecision || !state.currentDiscoveryBook) return null;
  const book = state.currentDiscoveryBook;

  return (
    <div className="overlay">
      <section className="action-sheet" role="dialog" aria-modal="true" aria-label="Discovery result">
        <h2>Nice find. What next?</h2>
        <p className="muted">
          Interest doesn’t mean you’re ready to add it to your list.
        </p>
        <Button onClick={() => actions.openAddSheet(book, true)}>Add to My List</Button>
        <Button
          variant="outline"
          onClick={() => actions.finishDiscoveryBook(book.id, true)}
        >
          Save to discovery list
        </Button>
        <Button variant="link" onClick={actions.skipDiscoveryBook}>
          Never mind
        </Button>
      </section>
    </div>
  );
}

export function Toast() {
  const { state, actions } = useFolio();
  const { notify } = actions;
  useEffect(() => {
    if (!state.toast) return undefined;
    const timeout = window.setTimeout(() => notify(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [state.toast, notify]);
  return state.toast ? <div className="toast" role="status">{state.toast}</div> : null;
}
