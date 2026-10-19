import { useCallback, useState } from 'react';
import { books, initialBookshelf, rainbowPalette } from './data.js';
import { addSurvey } from './ratingData.js';
import { FolioContext } from './folioContext.js';

export function FolioProvider({ children }) {
  const [screen, setScreen] = useState('home');
  const [bookshelf, setBookshelf] = useState(initialBookshelf);
  const [currentBookId, setCurrentBookId] = useState('hc');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [spoilerTab, setSpoilerTab] = useState('free');
  const [feedFilter, setFeedFilter] = useState('all');
  const [discoverGoal, setDiscoverGoal] = useState(3);
  const [discoverIndex, setDiscoverIndex] = useState(0);
  const [discoveredIds, setDiscoveredIds] = useState([]);
  const [discoveryStarted, setDiscoveryStarted] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [discoveryDecision, setDiscoveryDecision] = useState(false);
  const [addingBookId, setAddingBookId] = useState(null);
  const [addFromDiscovery, setAddFromDiscovery] = useState(false);
  const [libraryTab, setLibraryTab] = useState('reading');
  const [proReader, setProReader] = useState(false);
  const [shelfTheme, setShelfTheme] = useState('#D9A6AD');
  const [coverDesigns, setCoverDesigns] = useState({
    ms: { mode: 'custom', background: '#D9A6AD', text: 'auto' },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [comments, setComments] = useState({});
  const [toast, setToast] = useState('');
  const [readingBookId, setReadingBookId] = useState('wok');
  const [chapter, setChapter] = useState(22);
  const [readingGoal, setReadingGoal] = useState('');
  const [surveyBookId, setSurveyBookId] = useState('wok');
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState({});

  const notify = useCallback((message) => setToast(message), []);
  const isOnList = useCallback((bookId) => Boolean(bookshelf[bookId]), [bookshelf]);
  const shelvedCount = Object.values(bookshelf).filter((book) => book.shelved).length;

  const navigate = useCallback((tab) => {
    if (tab === 'discover') setDiscoveryStarted(false);
    setScreen(tab);
    setSpoilerTab('free');
    setToast('');
  }, []);

  const openBook = useCallback(
    (bookId, tab = 'free') => {
      setPreviousScreen(screen);
      setCurrentBookId(bookId);
      setSpoilerTab(tab);
      setScreen('book');
    },
    [screen],
  );

  const back = useCallback(() => {
    setScreen(previousScreen);
  }, [previousScreen]);

  const openRatings = useCallback(
    (bookId) => {
      setPreviousScreen(screen);
      setCurrentBookId(bookId);
      setScreen('ratings');
    },
    [screen],
  );

  const openAddSheet = useCallback((bookId, fromDiscovery = false) => {
    if (fromDiscovery) setDiscoveryDecision(false);
    setAddingBookId(bookId);
    setAddFromDiscovery(fromDiscovery);
  }, []);

  const closeAddSheet = useCallback(() => {
    setAddingBookId(null);
    if (addFromDiscovery) {
      setAddFromDiscovery(false);
      setDiscoveryDecision(true);
    }
  }, [addFromDiscovery]);

  const finishDiscoveryBook = useCallback(
    (bookId, shouldSave = false) => {
      setDiscoveryDecision(false);
      if (shouldSave && !savedIds.includes(bookId)) {
        setSavedIds((saved) => [...saved, bookId]);
      }
      const nextDiscovered = [...discoveredIds, bookId];
      setDiscoveredIds(nextDiscovered);
      if (nextDiscovered.length >= discoverGoal) {
        setScreen('discover');
        setDiscoverIndex(0);
      } else {
        setDiscoverIndex((index) => index + 1);
      }
    },
    [discoverGoal, discoveredIds, savedIds],
  );

  const startDiscovery = useCallback(() => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryDecision(false);
    setDiscoveryStarted(true);
    setScreen('discover');
  }, []);

  const leaveDiscovery = useCallback(() => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryStarted(false);
    setDiscoveryDecision(false);
    setScreen('discover');
  }, []);

  const finishDiscovery = useCallback(() => {
    setDiscoveredIds([]);
    setDiscoverIndex(0);
    setDiscoveryStarted(false);
    setScreen('library');
    setLibraryTab('want');
  }, []);

  const skipDiscoveryBook = useCallback(() => {
    setDiscoveryDecision(false);
    setDiscoverIndex((index) => index + 1);
  }, []);

  const discoveryCandidates = books.filter(
    (book) => !bookshelf[book.id] && !discoveredIds.includes(book.id),
  );
  const currentDiscoveryBook =
    discoveryCandidates.length > 0
      ? discoveryCandidates[discoverIndex % discoveryCandidates.length]
      : null;

  const updateStatus = useCallback(
    (bookId, status) => {
      const existing = bookshelf[bookId];
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
      notify(existing ? 'Status updated.' : 'Added to your list. Its club and spoilers are open.');
    },
    [addFromDiscovery, bookshelf, finishDiscoveryBook, notify, proReader, shelvedCount],
  );

  const removeFromList = useCallback(() => {
    if (addingBookId) {
      setBookshelf((current) => {
        const next = { ...current };
        delete next[addingBookId];
        return next;
      });
    }
    setAddingBookId(null);
    setAddFromDiscovery(false);
    notify('Removed from your list.');
  }, [addingBookId, notify]);

  const toggleShelved = useCallback(
    (bookId) => {
      const book = bookshelf[bookId];
      if (book?.shelved) {
        setBookshelf((current) => ({
          ...current,
          [bookId]: { ...current[bookId], shelved: false },
        }));
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

  const updateComment = useCallback((bookId, text) => {
    setComments((current) => ({
      ...current,
      [bookId]: [...(current[bookId] || []), text],
    }));
  }, []);

  const beginSurvey = useCallback(
    (bookId) => {
      setSurveyBookId(bookId);
      setSurveyAnswers({});
      setSurveyStep(0);
      setScreen('survey');
    },
    [],
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
    setBookshelf((current) => ({
      ...current,
      [readingBookId]: { ...current[readingBookId], status: 'paused' },
    }));
    setScreen('library');
    setLibraryTab('paused');
    notify('No guilt. It’s on your Paused shelf whenever you’re ready.');
  }, [readingBookId, notify]);

  const submitSurvey = useCallback(
    (survey) => {
      addSurvey(surveyBookId, survey);
      setScreen('ratings');
      notify('Thanks! Your survey updated the community rating.');
    },
    [surveyBookId, notify],
  );

  const state = {
    screen,
    bookshelf,
    currentBookId,
    previousScreen,
    spoilerTab,
    feedFilter,
    discoverGoal,
    discoverIndex,
    discoveredIds,
    discoveryStarted,
    savedIds,
    discoveryDecision,
    addingBookId,
    libraryTab,
    proReader,
    shelfTheme,
    coverDesigns,
    searchQuery,
    comments,
    toast,
    readingBookId,
    chapter,
    readingGoal,
    surveyBookId,
    surveyStep,
    surveyAnswers,
    currentDiscoveryBook,
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
    removeFromList,
    toggleShelved,
    updateCover,
    setAllCoverColors,
    setRainbowCovers,
    resetCovers,
    updateComment,
    beginSurvey,
    submitSurvey,
    startReconnect,
    showReconnectFeed,
    showReconnectContent,
    pauseReadingBook,
    setFeedFilter,
    setSpoilerTab,
    setDiscoverGoal,
    setDiscoverIndex,
    setDiscoveredIds,
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
    setBookshelf,
    isOnList,
    shelvedCount,
  };

  const value = { state, actions };

  return <FolioContext.Provider value={value}>{children}</FolioContext.Provider>;
}
