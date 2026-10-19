const motifs = [
  <path
    key="moon"
    d="M20 12a8 8 0 1 1-8-8 6 6 0 0 0 8 8Z"
  />,
  <path
    key="star"
    d="m12 3 2.2 6.3 6.3.2-5 4 1.8 6.3L12 16l-5.3 3.8 1.8-6.3-5-4 6.3-.2L12 3Z"
  />,
  <path
    key="leaf"
    d="M5 19C5 9 10 4 20 4c0 10-5 15-15 15Zm0 0 9-9"
  />,
];

function textColor(background, choice) {
  if (choice && choice !== 'auto') return choice;
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/.{2}/g)
      .map((channel) => parseInt(channel, 16) / 255)
      .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrast = (foreground) => {
    const values = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  return contrast('#FAF5EF') >= contrast('#2B1B2E') ? '#FAF5EF' : '#2B1B2E';
}

export function BookCover({ book, size = 'md', design, className = '' }) {
  const customized = design?.mode === 'custom';
  return (
    <div
      className={`book-cover ${size}${customized ? ' customized' : ''} ${className}`}
      style={
        customized
          ? { background: design.background, color: textColor(design.background, design.text) }
          : { '--cover-from': book.from, '--cover-to': book.to }
      }
      aria-label={`${book.title} by ${book.author}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        aria-hidden="true"
      >
        {motifs[book.motif]}
      </svg>
      <b>{book.title}</b>
      <small>{book.author}</small>
      {book.isbn && !customized && (
        <img
          src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`}
          alt=""
          loading="lazy"
          onError={(event) => event.currentTarget.remove()}
        />
      )}
    </div>
  );
}

export function Avatar({ color = '#B7A1C9', className = '' }) {
  return <span className={`avatar ${className}`} style={{ background: color }} aria-hidden="true" />;
}
