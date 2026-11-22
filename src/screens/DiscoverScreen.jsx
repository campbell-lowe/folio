import { useFolio } from '../useFolio.js';
import { BookCover } from '../components/BookCover.jsx';
import {
  BookRow,
  Button,
  EmptyState,
  PageTitle,
  SegmentedControl,
  Subtitle,
  TopBar,
} from '../components/Shared.jsx';
import { ContentRatingChip } from './RatingsScreen.jsx';
import { getContentRatings } from '../ratingData.js';

function DiscoverSetup() {
  const { state, actions } = useFolio();
  return (
    <>
      <TopBar><div className="wordmark">Discover</div></TopBar>
      <PageTitle>How many new books are you looking for?</PageTitle>
      <Subtitle>Pick a goal. We’ll stop as soon as you find them.</Subtitle>
      <SegmentedControl
        className="goal-control"
        options={[1, 2, 3].map((value) => ({ value, label: String(value) }))}
        value={state.discoverGoal}
        onChange={actions.setDiscoverGoal}
      />
      <div className="card card-content">
        <b>How it works</b>
        <p className="muted">
            Read a spoiler-free book description and compare its leaf and pepper ratings.
            No endless feed and nothing extra once you reach your goal.
          </p>
      </div>
      <div className="page-actions">
        <Button onClick={actions.startDiscovery} disabled={state.discoveryLoading}>
          Find {state.discoverGoal} new {state.discoverGoal === 1 ? 'book' : 'books'}
        </Button>
      </div>
      {state.discoveryLoading && <p className="subtitle" role="status">Searching Open Library…</p>}
    </>
  );
}

function DiscoverySession() {
  const { state, actions } = useFolio();
  const book = state.currentDiscoveryBook;
  if (!book) return <DiscoveryResults />;
  const ratings = getContentRatings(book.id);
  const scale = (value) => value == null
    ? 'No ratings'
    : `${Math.round(value)} / 5`;

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={actions.leaveDiscovery}>Leave Discover</Button>
        <b>{state.discoveredIds.length} of {state.discoverGoal} books found</b>
      </TopBar>
      <div className="progress-dots" aria-label="Discovery progress">
        {Array.from({ length: state.discoverGoal }, (_, index) => (
          <i className={index < state.discoveredIds.length ? 'filled' : ''} key={index} />
        ))}
      </div>
      <article className="card discover-card">
        <div className="card-content">
          <div className="discover-book-heading">
            <BookCover book={book} size="sm" />
            <div>
              <span className="discover-label">About this book</span>
              <h2>{book.title}</h2>
              <span className="muted">{book.author}</span>
            </div>
          </div>
          {book.description ? (
            <p className="discover-description">{book.description}</p>
          ) : (
            <p className="discover-description muted">
              {book.subjects?.length
                ? `Explore ${book.subjects.slice(0, 3).join(', ').toLowerCase()} in this ${book.year ? `${book.year} ` : ''}title by ${book.author}.`
                : `Read ${book.title}, a book by ${book.author}${book.year ? ` first published in ${book.year}` : ''}.`}
            </p>
          )}
          {book.year && <p className="muted">First published {book.year}</p>}
          <div className="discover-content-ratings">
            <h3>Community content</h3>
            <div className="discover-scale-row">
              <span>🌶️ Pepper</span>
              <strong>{scale(ratings.spice)}</strong>
            </div>
            <div className="discover-scale-row">
              <span>🍃 Leaf</span>
              <strong>{scale(ratings.cleanliness)}</strong>
            </div>
          </div>
          <ContentRatingChip bookId={book.id} book={book} />
          {ratings.isPlaceholder && (
            <p className="muted small-text">Sample community ratings shown until readers add surveys.</p>
          )}
        </div>
      </article>
      <div className="page-actions">
        <Button onClick={() => actions.setDiscoveryDecision(true)}>I’m interested</Button>
        <div className="action-pair">
          <Button variant="outline" onClick={actions.skipDiscoveryBook}>
            Not for me
          </Button>
          <Button variant="outline" onClick={actions.skipDiscoveryBook}>
            Skip
          </Button>
        </div>
      </div>
    </>
  );
}

function DiscoveryResults() {
  const { state, actions } = useFolio();
  return (
    <>
      <TopBar><div className="wordmark">Discover</div></TopBar>
      <PageTitle>
        {state.discoveredIds.length === 1
          ? 'You found your book'
          : `You found ${state.discoveredIds.length} books`}
      </PageTitle>
      <Subtitle>That’s everything for this session. Enjoy the reading.</Subtitle>
      {state.discoveredIds.map((id) => {
        const book = state.books.find((item) => item.id === id)
          || state.discoveryBooks.find((item) => item.id === id);
        if (!book) return null;
        return (
          <BookRow
            key={id}
            book={book}
            cover={<BookCover book={book} size="sm" design={state.coverDesigns[id]} />}
            onOpen={() => actions.openBook(id)}
          >
            <span className="muted">
              {state.bookshelf[id] ? 'On your list' : state.savedIds.includes(id) ? 'Saved for later' : 'Viewed'}
            </span>
          </BookRow>
        );
      })}
      {state.discoveredIds.length === 0 && (
        <EmptyState title="No more books to discover">Try again after adding some books to your library.</EmptyState>
      )}
      <div className="page-actions">
        <Button onClick={actions.finishDiscovery}>View my books</Button>
        <Button variant="outline" onClick={() => actions.navigate('home')}>Finish</Button>
      </div>
    </>
  );
}

export function DiscoverScreen() {
  const { state, actions } = useFolio();
  if (!state.discoveryStarted) return <DiscoverSetup />;
  if (state.discoveryLoading) {
    return (
      <>
        <TopBar><div className="wordmark">Discover</div></TopBar>
        <p className="subtitle" role="status">Finding books from Open Library…</p>
      </>
    );
  }
  if (state.discoveryError) {
    return (
      <>
        <TopBar><div className="wordmark">Discover</div></TopBar>
        <p className="form-error page-note" role="alert">{state.discoveryError}</p>
        <div className="page-actions"><Button onClick={actions.startDiscovery}>Try again</Button></div>
      </>
    );
  }
  if (state.discoveredIds.length >= state.discoverGoal || !state.currentDiscoveryBook) {
    if (!state.currentDiscoveryBook && state.discoveredIds.length === 0) {
      return (
        <>
          <TopBar><div className="wordmark">Discover</div></TopBar>
          <EmptyState title="No Open Library results">
            Try another time or search Open Library directly.
          </EmptyState>
          <div className="page-actions"><Button onClick={actions.startDiscovery}>Try again</Button></div>
        </>
      );
    }
    return <DiscoveryResults />;
  }
  return <DiscoverySession />;
}
