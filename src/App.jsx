import { FolioProvider } from './FolioContext.jsx';
import { useFolio } from './useFolio.js';
import { BottomNav } from './components/BottomNav.jsx';
import { AddBookSheet, DiscoverySheet, Toast } from './components/Overlays.jsx';
import {
  BookClubScreen,
  ContentRatingsScreen,
  CreateScreen,
  DiscoverScreen,
  FindBookScreen,
  HomeScreen,
  LibraryScreen,
  ProfileScreen,
  ReconnectScreen,
  SurveyScreen,
} from './screens';
import './styles.css';

function FolioApp() {
  const { state } = useFolio();
  const screen = state.screen;

  return (
    <div className="app-shell">
      <main className="main-content" key={screen}>
        {screen === 'home' && <HomeScreen />}
        {screen === 'discover' && <DiscoverScreen />}
        {screen === 'create' && <CreateScreen />}
        {screen === 'clubs' && <BookClubScreen />}
        {screen === 'library' && <LibraryScreen />}
        {screen === 'profile' && <ProfileScreen />}
        {screen === 'find' && <FindBookScreen />}
        {screen === 'book' && <BookClubScreen />}
        {screen === 'ratings' && <ContentRatingsScreen />}
        {screen === 'survey' && <SurveyScreen />}
        {screen === 'reconnect' && <ReconnectScreen />}
        {screen === 'reconnect-feed' && <ReconnectScreen feed />}
        {screen === 'reconnect-content' && <ReconnectScreen content />}
      </main>
      <BottomNav />
      <DiscoverySheet />
      <AddBookSheet />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <FolioProvider>
      <FolioApp />
    </FolioProvider>
  );
}
