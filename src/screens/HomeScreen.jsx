import { useEffect, useState } from 'react';
import { useFolio } from '../useFolio.js';
import { searchBooks } from '../openLibrary.js';
import { Avatar } from '../components/BookCover.jsx';
import { BookCover } from '../components/BookCover.jsx';
import { BookRow, Button, EmptyState, PageTitle, Subtitle, TopBar } from '../components/Shared.jsx';
import { ContentRatingChip } from './RatingsScreen.jsx';

export function HomeScreen() {
  const { state, actions } = useFolio();
  const [discoveries, setDiscoveries] = useState([]);
  const [loadingDiscoveries, setLoadingDiscoveries] = useState(true);
  const [discoveryError, setDiscoveryError] = useState('');
  const displayName = state.profile.name.trim();
  const libraryBooks = state.books.filter((book) => state.bookshelf[book.id]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeed() {
      try {
        const books = await searchBooks('subject:fiction', controller.signal);
        setDiscoveries(books.slice(0, 5));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Could not load Open Library titles for the home feed.', error);
        setDiscoveryError('Open Library titles are unavailable right now.');
      } finally {
        if (!controller.signal.aborted) setLoadingDiscoveries(false);
      }
    }
    loadFeed();
    return () => controller.abort();
  }, []);

  return (
    <>
      <TopBar>
        <div className="wordmark">Folio</div>
        <button
          type="button"
          className="profile-link"
          aria-label="Open profile"
          onClick={() => actions.navigate('profile')}
        >
          <Avatar color={state.profile.avatarColor} />
        </button>
      </TopBar>
      <PageTitle>{displayName ? `Your reading feed, ${displayName}` : 'Your reading feed'}</PageTitle>
      <Subtitle>Books from your library and new titles from Open Library.</Subtitle>

      <section className="feed-section">
        <div className="feed-section-heading">
          <h2>Your bookshelf</h2>
          <Button variant="link" onClick={() => actions.navigate('library')}>View all</Button>
        </div>
        {libraryBooks.length ? libraryBooks.slice(0, 5).map((book) => (
          <BookRow
            key={book.id}
            book={book}
            cover={<BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />}
            onOpen={() => actions.openBook(book.id)}
          >
            <span className="muted">
              {state.bookshelf[book.id].status === 'finished'
                ? 'Finished'
                : state.bookshelf[book.id].status === 'reading'
                  ? 'Currently reading'
                  : state.bookshelf[book.id].status === 'paused'
                    ? 'Paused'
                    : 'Want to read'}
              {state.bookshelf[book.id].shelved ? ' · On shelf' : ' · Off shelf'}
            </span>
            <Button variant="small-outline" onClick={() => actions.openAddSheet(book.id)}>
              Update status
            </Button>
          </BookRow>
        )) : (
          <EmptyState title="Your feed starts with a book">
            Add a title to your library, and it will appear here.
            <Button variant="outline" onClick={() => actions.navigate('find')}>Find a book</Button>
          </EmptyState>
        )}
      </section>

      <section className="feed-section">
        <div className="feed-section-heading">
          <h2>Explore books</h2>
          <Button variant="link" onClick={() => actions.navigate('discover')}>Discover more</Button>
        </div>
        {loadingDiscoveries && <p className="muted">Loading titles from Open Library…</p>}
        {discoveryError && <p className="form-error" role="alert">{discoveryError}</p>}
        {!loadingDiscoveries && !discoveryError && discoveries.map((book) => (
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
              onClick={() => actions.openAddSheet(book)}
            >
              {state.bookshelf[book.id] ? 'Update status' : 'Add to my list'}
            </Button>
          </BookRow>
        ))}
        {!loadingDiscoveries && !discoveryError && !discoveries.length && (
          <EmptyState title="No Open Library titles found">
            Try the Discover page or search for a title.
            <Button variant="outline" onClick={() => actions.navigate('find')}>Search books</Button>
          </EmptyState>
        )}
      </section>
    </>
  );
}
