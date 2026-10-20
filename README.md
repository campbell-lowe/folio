# Folio

Folio is a React reading-list prototype built with Vite. It uses Open Library for book search and cover images. There are no account creation or sign-in screens: profile, bookshelf, and cover preferences are stored in the current browser.

## Run locally

```sh
npm install
npm run dev
```

Run the production checks with:

```sh
npm run lint
npm run build
```

## Add books

Search by title or author in **Bookshelf → Find books to add**. Search results come from the Open Library Search API. Books can be added to the local bookshelf, with their Open Library work key used as the stable ID.

To import a reading list, choose a CSV file on the **Add books** screen. Goodreads exports work directly: Folio recognizes the Goodreads `Title`, `Author`, `ISBN`/`ISBN13`, and `Exclusive Shelf` columns. It uses ISBNs when available, matches the title and author against Open Library, and carries over read/currently-reading/to-read status.

Other CSV files can use a `title` header and optionally an `author` header, for example:

```csv
title,author
"A book title",An author
"Another title","Another author"
```

Folio looks up each row in Open Library and lets you select the matching edition/work before adding the matched books. Imports are limited to 500 rows at a time. Rows without a match are not added. Only ISBNs or title/author search terms are sent to Open Library; Goodreads reviews, private notes, and other CSV fields are not uploaded.

## Home feed and shelves

The home feed combines books in your local library with live Open Library titles; it does not invent posts or other readers. The bookshelf can list all books and filter by shelf status or reading status. Preview Pro in the bookshelf to create and rename shelves, search/filter your books by author, and add all filtered books to a shelf.

## Local data

The reader profile, books, bookshelf status, saved discoveries, cover preferences, and named shelves are stored in browser `localStorage` under `folio.guest.v1`. They are not synchronized to a server or another device. Reader ratings are collected in the current app session only.
