import { creators, books } from '../data.js';
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

function CreatorPost({ creator }) {
  const { actions } = useFolio();
  const firstBook = books.find((book) => book.id === creator.books[0][0]);

  return (
    <article className="card post-card">
      <div
        className="video-preview"
        style={{ '--cover-from': firstBook.from, '--cover-to': firstBook.to }}
      >
        <BookCover book={firstBook} size="md" />
        <span className="video-duration">0:48 · tap to play</span>
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
        <div className="creator">
          <Avatar color={creator.color} />
          <div>
            <b>@{creator.name}</b>
            <div className="muted">{creator.author ? 'Author' : 'Creator'}</div>
          </div>
        </div>
        <h3 className="post-title">{creator.title}</h3>
        <div className="post-tags">
          {creator.books.map(([bookId, access]) => {
            const book = books.find((item) => item.id === bookId);
            return (
              <button
                type="button"
                key={`${bookId}-${access}`}
                className={`tag ${access === 'spoilers' ? 'spoiler-tag' : ''}`}
                onClick={() => actions.openBook(bookId, access)}
              >
                {book.title} · {access === 'free' ? 'Spoiler-free' : 'Spoilers'}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function HomeScreen() {
  const { state, actions } = useFolio();
  const filtered = creators.filter(
    (creator) => state.feedFilter === 'all' || creator.group === state.feedFilter,
  );

  return (
    <>
      <TopBar>
        <div className="wordmark">Folio</div>
        <Avatar />
      </TopBar>
      <PageTitle>Good evening, Ada</PageTitle>
      <Subtitle>A calm shelf of new posts from readers you follow.</Subtitle>
      <SegmentedControl
        options={[
          { value: 'all', label: 'For you' },
          { value: 'following', label: 'Following' },
          { value: 'interest', label: 'Interests' },
        ]}
        value={state.feedFilter}
        onChange={actions.setFeedFilter}
      />
      {filtered.map((creator) => (
        <CreatorPost key={creator.name} creator={creator} />
      ))}
      <EmptyState title="You’re all caught up">
        Nothing more to scroll tonight. Looking for your next read?
        <Button onClick={() => actions.navigate('discover')}>Start a Discover session</Button>
      </EmptyState>
    </>
  );
}
