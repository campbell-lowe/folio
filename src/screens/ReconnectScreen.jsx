import { books } from '../data.js';
import { useFolio } from '../useFolio.js';
import { BookCover } from '../components/BookCover.jsx';
import { Button, EmptyState, PageTitle, SegmentedControl, Subtitle, TopBar } from '../components/Shared.jsx';

export default function ReconnectScreen({ feed = false, content = false }) {
  const { state, actions } = useFolio();
  const currentBook = books.find((book) => book.id === state.readingBookId);
  const eligibleBooks = books.filter((book) =>
    ['reading', 'paused'].includes(state.bookshelf[book.id]?.status),
  );

  if (feed) {
    const finishedBooks = books.filter((book) => state.bookshelf[book.id]?.status === 'finished');
    return (
      <>
        <TopBar>
          <Button variant="link" onClick={() => actions.navigate('library')}>‹ Bookshelf</Button>
          <b>Finished Books</b>
        </TopBar>
        <PageTitle>Revisit your finished reads</PageTitle>
        <Subtitle>Return to the Book Club when you’re ready for the full conversation.</Subtitle>
        {finishedBooks.length ? (
          finishedBooks.map((book) => (
            <div className="book-row" key={book.id}>
              <BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />
              <div className="book-row-info">
                <b className="serif">{book.title}</b>
                <span className="muted">{book.author}</span>
                <Button variant="small" onClick={() => actions.openBook(book.id, 'spoilers')}>
                  Revisit spoilers
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No finished books yet">Finished books will be collected here.</EmptyState>
        )}
      </>
    );
  }

  if (content) {
    if (!currentBook) return <EmptyState title="Choose a book first">Start a reconnect session from your bookshelf.</EmptyState>;
    const progress = state.bookshelf[state.readingBookId]?.progress;
    return (
      <>
        <section className="book-hero reconnect-hero" style={{ '--cover-from': currentBook.from, '--cover-to': currentBook.to }}>
          <Button variant="outline" onClick={() => actions.navigate('reconnect')}>‹</Button>
          <div className="who-row">
            <BookCover book={currentBook} size="sm" />
            <div>
              <h2>{currentBook.title}</h2>
              <p>{state.chapter ? `Safe through chapter ${state.chapter}. Nothing later is shown.` : 'Progress not set, so spoiler protection is extra conservative.'}</p>
            </div>
          </div>
        </section>
        <div className="card card-content">
          <span className="muted">Why you wanted this book</span>
          <p className="book-quote">“The storms, the slow-burn friendship, the sense of a huge world.”</p>
        </div>
        {[
          ['@lunareads', 'The first big storm scene hit me again, in a good way.'],
          ['@pagesandplum', 'Chapter by chapter, the characters get so much richer.'],
          ['@inkedmargins', 'The worldbuilding pays off for patient readers.'],
        ].map(([name, text]) => (
          <article className="card club-item" key={name}>
            <div className="thumbnail" style={{ '--cover-from': currentBook.from, '--cover-to': currentBook.to }}>Safe</div>
            <div><b>{name}</b><p>{text}</p></div>
          </article>
        ))}
        <h3 className="section-heading">A small goal for tonight</h3>
        <SegmentedControl
          options={['Ten pages', 'One chapter', 'Five minutes'].map((value) => ({ value, label: value }))}
          value={state.readingGoal}
          onChange={actions.setReadingGoal}
        />
        {state.readingGoal && (
          <p className="subtitle">Goal set: {state.readingGoal.toLowerCase()}. No streaks, no pressure.</p>
        )}
        <div className="page-actions">
          <Button onClick={() => actions.navigate('library')}>Back to reading</Button>
          <Button variant="link" onClick={actions.pauseReadingBook}>This book isn’t for me right now</Button>
        </div>
        <span className="visually-hidden">{progress || 0}% progress</span>
      </>
    );
  }

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={() => actions.navigate('library')}>‹ Bookshelf</Button>
      </TopBar>
      <PageTitle>Reconnect with your book</PageTitle>
      <Subtitle>No pressure. Choose the book you’re already reading.</Subtitle>
      {eligibleBooks.length ? (
        eligibleBooks.map((book) => (
          <button
            type="button"
            className={`reconnect-book ${state.readingBookId === book.id ? 'selected' : ''}`}
            key={book.id}
            onClick={() => {
              actions.setReadingBookId(book.id);
              actions.setChapter(Math.max(1, Math.round((state.bookshelf[book.id].progress || 0) / 2)));
            }}
          >
            <BookCover book={book} size="xs" />
            <span><b className="serif">{book.title}</b><small>{state.bookshelf[book.id].progress || 0}% read</small></span>
          </button>
        ))
      ) : (
        <EmptyState title="No books in progress">Move a book to Reading or Paused to reconnect with it.</EmptyState>
      )}
      {eligibleBooks.length > 0 && (
        <>
          <div className="chapter-control">
            <b>Where are you? Chapter {state.chapter || '?'}</b>
            <input
              type="range"
              min="1"
              max="60"
              value={state.chapter || 1}
              aria-label="Current chapter"
              onChange={(event) => actions.setChapter(Number(event.target.value))}
            />
            <Button variant="link" onClick={() => actions.setChapter(0)}>
              I’m not sure, keep it extra safe
            </Button>
          </div>
          <div className="page-actions">
            <Button onClick={() =>             actions.showReconnectContent()}>Show me the good stuff</Button>
          </div>
        </>
      )}
    </>
  );
}
