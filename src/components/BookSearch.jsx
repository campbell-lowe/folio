import { useEffect, useState } from 'react';
import { parseBooksCsv, searchBooks } from '../openLibrary.js';
import { useFolio } from '../useFolio.js';
import { BookCover } from './BookCover.jsx';
import { BookRow, Button, EmptyState } from './Shared.jsx';
import { ContentRatingChip } from '../screens/RatingsScreen.jsx';

function normalizedTitle(value) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function normalizedIsbn(value) {
  return value.replace(/[^0-9X]/gi, '').toUpperCase();
}

function bestMatch(results, row) {
  const isbn = normalizedIsbn(row.isbn);
  if (isbn) {
    const isbnMatch = results.find((book) =>
      (book.isbns || [book.isbn]).some((candidate) => normalizedIsbn(candidate || '') === isbn),
    );
    if (isbnMatch) return isbnMatch.id;
  }
  const target = normalizedTitle(row.title);
  return results.find((book) => normalizedTitle(book.title) === target)?.id || results[0]?.id || '';
}

function CsvImporter() {
  const { actions } = useFolio();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setRows([]);
    setProgress(0);
    setTotal(0);
    setLoading(true);
    let parsedRows;
    try {
      parsedRows = parseBooksCsv(await file.text());
      setTotal(parsedRows.length);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Could not read this CSV file.');
      setLoading(false);
      return;
    }

    const matches = Array(parsedRows.length);
    let nextIndex = 0;
    async function searchNextRow() {
      while (nextIndex < parsedRows.length) {
        const index = nextIndex;
        nextIndex += 1;
        const row = parsedRows[index];
        const titleQuery = [row.title, row.author].filter(Boolean).join(' ');
        try {
          const isbn = normalizedIsbn(row.isbn);
          let results = isbn ? await searchBooks(`isbn:${isbn}`) : [];
          if (!results.length) results = await searchBooks(titleQuery);
          matches[index] = {
            ...row,
            results,
            selectedId: bestMatch(results, row),
            error: '',
          };
        } catch (searchError) {
          console.error(`Open Library lookup failed for CSV row ${row.row}.`, searchError);
          matches[index] = {
            ...row,
            results: [],
            selectedId: '',
            error: searchError instanceof Error ? searchError.message : 'Open Library lookup failed.',
          };
        }
        setProgress((completed) => completed + 1);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(3, parsedRows.length) }, () => searchNextRow()),
    );
    setRows(matches);
    setLoading(false);
  }

  function addSelectedBooks() {
    const selected = rows
      .map((row) => {
        const book = row.results.find((result) => result.id === row.selectedId);
        return book ? { ...book, importStatus: row.status } : null;
      })
      .filter(Boolean);
    if (!selected.length) return;
    const count = actions.importBooks(selected);
    const missing = selected.length - count;
    actions.notify(
      count
        ? `Added ${count} ${count === 1 ? 'book' : 'books'} to your local library${missing ? `; ${missing} already on your list` : ''}.`
        : 'Those books are already in your library.',
    );
    setRows([]);
  }

  return (
    <section className="card card-content csv-import">
      <h2>Import a CSV</h2>
      <p className="muted">
        Import a Goodreads export or another CSV with a <code>Title</code> column. Goodreads
        exports can also match by ISBN and keep each book’s reading status.
      </p>
      <label className="file-picker">
        <span>Choose Goodreads CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="Choose a CSV file of books"
          onChange={importFile}
        />
      </label>
      {loading && (
        <p className="import-progress" role="status">
          Looking up {progress} of {total} books in Open Library…
        </p>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      {rows.length > 0 && (
        <>
          <div className="csv-matches">
            {rows.map((row) => (
              <div className="csv-match" key={`${row.row}-${row.title}`}>
                <div>
                  <b>{row.title}</b>
                  {row.author && <span className="muted"> · {row.author}</span>}
                  {row.error && <span className="form-error">Row {row.row}: {row.error}</span>}
                  {!row.error && !row.results.length && (
                    <span className="muted">No Open Library match found for row {row.row}.</span>
                  )}
                </div>
                {row.results.length > 0 && (
                  <select
                    aria-label={`Open Library match for ${row.title}`}
                    value={row.selectedId}
                    onChange={(event) => {
                      setRows((current) =>
                        current.map((item) =>
                          item.row === row.row ? { ...item, selectedId: event.target.value } : item,
                        ),
                      );
                    }}
                  >
                    {row.results.map((book) => (
                      <option value={book.id} key={book.id}>
                        {book.title} — {book.author}{book.year ? ` (${book.year})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <Button onClick={addSelectedBooks}>
            Add {rows.filter((row) => row.selectedId).length} matched books
          </Button>
        </>
      )}
    </section>
  );
}

export function BookSearch({ onOpenAdd }) {
  const { state, actions } = useFolio();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = state.searchQuery.trim();
    if (!query) return undefined;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const books = await searchBooks(query, controller.signal);
        setResults(books);
      } catch (searchError) {
        if (searchError instanceof Error && searchError.name === 'AbortError') return;
        console.error('Open Library search failed.', searchError);
        setError(searchError instanceof Error ? searchError.message : 'Open Library search failed.');
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [state.searchQuery]);

  return (
    <>
      <section className="card card-content open-library-search">
        <h2>Search Open Library</h2>
        <label className="search-field">
          <span className="visually-hidden">Search by book title or author</span>
          <input
            className="text-input"
            value={state.searchQuery}
            onChange={(event) => actions.setSearchQuery(event.target.value)}
            placeholder="Search titles or authors"
          />
        </label>
        {loading && <p className="muted" role="status">Searching Open Library…</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {!loading && !error && state.searchQuery.trim() && results.length === 0 && (
          <EmptyState title="No matches">Try another title or author.</EmptyState>
        )}
      </section>
      {state.searchQuery.trim() && results.map((book) => (
        <BookRow
          key={book.id}
          book={book}
          cover={<BookCover book={book} size="sm" />}
          onOpen={() => actions.openBook(book)}
        >
          {book.year && <span className="muted">First published {book.year}</span>}
          <ContentRatingChip bookId={book.id} book={book} />
          <Button
            variant={state.bookshelf[book.id] ? 'small-outline' : 'small'}
            onClick={() => onOpenAdd(book)}
          >
            {state.bookshelf[book.id] ? '✓ Added' : '+ Add'}
          </Button>
        </BookRow>
      ))}
      <CsvImporter />
    </>
  );
}
