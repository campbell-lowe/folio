import { useState } from 'react';
import { useFolio } from '../useFolio.js';
import { Avatar } from '../components/BookCover.jsx';
import { Button, PageTitle, Subtitle, TopBar } from '../components/Shared.jsx';

const avatarColors = ['#B7A1C9', '#D9A6AD', '#A8B9A0', '#C6A467', '#8FB3C9'];

export default function ProfileScreen() {
  const { state, actions } = useFolio();
  const [draft, setDraft] = useState(state.profile);
  const booksOnList = Object.keys(state.bookshelf).length;
  const booksOnShelf = Object.values(state.bookshelf).filter((book) => book.shelved).length;

  function submit(event) {
    event.preventDefault();
    actions.updateProfile({
      name: draft.name.trim(),
      handle: draft.handle.trim().replace(/^@+/, '').replace(/\s+/g, ''),
      bio: draft.bio.trim(),
      avatarColor: draft.avatarColor,
    });
  }

  return (
    <>
      <TopBar>
        <Button variant="link" onClick={() => actions.navigate('home')}>‹ Home</Button>
        <b>Profile</b>
        <Button variant="link" onClick={() => actions.navigate('library')}>Bookshelf</Button>
      </TopBar>
      <section className="profile-heading">
        <Avatar color={draft.avatarColor} className="profile-avatar" />
        <h1>{draft.name || 'Your reader profile'}</h1>
        {draft.handle && <p className="muted">@{draft.handle.replace(/^@+/, '')}</p>}
        {draft.bio && <p>{draft.bio}</p>}
      </section>
      <div className="profile-stats">
        <div><b>{booksOnList}</b><span>Books on my list</span></div>
        <div><b>{booksOnShelf}</b><span>On my shelf</span></div>
      </div>
      <form className="profile-form" onSubmit={submit}>
        <PageTitle>Reader profile</PageTitle>
        <Subtitle>This guest profile is stored in this browser. No account or sign-in is needed.</Subtitle>
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
          <Button type="button" variant="outline" onClick={() => actions.navigate('find')}>
            Find books to add
          </Button>
        </div>
      </form>
    </>
  );
}
