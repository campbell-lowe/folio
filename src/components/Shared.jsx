export function TopBar({ children, className = '' }) {
  return <div className={`top-bar ${className}`}>{children}</div>;
}

export function PageTitle({ children }) {
  return <h1 className="page-title">{children}</h1>;
}

export function Subtitle({ children }) {
  return <p className="subtitle">{children}</p>;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const classes = {
    primary: 'button',
    outline: 'button outline',
    small: 'small-button',
    'small-outline': 'small-button outline',
    link: 'link-button',
  };
  return (
    <button className={`${classes[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`segmented-control ${className}`}>
      {options.map(({ value: optionValue, label }) => (
        <button
          type="button"
          key={optionValue}
          className={value === optionValue ? 'selected' : ''}
          aria-pressed={value === optionValue}
          onClick={() => onChange(optionValue)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function BookRow({ book, cover, children, onOpen, className = '' }) {
  return (
    <div className={`book-row ${className}`}>
      <button
        type="button"
        className="cover-button"
        aria-label={`Open ${book.title} Book Club`}
        onClick={onOpen}
      >
        {cover}
      </button>
      <div className="book-row-info">
        <b className="serif">{book.title}</b>
        <span className="muted">{book.author}</span>
        {children}
      </div>
    </div>
  );
}
