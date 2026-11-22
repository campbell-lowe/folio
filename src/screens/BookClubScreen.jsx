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
import { demoPosts } from '../demoData.js';
import { Avatar } from '../components/BookCover.jsx';

function ClubPosts({ book, spoilers }) {
  const { actions } = useFolio();
  const matchingPosts = demoPosts.filter((post) =>
    post.bookId === book.id && post.mode === (spoilers ? 'spoilers' : 'free'),
  );
  const hash = [...book.id].reduce(
    (total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0,
    0,
  );
  const readers = [
    ['Nora P.', '@norapages', '#D9A6AD'],
    ['Sam Rivera', '@samreadsafterdark', '#A8B9A0'],
    ['Jules Tan', '@dogeared', '#8FB3C9'],
  ];
  const generatedPosts = readers.map(([author, handle, avatarColor], index) => {
    const freeText = [
      `I’m loving the atmosphere of ${book.title} so far. The opening already has me curious.`,
      `The writing in ${book.title} feels perfect for a slow read. Anyone else noticing the small details?`,
      `Just reached a quiet but memorable chapter in ${book.title}. No plot reveals—still enjoying the setup.`,
    ][index];
    const spoilerText = [
      `That ending to ${book.title} changed how I read the earlier chapters. I keep catching new clues.`,
      `I had to sit with ${book.title} for a while after the last chapter. What did everyone think of that final reveal?`,
      `The biggest surprise in ${book.title} worked for me because the character motives felt earned.`,
    ][index];
    return {
      id: `generated-${book.id}-${spoilers ? 'spoiler' : 'free'}-${index}`,
      author,
      handle,
      avatarColor,
      text: spoilers ? spoilerText : freeText,
      likes: 18 + ((hash + index * 11) % 73),
      comments: 3 + ((hash + index * 7) % 17),
    };
  });
  const posts = matchingPosts.length
    ? [...matchingPosts, ...generatedPosts.slice(0, 1)]
    : generatedPosts;
  return (
    <div className="club-post-list">
      <div className="club-post-compose">
        <span className="muted">
          {posts.length + 84} readers · simulated club
        </span>
        <Button
          variant="small-outline"
          onClick={() => actions.notify('Posting is simulated in this prototype.')}
        >
          Share a thought
        </Button>
      </div>
      {posts.map((post) => (
        <article className="social-post club-post" key={post.id}>
          <div className="social-post-header">
            <Avatar color={post.avatarColor} />
            <div>
              <b>{post.author}</b>
              <span className="muted">{post.handle} · sample reader</span>
            </div>
          </div>
          <p>{post.text}</p>
          <div className="social-post-actions">
            <Button variant="link" onClick={() => actions.notify('Like saved in this prototype.')}>
              ♡ {post.likes}
            </Button>
            <Button variant="link" onClick={() => actions.notify('Comments are simulated in this prototype.')}>
              ◯ {post.comments}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ClubsList() {
  const { state, actions } = useFolio();
  const listedBooks = state.books.filter((book) => state.bookshelf[book.id]?.shelved);

  return (
    <>
      <TopBar><div className="wordmark">Book Clubs</div></TopBar>
      <Subtitle>A separate spoiler-safe and spoiler reading space for every book on your shelf.</Subtitle>
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
        <ClubPosts book={book} spoilers={spoilers} />
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
