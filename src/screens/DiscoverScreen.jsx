import { books } from '../data.js';
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
          Spoiler-free clips only. No autoplay, no endless feed, and nothing extra once you’re done.
        </p>
      </div>
      <div className="page-actions">
        <Button onClick={actions.startDiscovery}>
          Find {state.discoverGoal} new {state.discoverGoal === 1 ? 'book' : 'books'}
        </Button>
      </div>
    </>
  );
}

function DiscoverySession() {
  const { state, actions } = useFolio();
  const book = state.currentDiscoveryBook;
  if (!book) return <DiscoveryResults />;

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
        <div
          className="video-preview discover-preview"
          style={{ '--cover-from': book.from, '--cover-to': book.to }}
        >
          <BookCover book={book} size="lg" />
          <span className="video-duration">Spoiler-free · tap to play</span>
          <button
            type="button"
            className="play-button"
            aria-label="Play video"
            onClick={() => actions.notify('Playback is simulated in this prototype.')}
          >
            ▶
          </button>
        </div>
        <div className="card-content">
          <h2>{book.title}</h2>
          <span className="muted">{book.author}</span>
          <p>{book.hook}</p>
          <ContentRatingChip bookId={book.id} />
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
        const book = books.find((item) => item.id === id);
        return (
          <BookRow
            key={id}
            book={book}
            cover={<BookCover book={book} size="sm" design={state.coverDesigns[id]} />}
            onOpen={() => actions.openBook(id)}
          >
            <span className="muted">{state.bookshelf[id] ? 'On your list' : 'Saved for later'}</span>
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
  const { state } = useFolio();
  if (!state.discoveryStarted) return <DiscoverSetup />;
  if (state.discoveredIds.length >= state.discoverGoal || !state.currentDiscoveryBook) {
    return <DiscoveryResults />;
  }
  return <DiscoverySession />;
}
