import { statusLabels } from '../data.js';
import { useFolio } from '../useFolio.js';
import { BookCover } from '../components/BookCover.jsx';
import { BookSearch } from '../components/BookSearch.jsx';
import {
  BookRow,
  Button,
  EmptyState,
  PageTitle,
  SegmentedControl,
  Subtitle,
  TopBar,
} from '../components/Shared.jsx';
import { ContentRatingCard } from './RatingsScreen.jsx';

function ClubsList() {
  const { state, actions } = useFolio();
  const listedBooks = state.books.filter((book) => state.bookshelf[book.id]);

  return (
    <>
      <TopBar><div className="wordmark">Book Clubs</div></TopBar>
      <Subtitle>A separate reading space for every book on your list.</Subtitle>
      {listedBooks.length ? (
        listedBooks.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            cover={<BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />}
            onOpen={() => actions.openBook(book.id)}
          >
            <span className="muted">{statusLabels[state.bookshelf[book.id].status]}</span>
            <Button variant="small" onClick={() => actions.openBook(book.id)}>Open club</Button>
          </BookRow>
        ))
      ) : (
        <EmptyState title="No books or clubs yet">
          Search Open Library or import a CSV to add books to your library.
          <Button onClick={() => actions.navigate('find')}>Find books to add</Button>
        </EmptyState>
      )}
    </>
  );
}

function LockedSpoilers({ book }) {
  const { actions } = useFolio();
  return (
    <div className="spoiler-lock">
      <div className="spoiler-skeleton" aria-hidden="true">
        <i /><i /><i />
      </div>
      <section className="spoiler-lock-card">
        <span className="lock-icon" aria-hidden="true">⌑</span>
        <h3>Spoilers are locked</h3>
        <p>
          Add {book.title} to your list to open spoiler discussion. A book on your list does not
          have to be marked finished.
        </p>
        <Button onClick={() => actions.openAddSheet(book)}>Add to my list</Button>
        <Button variant="link" onClick={() => actions.setSpoilerTab('free')}>Stay spoiler-free</Button>
      </section>
    </div>
  );
}

function BookDetail() {
  const { state, actions } = useFolio();
  const book =
    state.books.find((item) => item.id === state.currentBookId) || state.activeBook;
  if (!book) {
    return (
      <EmptyState title="Book not found">
        Search Open Library to find this book again.
        <Button onClick={() => actions.navigate('find')}>Search books</Button>
      </EmptyState>
    );
  }
  const entry = state.bookshelf[book.id];
  const spoilers = state.spoilerTab === 'spoilers';

  return (
    <>
      <section className="book-hero" style={{ '--cover-from': book.from, '--cover-to': book.to }}>
        <Button variant="outline" className="back-button" aria-label="Back" onClick={actions.back}>‹</Button>
        <BookCover book={book} size="lg" design={state.coverDesigns[book.id]} />
        <h2>{book.title}</h2>
        <p>{book.author}</p>
        {book.year && <p className="book-stats">First published {book.year}</p>}
        {book.subjects?.length > 0 && (
          <p className="book-subjects">{book.subjects.slice(0, 3).join(' · ')}</p>
        )}
      </section>
      <div className="page-actions">
        <Button
          variant={entry ? 'outline' : 'primary'}
          onClick={() => actions.openAddSheet(book)}
        >
          {entry ? `✓ On My List · ${statusLabels[entry.status]} ▾` : 'Add to My List'}
        </Button>
      </div>
      <ContentRatingCard bookId={book.id} />
      <SegmentedControl
        options={[
          { value: 'free', label: 'Spoiler-free' },
          { value: 'spoilers', label: `Spoilers${entry ? '' : ' ⌑'}` },
        ]}
        value={state.spoilerTab}
        onChange={actions.setSpoilerTab}
      />
      {spoilers && !entry ? (
        <LockedSpoilers book={book} />
      ) : (
        <EmptyState title="No discussions yet">
          Book Club discussions will appear here when there are reader posts.
        </EmptyState>
      )}
    </>
  );
}

export function BookClubScreen() {
  const { state } = useFolio();
  return state.screen === 'book' ? <BookDetail /> : <ClubsList />;
}

export function CreateScreen() {
  const { actions } = useFolio();
  return (
    <>
      <TopBar><div className="wordmark">Create</div></TopBar>
      <PageTitle>Share your reading life</PageTitle>
      <Subtitle>
        Reader profiles are local for now. Creator publishing will be available when Folio supports accounts.
      </Subtitle>
      <section className="card card-content">
        <h2>Build your profile first</h2>
        <p className="muted">
          Add your name, reader handle, and favorite books. You do not need to create an account or sign in.
        </p>
      </section>
      <div className="page-actions">
        <Button onClick={() => actions.navigate('profile')}>Open my profile</Button>
        <Button variant="outline" onClick={() => actions.navigate('clubs')}>Visit Book Clubs</Button>
      </div>
    </>
  );
}

export function FindBookScreen() {
  const { actions } = useFolio();
  return (
    <>
      <TopBar>
        <Button variant="link" onClick={() => actions.navigate('library')}>‹ Bookshelf</Button>
        <b>Add books</b>
      </TopBar>
      <PageTitle>Build your bookshelf</PageTitle>
      <Subtitle>Search Open Library or import your reading list from a CSV file.</Subtitle>
      <BookSearch onOpenAdd={(book) => actions.openAddSheet(book)} />
    </>
  );
}
