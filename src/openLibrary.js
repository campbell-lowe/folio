const OPEN_LIBRARY = 'https://openlibrary.org';
const SEARCH_FIELDS = 'key,title,author_name,cover_i,isbn,first_publish_year,subject';
const coverColors = [
  ['#35557c', '#101c33'],
  ['#8a2f4f', '#33121f'],
  ['#2f7a78', '#122f3c'],
  ['#a24a65', '#4a1a33'],
  ['#8a6a3b', '#3f2b1a'],
  ['#4f6b45', '#1f3326'],
  ['#6b4e8a', '#271a3d'],
  ['#3a6f92', '#1a2f45'],
];

function stableNumber(value) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0);
}

function toBook(document) {
  if (typeof document.key !== 'string' || !document.key.startsWith('/works/')) return null;
  const id = document.key.replace('/works/', '');
  if (!id || typeof document.title !== 'string') return null;
  const colors = coverColors[stableNumber(id) % coverColors.length];

  return {
    id,
    key: document.key,
    title: document.title,
    author: document.author_name?.[0] || 'Unknown author',
    isbn: Array.isArray(document.isbn) ? document.isbn[0] || '' : '',
    isbns: Array.isArray(document.isbn) ? document.isbn : [],
    coverUrl: document.cover_i
      ? `https://covers.openlibrary.org/b/id/${document.cover_i}-M.jpg?default=false`
      : null,
    year: document.first_publish_year || null,
    subjects: Array.isArray(document.subject) ? document.subject.slice(0, 5) : [],
    from: colors[0],
    to: colors[1],
    motif: stableNumber(id) % 3,
    hook: '',
  };
}

export async function searchBooks(query, signal) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];
  const url =
    `${OPEN_LIBRARY}/search.json?q=${encodeURIComponent(trimmedQuery)}` +
    `&limit=12&fields=${SEARCH_FIELDS}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Open Library ${response.status}`);
  const result = await response.json();
  if (!Array.isArray(result.docs)) {
    throw new Error('Open Library returned an invalid search response.');
  }
  return result.docs.map(toBook).filter(Boolean);
}

export function parseBooksCsv(contents) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const input = contents.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field.trim());
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('The CSV contains an unclosed quoted field.');
  row.push(field.trim());
  if (row.some((value) => value.length)) rows.push(row);
  if (rows.length < 2) throw new Error('The CSV must contain a header and at least one book.');

  const header = rows[0].map((value) => value.toLowerCase().replace(/[\s_-]/g, ''));
  const titleIndex = header.findIndex((value) => ['title', 'book', 'booktitle'].includes(value));
  const authorIndex = header.findIndex((value) => ['author', 'authors', 'creator'].includes(value));
  const isbnIndices = header.flatMap((value, index) =>
    ['isbn', 'isbn13', 'isbn10'].includes(value) ? [index] : [],
  );
  const shelfIndex = header.findIndex((value) => ['exclusiveshelf', 'readingstatus'].includes(value));
  if (titleIndex === -1) throw new Error('The CSV needs a "title" column.');

  const books = rows
    .slice(1)
    .map((values, index) => {
      const shelf = shelfIndex === -1
        ? ''
        : (values[shelfIndex] || '').toLowerCase().replace(/[\s_-]/g, '');
      return {
        row: index + 2,
        title: values[titleIndex] || '',
        author: authorIndex === -1 ? '' : values[authorIndex] || '',
        isbn: isbnIndices
          .map((index) => (values[index] || '').replace(/^="?/, '').replace(/"?$/, '').trim())
          .find(Boolean) || '',
        status: shelf === 'read' || shelf === 'finished'
          ? 'finished'
          : shelf === 'currentlyreading' || shelf === 'reading'
            ? 'reading'
            : 'want',
      };
    })
    .filter((item) => item.title);
  if (!books.length) throw new Error('No book titles were found in the CSV.');
  if (books.length > 500) throw new Error('Import up to 500 books at a time.');
  return books;
}
