import { useState } from 'react';
import { statusLabels } from '../data.js';
import { useFolio } from '../useFolio.js';
import { BookCover } from '../components/BookCover.jsx';
import { BookSearch } from '../components/BookSearch.jsx';
import {
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
  const { state, actions } = useFolio();
  const matchingPosts = [
    ...state.userPosts.filter((post) =>
      (post.bookIds?.includes(book.id) || post.bookId === book.id)
      && post.mode === (spoilers ? 'spoilers' : 'free'),
    ),
    ...demoPosts.filter((post) =>
      post.bookId === book.id && post.mode === (spoilers ? 'spoilers' : 'free'),
    ),
  ];
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
            <button
              type="button"
              className="social-profile-button"
              aria-label={`View ${post.author}'s profile`}
              onClick={() => actions.openProfile({
                name: post.author,
                handle: post.handle,
                bio: 'Reader on Folio',
                avatarColor: post.avatarColor,
                role: 'reader',
              })}
            >
              <Avatar color={post.avatarColor} />
            </button>
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const listedBooks = state.books
    .filter((book) => state.bookshelf[book.id])
    .filter((book) => {
      const entry = state.bookshelf[book.id];
      const searchText = `${book.title} ${book.author}`.toLowerCase();
      if (search && !searchText.includes(search.trim().toLowerCase())) return false;
      if (statusFilter === 'off-shelf') return !entry.shelved;
      if (statusFilter === 'all') return true;
      return entry.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'status') {
        const aStatus = statusLabels[state.bookshelf[a.id].status];
        const bStatus = statusLabels[state.bookshelf[b.id].status];
        return aStatus.localeCompare(bStatus);
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <>
      <TopBar><div className="wordmark">Book Clubs</div></TopBar>
      <PageTitle>Your reading circles</PageTitle>
      <Subtitle>Talk with readers in spoiler-free or spoiler spaces.</Subtitle>
      <div className="club-toolbar">
        <label className="club-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your clubs"
            aria-label="Search book clubs"
          />
        </label>
        <div className="club-filter-row">
          <SegmentedControl
            className="club-filters"
            options={[
              { value: 'all', label: 'All' },
              { value: 'reading', label: 'Reading' },
              { value: 'want', label: 'Want to read' },
              { value: 'finished', label: 'Finished' },
              { value: 'paused', label: 'Paused' },
              { value: 'off-shelf', label: 'Off shelf' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <label className="club-sort">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
        <p className="club-results muted">
          {listedBooks.length} {listedBooks.length === 1 ? 'club' : 'clubs'}
        </p>
      </div>
      {listedBooks.length ? (
        <div className="club-book-list">
          {listedBooks.map((book) => {
            const entry = state.bookshelf[book.id];
            return (
              <button
                type="button"
                className="club-book-row"
                key={book.id}
                onClick={() => actions.openBook(book.id)}
              >
                <BookCover book={book} size="sm" design={state.coverDesigns[book.id]} />
                <span className="club-book-copy">
                  <b className="serif">{book.title}</b>
                  <span>{book.author}</span>
                  <span className="club-status">
                    {statusLabels[entry.status]}
                    {!entry.shelved && ' · Off shelf'}
                  </span>
                </span>
                <span className="club-open" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState title={search || statusFilter !== 'all' ? 'No matching clubs' : 'No books or clubs yet'}>
          {search || statusFilter !== 'all'
            ? 'Try a different search or filter.'
            : 'Search Open Library or import a CSV to add books to your library.'}
          {!search && statusFilter === 'all' && (
            <Button onClick={() => actions.navigate('find')}>Find books to add</Button>
          )}
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
  const { state, actions } = useFolio();
  const role = state.profile.role || 'reader';
  const [text, setText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [mode, setMode] = useState('free');
  const [format, setFormat] = useState('text');
  const [kind, setKind] = useState('discussion');
  const [search, setSearch] = useState('');

  const query = search.trim().toLocaleLowerCase();
  const availableBooks = state.books
    .filter((book) => !query || `${book.title} ${book.author}`.toLocaleLowerCase().includes(query))
    .slice(0, 12);

  function toggleBook(bookId) {
    setSelectedIds((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId],
    );
  }

  function publish() {
    if (!text.trim()) {
      actions.notify('Write something before posting.');
      return;
    }
    if (!selectedIds.length) {
      actions.notify('Select at least one book for this post.');
      return;
    }
    actions.publishPost({
      text,
      bookIds: selectedIds,
      mode,
      format: role === 'creator' ? format : 'text',
      kind: role === 'author' ? kind : 'discussion',
    });
  }

  return (
    <>
      <TopBar><div className="wordmark">Create</div></TopBar>
      <PageTitle>{role === 'reader' ? 'Start a conversation' : role === 'creator' ? 'Share with readers' : 'Share from the author’s desk'}</PageTitle>
      <Subtitle>
        {role === 'reader'
          ? 'Text posts are shared in the spoiler-free or spoiler Book Clubs you tag.'
          : role === 'creator'
            ? 'Post text or a video and tag every book mentioned.'
            : 'Share discussion or promotional material and tag the related book.'}
      </Subtitle>
      {role !== 'reader' && (
        <SegmentedControl
          className="post-format-options"
          options={role === 'creator'
            ? [
                { value: 'text', label: 'Text' },
                { value: 'video', label: 'Video' },
              ]
            : [
                { value: 'discussion', label: 'Discussion' },
                { value: 'promotion', label: 'Promotional' },
              ]}
          value={role === 'creator' ? format : kind}
          onChange={role === 'creator' ? setFormat : setKind}
        />
      )}
      {role === 'author' && kind === 'promotion' && (
        <section className="author-release-note">
          <b>Promotional post</b>
          <span className="muted">Released books must be tagged. Upcoming books can be added here.</span>
        </section>
      )}
      <section className="post-composer">
        <label>
          <span>{role === 'author' && kind === 'promotion' ? 'Promotional text' : 'Post text'}</span>
          <textarea
            className="text-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            maxLength={1000}
            placeholder={role === 'author' ? 'Share your update or promotion…' : 'What are you thinking about?'}
          />
          <span className="muted post-character-count">{text.length}/1000</span>
        </label>
        {role === 'creator' && format === 'video' && (
          <div className="post-video-placeholder">
            <span aria-hidden="true">▶</span>
            <b>Video attachment</b>
            <span className="muted">Video uploading is available in the full app.</span>
          </div>
        )}
        <fieldset className="post-spoiler-options">
          <legend>Discussion type</legend>
          <SegmentedControl
            options={[
              { value: 'free', label: 'No spoilers' },
              { value: 'spoilers', label: 'Contains spoilers' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </fieldset>
        <fieldset className="post-book-picker">
          <legend>Mentioned books</legend>
          <input
            className="text-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or author"
            aria-label="Search mentioned books"
          />
          <div className="post-book-options">
            {availableBooks.map((book) => (
              <label key={book.id} className={selectedIds.includes(book.id) ? 'selected' : ''}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(book.id)}
                  onChange={() => toggleBook(book.id)}
                />
                <BookCover book={book} size="xs" design={state.coverDesigns[book.id]} />
                <span>
                  <b>{book.title}</b>
                  <span className="muted">{book.author}</span>
                </span>
              </label>
            ))}
          </div>
          <Button variant="link" onClick={() => actions.navigate('find')}>＋ Add or find a book</Button>
        </fieldset>
        <div className="page-actions">
          <Button onClick={publish}>Post to Book Clubs</Button>
          <Button variant="outline" onClick={() => actions.navigate('clubs')}>Cancel</Button>
        </div>
      </section>
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
