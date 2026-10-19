import { useState } from 'react';
import { books, clubPosts, statusLabels } from '../data.js';
import { useFolio } from '../useFolio.js';
import { Avatar, BookCover } from '../components/BookCover.jsx';
import { BookRow, Button, EmptyState, PageTitle, SegmentedControl, Subtitle, TopBar } from '../components/Shared.jsx';
import { ContentRatingCard, ContentRatingChip } from './RatingsScreen.jsx';

function ClubsList() {
  const { state, actions } = useFolio();
  const listedBooks = books.filter((book) => state.bookshelf[book.id]);
  return (
    <>
      <TopBar><div className="wordmark">Book Clubs</div></TopBar>
      <Subtitle>A club for every book on your list. Each one shows only that book.</Subtitle>
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
        <EmptyState title="No clubs yet">Add a book to your list to join its club.</EmptyState>
      )}
      <div className="page-actions">
        <Button variant="outline" onClick={() => actions.navigate('find')}>Find a book to add</Button>
      </div>
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
          This area covers endings, twists and theories. Add {book.title} to your list to open it.
          Any book on your list counts, and adding a book doesn’t mean you’ve finished it.
        </p>
        <Button onClick={() => actions.openAddSheet(book.id)}>Add to my list</Button>
        <Button variant="link" onClick={() => actions.setSpoilerTab('free')}>Stay spoiler-free</Button>
      </section>
    </div>
  );
}

function ClubPostList({ spoiler }) {
  const { state, actions } = useFolio();
  const book = books.find((item) => item.id === state.currentBookId);
  const staticPosts = clubPosts[spoiler ? 'spoilers' : 'free'];
  const comments = state.comments[book.id] || [];
  const [comment, setComment] = useState('');

  function submitComment(event) {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return;
    actions.updateComment(book.id, trimmed);
    setComment('');
  }

  return (
    <>
      {spoiler && (
        <div className="spoiler-warning">
          <span>Spoilers ahead for {book.title}</span>
          <button type="button" onClick={() => actions.notify('Thanks, we’ll review how this is labeled.')}>
            Report label
          </button>
        </div>
      )}
      {staticPosts.map(([title, author, description, type]) => (
        <article className="card club-item" key={title}>
          <div className="thumbnail" style={{ '--cover-from': book.from, '--cover-to': book.to }}>
            {type}
          </div>
          <div>
            <b>{title}</b>
            <div className="muted">{author}</div>
            <span>{description}</span>
          </div>
        </article>
      ))}
      <h3 className="section-heading">Discussion</h3>
      <div className="comment-row">
        <Avatar color="#B7A1C9" />
        <p><b>Mira</b><br />Anyone else reading along this week?</p>
      </div>
      {comments.map((text, index) => (
        <div className="comment-row" key={`${index}-${text}`}>
          <Avatar color="#D9A6AD" />
          <p><b>Ada</b><br />{text}</p>
        </div>
      ))}
      <form className="comment-form" onSubmit={submitComment}>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          aria-label="Add a comment"
          placeholder="Join the conversation"
        />
        <Button variant="small">Reply</Button>
      </form>
    </>
  );
}

function BookDetail() {
  const { state, actions } = useFolio();
  const book = books.find((item) => item.id === state.currentBookId);
  const entry = state.bookshelf[book.id];
  const spoilers = state.spoilerTab === 'spoilers';

  return (
    <>
      <section className="book-hero" style={{ '--cover-from': book.from, '--cover-to': book.to }}>
        <Button variant="outline" className="back-button" aria-label="Back" onClick={actions.back}>‹</Button>
        <BookCover book={book} size="lg" design={state.coverDesigns[book.id]} />
        <h2>{book.title}</h2>
        <p>{book.author} · Fantasy</p>
        <p className="book-stats">12.4k readers · 312 posts</p>
      </section>
      <div className="page-actions">
        <Button
          variant={entry ? 'outline' : 'primary'}
          onClick={() => actions.openAddSheet(book.id)}
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
        <ClubPostList spoiler={spoilers} />
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
      <PageTitle>Posting is for Creators and Authors</PageTitle>
      <Subtitle>
        Readers join the conversation inside Book Clubs. Creators publish videos and posts.
      </Subtitle>
      <section className="card card-content">
        <b>Every post needs book tags</b>
        <p className="muted">
          Each tagged book gets its own spoiler label, so one video can be safe for one book and
          spoilery for another.
        </p>
        <div className="post-tags">
          {['Choose type', 'Add media', 'Tag books', 'Spoiler labels', 'Preview hubs', 'Publish'].map(
            (step, index) => (
              <span className={`tag ${index % 2 ? 'purple-tag' : ''}`} key={step}>
                {index + 1}. {step}
              </span>
            ),
          )}
        </div>
      </section>
      <div className="page-actions">
        <Button onClick={() => actions.notify('Creator applications aren’t part of this prototype.')}>
          Learn about Creator accounts
        </Button>
        <Button variant="outline" onClick={() => actions.navigate('clubs')}>
          Join a Book Club instead
        </Button>
      </div>
    </>
  );
}

export function FindBookScreen() {
  const { state, actions } = useFolio();
  const matches = books.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase().includes(state.searchQuery.toLowerCase()),
  );
  return (
    <>
      <TopBar>
        <Button variant="link" onClick={() => actions.navigate('library')}>‹ Bookshelf</Button>
        <b>Find a book</b>
      </TopBar>
      <PageTitle>Add a book to your list</PageTitle>
      <Subtitle>Search by title or author. Adding a book opens its Book Club.</Subtitle>
      <div className="search-box">
        <input
          className="text-input"
          value={state.searchQuery}
          onChange={(event) => actions.setSearchQuery(event.target.value)}
          placeholder="Search titles or authors"
          aria-label="Search books"
        />
      </div>
      {matches.length ? (
        matches.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            cover={<BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />}
            onOpen={() => actions.openBook(book.id)}
          >
            <ContentRatingChip bookId={book.id} />
            <Button
              variant={state.bookshelf[book.id] ? 'small-outline' : 'small'}
              onClick={() => actions.openAddSheet(book.id)}
            >
              {state.bookshelf[book.id] ? '✓ Added' : '+ Add'}
            </Button>
          </BookRow>
        ))
      ) : (
        <EmptyState title="No matches">Try another title or author.</EmptyState>
      )}
    </>
  );
}
