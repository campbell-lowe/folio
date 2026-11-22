import { useState } from 'react';
import { useFolio } from '../useFolio.js';
import { Avatar, BookCover } from '../components/BookCover.jsx';
import { Button, SegmentedControl, TopBar } from '../components/Shared.jsx';

const avatarColors = ['#B7A1C9', '#D9A6AD', '#A8B9A0', '#C6A467', '#8FB3C9'];

export default function ProfileScreen() {
  const { state, actions } = useFolio();
  const [draft, setDraft] = useState(state.profile);
  const [editing, setEditing] = useState(false);
  const viewedProfile = state.profileView;
  const isOwnProfile = !viewedProfile;
  const publicProfile = viewedProfile || state.profile;
  const booksOnList = Object.keys(state.bookshelf).length;
  const booksOnShelf = Object.values(state.bookshelf).filter((book) => book.shelved).length;
  const visibleShelves = state.customShelves.filter((shelf) =>
    shelf.bookIds.some((bookId) => state.bookshelf[bookId]),
  );

  function submit(event) {
    event.preventDefault();
    actions.updateProfile({
      name: draft.name.trim(),
      handle: draft.handle.trim().replace(/^@+/, '').replace(/\s+/g, ''),
      bio: draft.bio.trim(),
      avatarColor: draft.avatarColor,
      role: draft.role || 'reader',
    });
    setEditing(false);
  }

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={actions.back}>‹ Back</Button>
        <b>Profile</b>
        {isOwnProfile ? (
          <Button variant="link" onClick={() => setEditing((current) => !current)}>
            {editing ? 'Done' : 'Edit'}
          </Button>
        ) : <span />}
      </TopBar>
      <section className="profile-heading">
        <Avatar color={publicProfile.avatarColor} className="profile-avatar" />
        <h1>{publicProfile.name || 'Reader'}</h1>
        {publicProfile.handle && <p className="profile-handle">{publicProfile.handle.startsWith('@') ? publicProfile.handle : `@${publicProfile.handle}`}</p>}
        {publicProfile.bio && <p className="profile-bio-public">{publicProfile.bio}</p>}
        <span className="profile-role-badge">
          {(publicProfile.role || 'reader')[0].toUpperCase() + (publicProfile.role || 'reader').slice(1)}
        </span>
      </section>
      {isOwnProfile && (
        <div className="profile-stats">
          <div><b>{booksOnList}</b><span>Books on my list</span></div>
          <div><b>{booksOnShelf}</b><span>On my shelf</span></div>
        </div>
      )}
      {isOwnProfile && editing ? (
        <form className="profile-form profile-edit-card" onSubmit={submit}>
        <h2>Edit profile</h2>
        <p className="muted">Your profile is stored on this device.</p>
        <label>
          Display name
          <input
            className="text-input"
            value={draft.name}
            maxLength={60}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="How readers will see you"
          />
        </label>
        <label>
          Reader handle
          <div className="handle-input">
            <span>@</span>
            <input
              className="text-input"
              value={draft.handle}
              maxLength={30}
              onChange={(event) => setDraft((current) => ({ ...current, handle: event.target.value }))}
              placeholder="yourname"
            />
          </div>
        </label>
        <label>
          About me
          <textarea
            className="text-input profile-bio"
            value={draft.bio}
            maxLength={240}
            rows={4}
            onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
            placeholder="What do you like to read?"
          />
          <span className="muted">{draft.bio.length}/240</span>
        </label>
        <fieldset className="profile-role-picker">
          <legend>Posting role</legend>
          <p className="muted">Choose how you contribute to Folio.</p>
          <SegmentedControl
            className="profile-role-options"
            options={[
              { value: 'reader', label: 'Reader' },
              { value: 'creator', label: 'Creator' },
              { value: 'author', label: 'Author' },
            ]}
            value={draft.role || 'reader'}
            onChange={(role) => setDraft((current) => ({ ...current, role }))}
          />
        </fieldset>
        <fieldset className="avatar-picker">
          <legend>Profile color</legend>
          <div className="color-palette">
            {avatarColors.map((color) => (
              <button
                type="button"
                key={color}
                className={`color-swatch ${draft.avatarColor === color ? 'selected' : ''}`}
                style={{ background: color }}
                aria-label={`Choose profile color ${color}`}
                aria-pressed={draft.avatarColor === color}
                onClick={() => setDraft((current) => ({ ...current, avatarColor: color }))}
              />
            ))}
          </div>
        </fieldset>
        <div className="page-actions">
          <Button type="submit">Save profile</Button>
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
        </form>
      ) : (
        <section className="profile-shelves">
          <div className="profile-section-heading">
            <h2>Featured shelves</h2>
            {isOwnProfile && <Button variant="link" onClick={() => actions.navigate('library')}>Manage</Button>}
          </div>
          {visibleShelves.length ? visibleShelves.map((shelf) => {
            const books = shelf.bookIds
              .map((bookId) => state.books.find((book) => book.id === bookId))
              .filter(Boolean);
            return (
              <article className="profile-shelf" key={shelf.id}>
                <div className="profile-shelf-heading">
                  <div>
                    <h3>{shelf.name}</h3>
                    <span className="muted">{books.length} {books.length === 1 ? 'book' : 'books'}</span>
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="small-outline"
                      onClick={() => actions.navigate('library')}
                    >
                      View shelf
                    </Button>
                  )}
                </div>
                <div className="profile-shelf-covers">
                  {books.slice(0, 6).map((book) => (
                    <button
                      type="button"
                      className="profile-shelf-cover"
                      key={book.id}
                      aria-label={`Open ${book.title}`}
                      onClick={() => actions.openBook(book.id)}
                    >
                      <BookCover
                        book={book}
                        size="sm"
                        design={state.coverDesigns[book.id]}
                      />
                    </button>
                  ))}
                </div>
              </article>
            );
          }) : (
            <div className="profile-empty-shelf">
              <p>{isOwnProfile ? 'No featured shelves yet.' : 'This reader has no public shelves.'}</p>
              {isOwnProfile && (
                <Button variant="outline" onClick={() => actions.navigate('library')}>
                  Create a shelf
                </Button>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
