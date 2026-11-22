import { useState } from 'react';
import { useFolio } from '../useFolio.js';
import { Avatar, BookCover } from '../components/BookCover.jsx';
import {
  Button,
  EmptyState,
  PageTitle,
  SegmentedControl,
  Subtitle,
  TopBar,
} from '../components/Shared.jsx';
import { demoPosts } from '../demoData.js';

function SocialPost({ post, book }) {
  const { state, actions } = useFolio();
  const [liked, setLiked] = useState(false);
  const postBookIds = post.bookIds?.length ? post.bookIds : (post.bookId ? [post.bookId] : []);
  const mentionedBooks = postBookIds
    .map((bookId) => state.books.find((item) => item.id === bookId))
    .filter(Boolean);
  if (!mentionedBooks.length) return null;
  const primaryBook = mentionedBooks[0];

  return (
    <article className="social-post">
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
        <button
          type="button"
          className="social-profile-details"
          aria-label={`View ${post.author}'s profile`}
          onClick={() => actions.openProfile({
            name: post.author,
            handle: post.handle,
            bio: 'Reader on Folio',
            avatarColor: post.avatarColor,
            role: 'reader',
          })}
        >
          <b>{post.author}</b>
          <span className="muted">{post.handle} · sample reader</span>
        </button>
      </div>

      {post.video && (
        <button
          type="button"
          className="feed-video"
          aria-label={`Play ${post.author}'s book video`}
          onClick={() => actions.notify('Video playback is simulated in this prototype.')}
          style={{ '--cover-from': primaryBook.from, '--cover-to': primaryBook.to }}
        >
          <BookCover book={book} size="lg" design={state.coverDesigns[book.id]} />
          <span className="feed-video-label">
            {post.mode === 'spoilers' ? 'Spoiler discussion' : 'Spoiler-free'}
          </span>
          <span className="feed-video-play" aria-hidden="true">▶</span>
          <span className="feed-video-duration">{post.duration}</span>
        </button>
      )}

      <p>{post.text}</p>
      {mentionedBooks.map((mentionedBook) => (
        <button
          type="button"
          className="social-post-book"
          key={mentionedBook.id}
          onClick={() => actions.openBook(mentionedBook.id, post.mode === 'spoilers' ? 'spoilers' : 'free')}
        >
          <BookCover book={mentionedBook} size="xs" design={state.coverDesigns[mentionedBook.id]} />
          <span>
            <b>{mentionedBook.title}</b>
            <span className="muted">{mentionedBook.author}</span>
          </span>
          <span className="social-post-book-action">Club ›</span>
        </button>
      ))}
      <div className="social-post-actions">
        <Button
          variant="link"
          aria-pressed={liked}
          onClick={() => setLiked((current) => !current)}
        >
          {liked ? '♥ Liked' : `♡ ${post.likes}`}
        </Button>
        <Button
          variant="link"
          onClick={() => actions.openBook(primaryBook.id, post.mode === 'spoilers' ? 'spoilers' : 'free')}
        >
          ◯ {post.comments}
        </Button>
      </div>
    </article>
  );
}

export function HomeScreen() {
  const { state, actions } = useFolio();
  const [feedMode, setFeedMode] = useState('free');
  const displayName = state.profile.name.trim();
  const finishedCount = state.books.filter(
    (book) => state.bookshelf[book.id]?.status === 'finished',
  ).length;
  const posts = [
    ...state.userPosts.filter((post) => post.mode === feedMode),
    ...demoPosts.filter((post) => post.mode === feedMode),
  ].slice(0, 8);

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
      <PageTitle>{displayName ? `Your feed, ${displayName}` : 'Your feed'}</PageTitle>
      <Subtitle>
        {feedMode === 'free'
          ? 'Short videos and posts from readers. No spoilers.'
          : 'Videos and posts after the ending. Enter only if you’re finished.'}
      </Subtitle>
      <SegmentedControl
        className="home-feed-tabs"
        options={[
          { value: 'free', label: 'Spoiler-free' },
          { value: 'spoilers', label: `Spoilers${finishedCount ? ` · ${finishedCount}` : ''}` },
        ]}
        value={feedMode}
        onChange={setFeedMode}
      />

      <section className="feed-section" aria-label={feedMode === 'free' ? 'Spoiler-free feed' : 'Spoiler feed'}>
        {posts.length ? posts.map((post) => (
          <SocialPost
            key={post.id}
            post={post}
            book={state.books.find((item) => item.id === post.bookId)}
          />
        )) : (
          <EmptyState title={feedMode === 'free' ? 'The feed is quiet' : 'No spoiler posts yet'}>
            {feedMode === 'free'
              ? 'New spoiler-free videos and posts will appear here.'
              : 'Finish a book to open spoiler posts and discussion.'}
          </EmptyState>
        )}
      </section>
    </>
  );
}
