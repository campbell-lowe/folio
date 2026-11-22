import { statusLabels } from '../data.js';
import { useState } from 'react';
import { useFolio } from '../useFolio.js';
import { AvatarButton, BookCover } from '../components/BookCover.jsx';
import { Button, EmptyState, PageTitle, SegmentedControl, Subtitle, TopBar } from '../components/Shared.jsx';

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

function LibraryList({ selectedShelfId, search, sortBy, managingShelf }) {
  const { state, actions } = useFolio();
  const query = search.trim().toLocaleLowerCase();
  const selectedShelf = state.customShelves.find((shelf) => shelf.id === selectedShelfId);
  const visibleBooks = state.books.filter((book) => {
    const entry = state.bookshelf[book.id];
    if (query && !`${book.title} ${book.author}`.toLocaleLowerCase().includes(query)) return false;
    if (selectedShelfId && !managingShelf) {
      return state.customShelves
        .find((shelf) => shelf.id === selectedShelfId)
        ?.bookIds.includes(book.id) || false;
    }
    if (state.libraryTab === 'all') return Boolean(entry);
    if (state.libraryTab === 'on-shelf') return Boolean(entry?.shelved);
    if (state.libraryTab === 'saved') return state.savedIds.includes(book.id) && !entry;
    if (state.libraryTab === 'off-shelf') return entry && !entry.shelved;
    return entry?.status === state.libraryTab;
  }).sort((a, b) => {
    if (sortBy === 'author') return a.author.localeCompare(b.author);
    if (sortBy === 'status') {
      const aStatus = statusLabels[state.bookshelf[a.id]?.status] || '';
      const bStatus = statusLabels[state.bookshelf[b.id]?.status] || '';
      return aStatus.localeCompare(bStatus);
    }
    return a.title.localeCompare(b.title);
  });

  return visibleBooks.length ? (
    <div className="bookshelf-list">
      {visibleBooks.map((book) => {
        const entry = state.bookshelf[book.id];
        return (
          <article className="bookshelf-book" key={book.id}>
            <button
              type="button"
              className="bookshelf-book-open"
              onClick={() => actions.openBook(book.id)}
              aria-label={`Open ${book.title}`}
            >
              <BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />
              <span className="bookshelf-book-copy">
                <b className="serif">{book.title}</b>
                <span>{book.author}</span>
                {entry && (
                  <span className="bookshelf-meta">
                    {statusLabels[entry.status]}
                    {entry.progress != null && ` · ${entry.progress}%`}
                    {!entry.shelved && ' · Off shelf'}
                  </span>
                )}
              </span>
            </button>
            <div className="bookshelf-book-actions">
              {entry ? (
                <>
                  {selectedShelf && (
                    <button
                      type="button"
                      className="bookshelf-icon-button bookshelf-shelf-toggle"
                      onClick={() => actions.saveCustomShelf({
                        id: selectedShelf.id,
                        name: selectedShelf.name,
                        bookIds: selectedShelf.bookIds.includes(book.id)
                          ? selectedShelf.bookIds.filter((id) => id !== book.id)
                          : [...selectedShelf.bookIds, book.id],
                      })}
                      aria-label={selectedShelf.bookIds.includes(book.id)
                        ? `Remove ${book.title} from ${selectedShelf.name}`
                        : `Add ${book.title} to ${selectedShelf.name}`}
                      title={selectedShelf.bookIds.includes(book.id) ? 'Remove from shelf' : 'Add to shelf'}
                    >
                      {selectedShelf.bookIds.includes(book.id) ? '−' : '+'}
                    </button>
                  )}
                  <Button variant="small-outline" onClick={() => actions.openAddSheet(book.id)}>
                    {statusLabels[entry.status]}
                  </Button>
                  <button
                    type="button"
                    className="bookshelf-icon-button"
                    onClick={() => actions.toggleShelved(book.id)}
                    aria-label={entry.shelved ? `Remove ${book.title} from shelf` : `Add ${book.title} to shelf`}
                    title={entry.shelved ? 'Remove from shelf' : 'Add to shelf'}
                  >
                    {entry.shelved ? '−' : '+'}
                  </button>
                </>
              ) : (
                <Button variant="small" onClick={() => actions.openAddSheet(book.id)}>Add</Button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  ) : (
    <EmptyState title="Nothing here yet">Books you add will appear here.</EmptyState>
  );
}

export function LibraryScreen() {
  const { state, actions } = useFolio();
  const [selectedShelfId, setSelectedShelfId] = useState('');
  const [editingShelf, setEditingShelf] = useState(null);
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [managingShelf, setManagingShelf] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [shelfName, setShelfName] = useState('');
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
      <PageTitle>My bookshelf</PageTitle>
      <Subtitle>
        {bookCount} {bookCount === 1 ? 'book' : 'books'} · {shelfCount} on shelf · {bookCount - shelfCount} off shelf
      </Subtitle>
      <div className="bookshelf-actions">
        <Button variant="outline" onClick={() => actions.navigate('find')}>⌕ Find a book</Button>
        {state.proReader && (
          <Button variant="small-outline" onClick={() => {
            setEditingShelf(null);
            setCreatingShelf(true);
          }}>+ New shelf</Button>
        )}
      </div>
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
      {state.proReader && state.customShelves.length > 0 && (
        <div className="bookshelf-shelf-tabs" aria-label="Shelves">
          <button
            type="button"
            className={!selectedShelfId ? 'selected' : ''}
            onClick={() => {
              setSelectedShelfId('');
              setManagingShelf(false);
              setRenaming(false);
            }}
          >
            All books
          </button>
          {state.customShelves.map((shelf) => (
            <button
              type="button"
              key={shelf.id}
              className={selectedShelfId === shelf.id ? 'selected' : ''}
              onClick={() => {
                setSelectedShelfId(shelf.id);
                setManagingShelf(false);
                setRenaming(false);
              }}
            >
              {shelf.name}
            </button>
          ))}
        </div>
      )}
      <section className="bookshelf-library">
        <div className="bookshelf-library-heading">
          {renaming && selectedShelf ? (
            <form
              className="shelf-inline-rename"
              onSubmit={(event) => {
                event.preventDefault();
                if (!shelfName.trim()) return;
                actions.saveCustomShelf({
                  ...selectedShelf,
                  name: shelfName.trim(),
                });
                setRenaming(false);
                actions.notify('Shelf renamed.');
              }}
            >
              <input
                className="text-input"
                value={shelfName}
                onChange={(event) => setShelfName(event.target.value)}
                aria-label="Shelf name"
                autoFocus
              />
              <Button type="submit" variant="small">Save</Button>
              <Button type="button" variant="link" onClick={() => setRenaming(false)}>Cancel</Button>
            </form>
          ) : (
            <h3>{selectedShelf ? selectedShelf.name : 'All my books'}</h3>
          )}
          {selectedShelf && !renaming && (
            <div className="shelf-heading-actions">
              <Button
                variant="small-outline"
                onClick={() => {
                  setManagingShelf((current) => !current);
                  setSearch('');
                }}
              >
                {managingShelf ? 'Done' : 'Manage'}
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  setShelfName(selectedShelf.name);
                  setRenaming(true);
                }}
              >
                Rename
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  actions.removeCustomShelf(selectedShelf.id);
                  setSelectedShelfId('');
                  setManagingShelf(false);
                  actions.notify('Shelf deleted. Its books are still on your bookshelf.');
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
        <label className="bookshelf-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or author"
            aria-label="Search bookshelf"
          />
        </label>
        <SegmentedControl
          options={statusOptions}
          value={state.libraryTab}
          onChange={actions.setLibraryTab}
          className="library-filters"
        />
        <div className="bookshelf-sort-row">
          <span className="muted">{Object.keys(state.bookshelf).length} books in your list</span>
          <label>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
        <LibraryList
          selectedShelfId={selectedShelf?.id || ''}
          search={search}
          sortBy={sortBy}
          managingShelf={managingShelf}
        />
      </section>
    </>
  );
}
