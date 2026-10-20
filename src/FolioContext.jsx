import { useCallback, useEffect, useState } from 'react';
import { rainbowPalette } from './data.js';
import { addSurvey } from './ratingData.js';
import { searchBooks } from './openLibrary.js';
import { FolioContext } from './folioContext.js';

const STORAGE_KEY = 'folio.guest.v1';
const defaultProfile = { name: '', handle: '', bio: '', avatarColor: '#B7A1C9' };

function readSavedWorkspace() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const data = JSON.parse(saved);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (error) {
    console.error('Could not load the local Folio profile.', error);
    return {};
  }
}

export function FolioProvider({ children }) {
  const [savedWorkspace] = useState(readSavedWorkspace);
  const [screen, setScreen] = useState('home');
  const [bookshelf, setBookshelf] = useState(savedWorkspace.bookshelf || {});
  const [books, setBooks] = useState(savedWorkspace.books || []);
  const [profile, setProfile] = useState({ ...defaultProfile, ...savedWorkspace.profile });
  const [coverDesigns, setCoverDesigns] = useState(savedWorkspace.coverDesigns || {});
  const [savedIds, setSavedIds] = useState(savedWorkspace.savedIds || []);
  const [currentBookId, setCurrentBookId] = useState('');
  const [activeBook, setActiveBook] = useState(null);
  const [previousScreen, setPreviousScreen] = useState('home');
  const [spoilerTab, setSpoilerTab] = useState('free');
  const [discoverGoal, setDiscoverGoal] = useState(3);
  const [discoverIndex, setDiscoverIndex] = useState(0);
  const [discoveredIds, setDiscoveredIds] = useState([]);
  const [discoveryBooks, setDiscoveryBooks] = useState([]);
  const [discoveryStarted, setDiscoveryStarted] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState('');
  const [discoveryDecision, setDiscoveryDecision] = useState(false);
  const [addingBookId, setAddingBookId] = useState(null);
  const [addFromDiscovery, setAddFromDiscovery] = useState(false);
  const [libraryTab, setLibraryTab] = useState('all');
  const [proReader, setProReader] = useState(Boolean(savedWorkspace.proReader));
  const [shelfTheme, setShelfTheme] = useState(savedWorkspace.shelfTheme || '#D9A6AD');
  const [customShelves, setCustomShelves] = useState(savedWorkspace.customShelves || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [readingBookId, setReadingBookId] = useState('');
  const [chapter, setChapter] = useState(1);
  const [readingGoal, setReadingGoal] = useState('');
  const [surveyBookId, setSurveyBookId] = useState('');
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({});

  const notify = useCallback((message) => setToast(message), []);
  const shelvedCount = Object.values(bookshelf).filter((book) => book.shelved).length;

  useEffect(() => {
    const reportStorageError = () => {
      setToast('Your changes could not be saved in this browser.');
    };
    window.addEventListener('folio-storage-error', reportStorageError);
    return () => window.removeEventListener('folio-storage-error', reportStorageError);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          books,
          bookshelf,
          coverDesigns,
          savedIds,
          proReader,
          shelfTheme,
          customShelves,
        }),
      );
    } catch (error) {
      console.error('Could not save the local Folio profile.', error);
      window.dispatchEvent(new Event('folio-storage-error'));
    }
  }, [profile, books, bookshelf, coverDesigns, savedIds, proReader, shelfTheme, customShelves]);

  const navigate = useCallback((tab) => {
    if (tab === 'discover') {
      setDiscoveryStarted(false);
      setDiscoveryError('');
    }
    setScreen(tab);
    setSpoilerTab('free');
    setToast('');
  }, []);

  const addToCatalog = useCallback((book) => {
    setBooks((current) =>
      current.some((item) => item.id === book.id) ? current : [...current, book],
    );
    setActiveBook(book);
  }, []);

  const openBook = useCallback(
    (bookOrId, tab = 'free') => {
      const book = typeof bookOrId === 'string'
        ? books.find((item) => item.id === bookOrId)
        : bookOrId;
      if (!book) {
        notify('Book details are unavailable. Search Open Library to find it again.');
        return;
      }
      addToCatalog(book);
      setPreviousScreen(screen);
      setCurrentBookId(book.id);
      setSpoilerTab(tab);
      setScreen('book');
    },
    [addToCatalog, books, notify, screen],
  );

  const back = useCallback(() => setScreen(previousScreen), [previousScreen]);

  const openRatings = useCallback(
    (bookOrId) => {
      const book = typeof bookOrId === 'string'
        ? books.find((item) => item.id === bookOrId)
        : bookOrId;
      if (!book) {
        notify('Book details are unavailable. Search Open Library to find it again.');
        return;
      }
      addToCatalog(book);
      setPreviousScreen(screen);
      setCurrentBookId(book.id);
      setScreen('ratings');
    },
    [addToCatalog, books, notify, screen],
  );

  const openAddSheet = useCallback(
    (bookOrId, fromDiscovery = false) => {
      const book = typeof bookOrId === 'string'
        ? books.find((item) => item.id === bookOrId)
        : bookOrId;
      if (!book) {
        notify('Book details are unavailable. Search Open Library to find it again.');
        return;
      }
      addToCatalog(book);
      if (fromDiscovery) setDiscoveryDecision(false);
      setAddingBookId(book.id);
      setAddFromDiscovery(fromDiscovery);
    },
    [addToCatalog, books, notify],
  );

  const closeAddSheet = useCallback(() => {
    setAddingBookId(null);
    if (addFromDiscovery) {
      setAddFromDiscovery(false);
      setDiscoveryDecision(true);
    }
  }, [addFromDiscovery]);

  const finishDiscoveryBook = useCallback(
    (bookId, shouldSave = false) => {
      const book = discoveryBooks.find((item) => item.id === bookId);
      if (book) addToCatalog(book);
      setDiscoveryDecision(false);
      if (shouldSave) {
        setSavedIds((current) => current.includes(bookId) ? current : [...current, bookId]);
      }
      const nextDiscovered = [...discoveredIds, bookId];
      setDiscoveredIds(nextDiscovered);
      if (nextDiscovered.length < discoverGoal) {
        setDiscoverIndex((index) => index + 1);
      }
    },
    [addToCatalog, discoverGoal, discoveredIds, discoveryBooks],
  );

  const startDiscovery = useCallback(async () => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryBooks([]);
    setDiscoveryDecision(false);
    setDiscoveryStarted(true);
    setDiscoveryLoading(true);
    setDiscoveryError('');
    setScreen('discover');
    try {
      const results = await searchBooks('subject:fiction');
      setDiscoveryBooks(results.filter((book) => !bookshelf[book.id]));
    } catch (error) {
      console.error('Open Library discovery search failed.', error);
      setDiscoveryError(
        error instanceof Error ? error.message : 'Could not load Open Library recommendations.',
      );
    } finally {
      setDiscoveryLoading(false);
    }
  }, [bookshelf]);

  const leaveDiscovery = useCallback(() => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryStarted(false);
    setDiscoveryDecision(false);
    setDiscoveryBooks([]);
    setScreen('discover');
  }, []);

  const finishDiscovery = useCallback(() => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryStarted(false);
    setDiscoveryBooks([]);
    setScreen('library');
    setLibraryTab('want');
  }, []);

  const skipDiscoveryBook = useCallback(() => {
    setDiscoveryDecision(false);
    setDiscoverIndex((index) => index + 1);
  }, []);

  const currentDiscoveryBook = discoveryBooks[discoverIndex] || null;

  const updateStatus = useCallback(
    (bookId, status) => {
      const existing = bookshelf[bookId];
      const selectedBook = books.find((book) => book.id === bookId) || activeBook;
      if (selectedBook) addToCatalog(selectedBook);
      const canShelve = existing?.shelved ?? (proReader || shelvedCount < 6);
      setBookshelf((current) => ({
        ...current,
        [bookId]: {
          ...current[bookId],
          status,
          shelved: canShelve,
          ...(status === 'reading' && current[bookId]?.progress == null ? { progress: 0 } : {}),
        },
      }));
      setAddingBookId(null);
      if (addFromDiscovery) {
        setAddFromDiscovery(false);
        finishDiscoveryBook(bookId);
        return;
      }
      notify(existing ? 'Status updated.' : 'Added to your list.');
    },
    [
      activeBook,
      addFromDiscovery,
      addToCatalog,
      books,
      bookshelf,
      finishDiscoveryBook,
      notify,
      proReader,
      shelvedCount,
    ],
  );

  const removeFromList = useCallback(() => {
    if (addingBookId) {
      setBookshelf((current) => {
        const next = { ...current };
        delete next[addingBookId];
        return next;
      });
    }
    setCustomShelves((current) => current.map((shelf) => ({
      ...shelf,
      bookIds: shelf.bookIds.filter((bookId) => bookId !== addingBookId),
    })));
    setAddingBookId(null);
    setAddFromDiscovery(false);
    notify('Removed from your list.');
  }, [addingBookId, notify]);

  const importBooks = useCallback(
    (sourceBooks) => {
      const statuses = new Map();
      const importedBooks = sourceBooks.map(({ importStatus, ...book }) => {
        if (['reading', 'finished', 'paused', 'want'].includes(importStatus)) {
          statuses.set(book.id, importStatus);
        }
        return book;
      });
      const seenIds = new Set(Object.keys(bookshelf));
      const additions = importedBooks.filter((book) => {
        if (seenIds.has(book.id)) return false;
        seenIds.add(book.id);
        return true;
      });
      setBooks((current) => {
        const currentIds = new Set(current.map((book) => book.id));
        return [
          ...current,
          ...importedBooks.filter((book) => {
            if (currentIds.has(book.id)) return false;
            currentIds.add(book.id);
            return true;
          }),
        ];
      });
      if (additions.length) {
        setBookshelf((current) => {
          let slots = proReader
            ? additions.length
            : Math.max(0, 6 - Object.values(current).filter((item) => item.shelved).length);
          const next = { ...current };
          additions.forEach((book) => {
            next[book.id] = {
              status: statuses.get(book.id) || 'want',
              shelved: slots > 0,
            };
            if (slots > 0) slots -= 1;
          });
          return next;
        });
      }
      return additions.length;
    },
    [bookshelf, proReader],
  );

  const saveCustomShelf = useCallback(
    ({ id, name, bookIds }) => {
      const shelfId = id || globalThis.crypto.randomUUID();
      const shelf = {
        id: shelfId,
        name: name.trim(),
        bookIds: [...new Set(bookIds)].filter((bookId) => bookshelf[bookId]),
      };
      setCustomShelves((current) => {
        const exists = current.some((item) => item.id === shelfId);
        return exists
          ? current.map((item) => item.id === shelfId ? shelf : item)
          : [...current, shelf];
      });
      setBookshelf((current) => {
        const next = { ...current };
        shelf.bookIds.forEach((bookId) => {
          next[bookId] = { ...next[bookId], shelved: true };
        });
        return next;
      });
      return shelfId;
    },
    [bookshelf],
  );

  const removeCustomShelf = useCallback((shelfId) => {
    setCustomShelves((current) => current.filter((item) => item.id !== shelfId));
  }, []);

  const toggleShelved = useCallback(
    (bookId) => {
      if (bookshelf[bookId]?.shelved) {
        setBookshelf((current) => ({
          ...current,
          [bookId]: { ...current[bookId], shelved: false },
        }));
        setCustomShelves((current) => current.map((shelf) => ({
          ...shelf,
          bookIds: shelf.bookIds.filter((id) => id !== bookId),
        })));
        notify('Taken off your shelf. It’s still on your list and its club is open.');
        return;
      }
      if (!proReader && shelvedCount >= 6) {
        notify('Free shelves hold 6 books. Unshelve one first, or preview Pro.');
        return;
      }
      setBookshelf((current) => ({
        ...current,
        [bookId]: { ...current[bookId], shelved: true },
      }));
    },
    [bookshelf, notify, proReader, shelvedCount],
  );

  const updateCover = useCallback((bookId, changes) => {
    setCoverDesigns((current) => ({
      ...current,
      [bookId]: {
        background: '#D9A6AD',
        text: 'auto',
        ...current[bookId],
        ...changes,
      },
    }));
  }, []);

  const setAllCoverColors = useCallback(
    (bookId) => {
      const background = coverDesigns[bookId]?.background || '#D9A6AD';
      const shelfIds = Object.keys(bookshelf).filter((id) => bookshelf[id].shelved);
      setCoverDesigns((current) => ({
        ...current,
        ...Object.fromEntries(
          shelfIds.map((id) => [
            id,
            { ...current[id], mode: 'custom', background },
          ]),
        ),
      }));
    },
    [coverDesigns, bookshelf],
  );

  const setRainbowCovers = useCallback(() => {
    const shelfIds = Object.keys(bookshelf).filter((id) => bookshelf[id].shelved);
    setCoverDesigns((current) => ({
      ...current,
      ...Object.fromEntries(
        shelfIds.map((id, index) => [
          id,
          {
            ...current[id],
            mode: 'custom',
            background: rainbowPalette[index % rainbowPalette.length],
          },
        ]),
      ),
    }));
  }, [bookshelf]);

  const resetCovers = useCallback(() => {
    setCoverDesigns((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, design]) => [id, { ...design, mode: 'official' }]),
      ),
    );
  }, []);

  const updateProfile = useCallback(
    (changes) => {
      setProfile((current) => ({ ...current, ...changes }));
      setScreen('profile');
      notify('Profile saved on this device.');
    },
    [notify],
  );

  const beginSurvey = useCallback((bookId) => {
    setSurveyBookId(bookId);
    setSurveyAnswers({});
    setSurveyStep(0);
    setScreen('survey');
  }, []);

  const submitSurvey = useCallback(
    (survey) => {
      addSurvey(surveyBookId, survey);
      setScreen('ratings');
      notify('Thanks! Your survey updated this book’s reader ratings on this device.');
    },
    [notify, surveyBookId],
  );

  const startReconnect = useCallback(() => {
    const candidate = Object.entries(bookshelf).find(([, item]) =>
      ['reading', 'paused'].includes(item.status),
    );
    if (candidate) setReadingBookId(candidate[0]);
    setScreen('reconnect');
  }, [bookshelf]);

  const showReconnectFeed = useCallback(() => setScreen('reconnect-feed'), []);
  const showReconnectContent = useCallback(() => setScreen('reconnect-content'), []);

  const pauseReadingBook = useCallback(() => {
    if (!readingBookId || !bookshelf[readingBookId]) {
      notify('Choose a book from your Reading or Paused list first.');
      return;
    }
    setBookshelf((current) => ({
      ...current,
      [readingBookId]: { ...current[readingBookId], status: 'paused' },
    }));
    setScreen('library');
    setLibraryTab('paused');
    notify('No guilt. It’s on your Paused shelf whenever you’re ready.');
  }, [bookshelf, notify, readingBookId]);

  const state = {
    screen,
    books,
    bookshelf,
    profile,
    coverDesigns,
    savedIds,
    currentBookId,
    activeBook,
    previousScreen,
    spoilerTab,
    discoverGoal,
    discoverIndex,
    discoveredIds,
    discoveryBooks,
    discoveryStarted,
    discoveryLoading,
    discoveryError,
    currentDiscoveryBook,
    discoveryDecision,
    addingBookId,
    libraryTab,
    proReader,
    shelfTheme,
    customShelves,
    searchQuery,
    toast,
    readingBookId,
    chapter,
    readingGoal,
    surveyBookId,
    surveyStep,
    surveyAnswers,
  };

  const actions = {
    navigate,
    openBook,
    back,
    openRatings,
    openAddSheet,
    closeAddSheet,
    finishDiscoveryBook,
    startDiscovery,
    leaveDiscovery,
    finishDiscovery,
    skipDiscoveryBook,
    updateStatus,
    importBooks,
    saveCustomShelf,
    removeCustomShelf,
    removeFromList,
    toggleShelved,
    updateCover,
    setAllCoverColors,
    setRainbowCovers,
    resetCovers,
    updateProfile,
    beginSurvey,
    submitSurvey,
    startReconnect,
    showReconnectFeed,
    showReconnectContent,
    pauseReadingBook,
    setSpoilerTab,
    setDiscoverGoal,
    setDiscoverIndex,
    setDiscoveryDecision,
    setLibraryTab,
    setProReader,
    setShelfTheme,
    setSearchQuery,
    setReadingBookId,
    setChapter,
    setReadingGoal,
    setSurveyStep,
    setSurveyAnswers,
    notify,
  };

  return (
    <FolioContext.Provider value={{ state, actions }}>
      {children}
    </FolioContext.Provider>
  );
}
