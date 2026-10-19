import { books, coverPalette, statusLabels } from '../data.js';
import { useFolio } from '../useFolio.js';
import { Avatar, BookCover } from '../components/BookCover.jsx';
import { BookRow, Button, EmptyState, SegmentedControl, Subtitle, TopBar } from '../components/Shared.jsx';

const statusOptions = [
  { value: 'reading', label: 'Reading' },
  { value: 'want', label: 'Want to read' },
  { value: 'finished', label: 'Finished' },
  { value: 'paused', label: 'Paused' },
  { value: 'off-shelf', label: 'Off shelf' },
  { value: 'saved', label: 'Saved' },
];

function CoverCustomization() {
  const { state, actions } = useFolio();
  const shelvedBooks = books.filter((book) => state.bookshelf[book.id]?.shelved);

  return (
    <section className="card card-content cover-customization">
      <h3>Customize my books</h3>
      <p className="muted">
        Official covers are the default. Custom designs only change how a book looks on your shelf.
      </p>
      {shelvedBooks.map((book) => {
        const design = state.coverDesigns[book.id] || { mode: 'official' };
        const custom = design.mode === 'custom';
        const background = design.background || '#D9A6AD';
        return (
          <div className="cover-setting" key={book.id}>
            <div className="cover-setting-header">
              <BookCover book={book} size="xs" design={design} />
              <div className="cover-setting-title">
                <b className="serif">{book.title}</b>
                <SegmentedControl
                  options={[
                    { value: 'official', label: 'Official cover' },
                    { value: 'custom', label: 'Custom design' },
                  ]}
                  value={custom ? 'custom' : 'official'}
                  onChange={(mode) => actions.updateCover(book.id, { mode })}
                />
              </div>
            </div>
            {custom && (
              <>
                <div className="color-palette">
                  {coverPalette.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-swatch ${background.toLowerCase() === color.toLowerCase() ? 'selected' : ''}`}
                      style={{ background: color }}
                      aria-label={`Use cover color ${color}`}
                      onClick={() => actions.updateCover(book.id, { mode: 'custom', background: color })}
                    />
                  ))}
                  <label className="color-picker">
                    Custom <input
                      type="color"
                      value={background}
                      aria-label={`Custom color for ${book.title}`}
                      onChange={(event) =>
                        actions.updateCover(book.id, {
                          mode: 'custom',
                          background: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <span className="muted">Text color</span>
                <SegmentedControl
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: '#FAF5EF', label: 'Ivory' },
                    { value: '#2B1B2E', label: 'Ink' },
                    { value: '#E8C97A', label: 'Gold' },
                  ]}
                  value={design.text || 'auto'}
                  onChange={(text) => actions.updateCover(book.id, { mode: 'custom', text })}
                />
                <Button
                  variant="small-outline"
                  onClick={() => actions.setAllCoverColors(book.id)}
                >
                  Use this color on all books
                </Button>
              </>
            )}
          </div>
        );
      })}
      <div className="setting-actions">
        <Button variant="small-outline" onClick={actions.setRainbowCovers}>Rainbow shelf</Button>
        <Button variant="small-outline" onClick={actions.resetCovers}>All official covers</Button>
      </div>
    </section>
  );
}

function BookshelfDisplay() {
  const { state, actions } = useFolio();
  const displayed = books.filter((book) => state.bookshelf[book.id]?.shelved);
  const shelves = [];
  for (let index = 0; index < displayed.length; index += 3) {
    shelves.push(displayed.slice(index, index + 3));
  }
  const shelfLabels = ['Currently loved', 'Slow-burn romance', 'Ink & moss', 'More favorites'];

  if (!displayed.length) {
    return <EmptyState title="Your shelf is empty">Shelve a book from your list below.</EmptyState>;
  }

  return (
    <>
      {shelves.map((booksOnShelf, shelfIndex) => (
        <section
          className="shelf-case"
          key={booksOnShelf[0].id}
          style={{ '--shelf-theme': state.proReader ? state.shelfTheme : '#EDE1D3' }}
        >
          <h3>{state.proReader ? shelfLabels[Math.min(shelfIndex, 3)] : shelfIndex === 0 ? 'On my shelf' : ''}</h3>
          <div className="shelf-books">
            {booksOnShelf.map((book, bookIndex) => (
              <button
                type="button"
                className="cover-button"
                key={book.id}
                aria-label={`Open ${book.title}`}
                style={{ transform: state.proReader && bookIndex % 2 ? 'rotate(3deg)' : undefined }}
                onClick={() => actions.openBook(book.id)}
              >
                <BookCover book={book} size="md" design={state.coverDesigns[book.id]} />
              </button>
            ))}
            {state.proReader && <span className="shelf-decoration" aria-hidden="true">🪴</span>}
          </div>
          <div className="shelf-plank" />
        </section>
      ))}
    </>
  );
}

function LibraryList() {
  const { state, actions } = useFolio();
  let visibleBooks = books.filter((book) => {
    const entry = state.bookshelf[book.id];
    if (state.libraryTab === 'saved') return state.savedIds.includes(book.id) && !entry;
    if (state.libraryTab === 'off-shelf') return entry && !entry.shelved;
    return entry?.status === state.libraryTab;
  });

  return visibleBooks.length ? (
    visibleBooks.map((book) => {
      const entry = state.bookshelf[book.id];
      return (
        <BookRow
          key={book.id}
          book={book}
          cover={<BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />}
          onOpen={() => actions.openBook(book.id)}
        >
          {entry && (
            <>
              <Button
                variant="small-outline"
                onClick={() => actions.openAddSheet(book.id)}
              >
                {statusLabels[entry.status]}
              </Button>
              {entry.progress != null && (
                <>
                  <div className="progress-track"><i style={{ width: `${entry.progress}%` }} /></div>
                  <span className="muted">{entry.progress}% read</span>
                </>
              )}
              {entry.rating && <span className="star-rating" aria-label={`${entry.rating} stars`}>★</span>}
              {!entry.shelved && <span className="muted">Off shelf · club still open</span>}
            </>
          )}
          <div className="row-actions">
            {entry ? (
              <>
                <Button
                  variant={entry.shelved ? 'small-outline' : 'small'}
                  onClick={() => actions.toggleShelved(book.id)}
                >
                  {entry.shelved ? 'Unshelve' : 'Shelve'}
                </Button>
                {entry.status === 'finished' ? (
                  <Button variant="small" onClick={() => actions.openBook(book.id, 'spoilers')}>Spoilers</Button>
                ) : (
                  <Button variant="small-outline" onClick={() => actions.openBook(book.id)}>Club</Button>
                )}
              </>
            ) : (
              <Button variant="small" onClick={() => actions.openAddSheet(book.id)}>Add</Button>
            )}
          </div>
        </BookRow>
      );
    })
  ) : (
    <EmptyState title="Nothing here yet">Books you add will appear here.</EmptyState>
  );
}

export function LibraryScreen() {
  const { state, actions } = useFolio();
  const bookCount = Object.keys(state.bookshelf).length;
  const shelfCount = Object.values(state.bookshelf).filter((item) => item.shelved).length;

  return (
    <>
      <TopBar>
        <div className="wordmark">My Bookshelf</div>
        <Avatar />
      </TopBar>
      <SegmentedControl
        options={[
          { value: false, label: 'Free Reader' },
          { value: true, label: 'Pro Reader' },
        ]}
        value={state.proReader}
        onChange={actions.setProReader}
      />
      <Subtitle>
        @ada.reads · {bookCount} books · {shelfCount} on shelf
        {!state.proReader && ' of 6'}
      </Subtitle>
      <div className="page-actions">
        <Button variant="outline" onClick={() => actions.navigate('find')}>⌕ Find a book to add</Button>
      </div>
      <BookshelfDisplay />
      {state.proReader ? (
        <section className="shelf-theme-picker">
          <b>Backdrop</b>
          <div className="color-palette">
            {[
              ['#D9A6AD', 'Rose'],
              ['#B7A1C9', 'Mauve'],
              ['#A8B9A0', 'Sage'],
              ['#C6A467', 'Gold'],
            ].map(([color, label]) => (
              <button
                type="button"
                key={color}
                className={`color-swatch ${state.shelfTheme === color ? 'selected' : ''}`}
                style={{ background: color }}
                aria-label={`${label} backdrop`}
                onClick={() => actions.setShelfTheme(color)}
              />
            ))}
          </div>
          <p className="muted">Unlimited display, multiple shelves, layouts and decor.</p>
        </section>
      ) : (
        <p className="shelf-note">
          Your shelf is your public display. Every book on your list stays private and keeps its Book Club, shelved or not.
        </p>
      )}
      {state.proReader && <CoverCustomization />}
      <div className="feature-tiles">
        <button type="button" className="feature-tile sage-tile" onClick={actions.startReconnect}>
          Retain Interest <span>Reconnect with a book</span>
        </button>
        <button type="button" className="feature-tile rose-tile" onClick={actions.showReconnectFeed}>
          Finished Books <span>Revisit spoilers</span>
        </button>
      </div>
      <h3 className="section-heading">All my books</h3>
      <SegmentedControl
        options={statusOptions}
        value={state.libraryTab}
        onChange={actions.setLibraryTab}
      />
      <LibraryList />
    </>
  );
}
