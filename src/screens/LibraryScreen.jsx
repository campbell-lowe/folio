import { coverPalette, statusLabels } from '../data.js';
import { useState } from 'react';
import { useFolio } from '../useFolio.js';
import { AvatarButton, BookCover } from '../components/BookCover.jsx';
import { BookRow, Button, EmptyState, SegmentedControl, Subtitle, TopBar } from '../components/Shared.jsx';

const statusOptions = [
  { value: 'all', label: 'All books' },
  { value: 'on-shelf', label: 'On shelf' },
  { value: 'off-shelf', label: 'Off shelf' },
  { value: 'reading', label: 'Reading' },
  { value: 'want', label: 'Want to read' },
  { value: 'finished', label: 'Finished' },
  { value: 'paused', label: 'Paused' },
  { value: 'saved', label: 'Saved' },
];

function CoverCustomization() {
  const { state, actions } = useFolio();
  const shelvedBooks = state.books.filter((book) => state.bookshelf[book.id]?.shelved);

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

function ShelfDisplay({ selectedShelfId, onSelectShelf, onCreateShelf, onEditShelf }) {
  const { state, actions } = useFolio();
  const displayed = state.books.filter((book) => state.bookshelf[book.id]?.shelved);
  const selectedShelf = state.customShelves.find((shelf) => shelf.id === selectedShelfId);
  const assignedIds = new Set(state.customShelves.flatMap((shelf) => shelf.bookIds));
  const unassignedBooks = displayed.filter((book) => !assignedIds.has(book.id));

  function renderCovers(books) {
    return books.map((book) => (
      <button
        type="button"
        className="cover-button"
        key={book.id}
        aria-label={`Open ${book.title}`}
        onClick={() => actions.openBook(book.id)}
      >
        <BookCover book={book} size="md" design={state.coverDesigns[book.id]} />
      </button>
    ));
  }

  if (!state.proReader) {
    return displayed.length ? (
      <section className="shelf-case" style={{ '--shelf-theme': '#EDE1D3' }}>
        <h3>On my shelf</h3>
        <div className="shelf-books">{renderCovers(displayed)}</div>
        <div className="shelf-plank" />
      </section>
    ) : (
      <EmptyState title="Your shelf is empty">Shelve a book from your list below.</EmptyState>
    );
  }

  if (selectedShelf) {
    const shelfBooks = displayed.filter((book) => selectedShelf.bookIds.includes(book.id));
    return (
      <section className="shelf-case selected-shelf" style={{ '--shelf-theme': state.shelfTheme }}>
        <div className="shelf-heading">
          <Button variant="link" onClick={() => onSelectShelf('')}>‹ All shelves</Button>
          <h3>{selectedShelf.name}</h3>
          <Button variant="small-outline" onClick={() => onEditShelf(selectedShelf)}>Edit shelf</Button>
        </div>
        {shelfBooks.length ? (
          <div className="shelf-books">{renderCovers(shelfBooks)}</div>
        ) : (
          <EmptyState title="This shelf is empty">Edit it to choose books from your library.</EmptyState>
        )}
        <div className="shelf-plank" />
      </section>
    );
  }

  return (
    <section className="custom-shelves">
      <div className="shelf-list-heading">
        <h3>My shelves</h3>
        <Button variant="small" onClick={onCreateShelf}>+ New shelf</Button>
      </div>
      {state.customShelves.length ? (
        <div className="custom-shelf-grid">
          {state.customShelves.map((shelf) => {
            const books = displayed.filter((book) => shelf.bookIds.includes(book.id));
            return (
              <article className="custom-shelf-card" key={shelf.id}>
                <button
                  type="button"
                  className="custom-shelf-open"
                  onClick={() => onSelectShelf(shelf.id)}
                  aria-label={`Open ${shelf.name} shelf, ${books.length} books`}
                >
                  <span className="custom-shelf-preview">
                    {books.slice(0, 3).map((book) => (
                      <BookCover key={book.id} book={book} size="xs" design={state.coverDesigns[book.id]} />
                    ))}
                    {!books.length && <span className="muted">Empty shelf</span>}
                  </span>
                  <b>{shelf.name}</b>
                  <span className="muted">{books.length} books</span>
                </button>
                <Button variant="small-outline" onClick={() => onEditShelf(shelf)}>Edit</Button>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No named shelves yet">Create a shelf, then choose books to display on it.</EmptyState>
      )}
      {unassignedBooks.length > 0 && (
        <section className="shelf-case" style={{ '--shelf-theme': state.shelfTheme }}>
          <h3>On my shelf</h3>
          <div className="shelf-books">{renderCovers(unassignedBooks)}</div>
          <div className="shelf-plank" />
        </section>
      )}
    </section>
  );
}

function ShelfEditor({ shelf, onSave, onCancel, onDelete }) {
  const { state } = useFolio();
  const [name, setName] = useState(shelf?.name || '');
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedIds, setSelectedIds] = useState(shelf?.bookIds || []);
  const books = state.books.filter((book) => state.bookshelf[book.id]);
  const authors = [...new Set(books.map((book) => book.author))].sort((a, b) => a.localeCompare(b));
  const query = search.trim().toLocaleLowerCase();
  const filteredBooks = books.filter((book) =>
    (!author || book.author === author)
    && (!query || `${book.title} ${book.author}`.toLocaleLowerCase().includes(query)),
  );

  function selectFilteredBooks() {
    const filteredIds = filteredBooks.map((book) => book.id);
    setSelectedIds((current) => [...new Set([...current, ...filteredIds])]);
  }

  return (
    <section className="card card-content shelf-editor">
      <h3>{shelf ? `Edit ${shelf.name}` : 'Create a shelf'}</h3>
      <label>
        Shelf name
        <input
          className="text-input"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Cosmere"
        />
      </label>
      <label>
        Search books
        <input
          className="text-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Title or author"
        />
      </label>
      <label>
        Filter by author
        <select className="text-input" value={author} onChange={(event) => setAuthor(event.target.value)}>
          <option value="">All authors</option>
          {authors.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </label>
      <Button variant="small-outline" onClick={selectFilteredBooks}>
        Add all {filteredBooks.length} filtered books
      </Button>
      <div className="shelf-book-picker">
        {filteredBooks.map((book) => (
          <label key={book.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(book.id)}
              onChange={(event) => setSelectedIds((current) =>
                event.target.checked
                  ? [...current, book.id]
                  : current.filter((id) => id !== book.id),
              )}
            />
            <span>{book.title}</span>
            <span className="muted">{book.author}</span>
          </label>
        ))}
        {!filteredBooks.length && <p className="muted">No books match these filters.</p>}
      </div>
      <div className="shelf-editor-actions">
        <Button onClick={() => onSave({ id: shelf?.id, name, bookIds: selectedIds })} disabled={!name.trim()}>
          Save shelf
        </Button>
        {shelf && <Button variant="small-outline" onClick={onDelete}>Delete shelf</Button>}
        <Button variant="link" onClick={onCancel}>Cancel</Button>
      </div>
    </section>
  );
}

function LibraryList({ selectedShelfId }) {
  const { state, actions } = useFolio();
  const visibleBooks = state.books.filter((book) => {
    const entry = state.bookshelf[book.id];
    if (selectedShelfId) {
      return state.customShelves
        .find((shelf) => shelf.id === selectedShelfId)
        ?.bookIds.includes(book.id) || false;
    }
    if (state.libraryTab === 'all') return Boolean(entry);
    if (state.libraryTab === 'on-shelf') return Boolean(entry?.shelved);
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
  const [selectedShelfId, setSelectedShelfId] = useState('');
  const [editingShelf, setEditingShelf] = useState(null);
  const [creatingShelf, setCreatingShelf] = useState(false);
  const bookCount = Object.keys(state.bookshelf).length;
  const shelfCount = Object.values(state.bookshelf).filter((item) => item.shelved).length;
  const selectedShelf = state.customShelves.find((shelf) => shelf.id === selectedShelfId);

  function saveShelf(shelf) {
    const id = actions.saveCustomShelf(shelf);
    setSelectedShelfId(id);
    setEditingShelf(null);
    setCreatingShelf(false);
    actions.notify('Shelf saved.');
  }

  function deleteShelf() {
    if (!editingShelf) return;
    actions.removeCustomShelf(editingShelf.id);
    setSelectedShelfId('');
    setEditingShelf(null);
    actions.notify('Shelf deleted. Its books are still on your shelf.');
  }

  return (
    <>
      <TopBar>
        <div className="wordmark">My Bookshelf</div>
        <AvatarButton
          color={state.profile.avatarColor}
          onClick={() => actions.navigate('profile')}
        />
      </TopBar>
      <SegmentedControl
        options={[
          { value: false, label: 'Free Reader' },
          { value: true, label: 'Pro Reader' },
        ]}
        value={state.proReader}
        onChange={(isPro) => {
          actions.setProReader(isPro);
          if (!isPro) {
            setSelectedShelfId('');
            setEditingShelf(null);
            setCreatingShelf(false);
          }
        }}
      />
      <Subtitle>
        {state.profile.handle ? `@${state.profile.handle.replace(/^@+/, '')}` : 'Guest reader'}
        {' · '}{bookCount} books · {shelfCount} on shelf · {bookCount - shelfCount} off shelf
        {!state.proReader && ' of 6'}
      </Subtitle>
      <div className="page-actions">
        <Button variant="outline" onClick={() => actions.navigate('find')}>⌕ Find a book to add</Button>
      </div>
      <ShelfDisplay
        selectedShelfId={selectedShelfId}
        onSelectShelf={setSelectedShelfId}
        onCreateShelf={() => {
          setEditingShelf(null);
          setCreatingShelf(true);
        }}
        onEditShelf={(shelf) => {
          setEditingShelf(shelf);
          setCreatingShelf(false);
        }}
      />
      {(creatingShelf || editingShelf) && (
        <ShelfEditor
          key={editingShelf?.id || 'new-shelf'}
          shelf={editingShelf}
          onSave={saveShelf}
          onCancel={() => {
            setEditingShelf(null);
            setCreatingShelf(false);
          }}
          onDelete={deleteShelf}
        />
      )}
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
          <p className="muted">Create named shelves and choose which of your books appear on each one.</p>
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
      <h3 className="section-heading">{selectedShelf ? `Books on ${selectedShelf.name}` : 'All my books'}</h3>
      {selectedShelf ? (
        <div className="page-actions">
          <Button variant="outline" onClick={() => setSelectedShelfId('')}>Show all books</Button>
        </div>
      ) : (
        <SegmentedControl
          options={statusOptions}
          value={state.libraryTab}
          onChange={actions.setLibraryTab}
          className="library-filters"
        />
      )}
      <LibraryList selectedShelfId={selectedShelf?.id || ''} />
    </>
  );
}
