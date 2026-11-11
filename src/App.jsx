import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import FlashcardPage from './pages/flashCardPage/FlashcardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TypeGamePage from './pages/typingGame/TypeGamePage.jsx';
import MultipleChoiceGame from './pages/multipleChoiceGame/MultipleChoiceGame.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import { AppLanguageContext } from './utils/appLanguage.js';
import './App.css';

const LANGUAGE_BY_CODE = {
  VI: 'VI',
  CN: 'CN',
  EN: 'EN'
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const localeMatch = location.pathname.match(/\/(VI|CN|EN)\/?$/i);
  const localeCode = localeMatch ? localeMatch[1].toUpperCase() : 'VI';
  const basePath = localeMatch
    ? location.pathname.slice(0, localeMatch.index) || '/'
    : location.pathname;
  const routeLocation = { ...location, pathname: basePath };

  const changeLanguage = (code) => {
    const localizedPath = `${basePath === '/' ? '' : basePath}/${code}`;
    navigate(`${localizedPath}${location.search}${location.hash}`);
  };

  return (
    <AppLanguageContext.Provider value={LANGUAGE_BY_CODE[localeCode]}>
      <SiteHeader localeCode={localeCode} onLanguageChange={changeLanguage} />
      <Routes location={routeLocation}>
        <Route path="/" element={<HomePage />} />
        <Route path="/myflashcard" element={<FlashcardPage />} />
        <Route path="/typegame" element={<TypeGamePage />} />
        <Route path="/multiplechoicegame" element={<MultipleChoiceGame />} />
      </Routes>
    </AppLanguageContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
