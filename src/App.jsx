import FlashcardPage from './pages/flashCardPage/FlashcardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import TypeGamePage from './pages/typingGame/TypeGamePage.jsx';
import MultipleChoiceGame from './pages/multipleChoiceGame/MultipleChoiceGame.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/myflashcard" element={<FlashcardPage />} />
        <Route path="/typegame" element={<TypeGamePage />} />
        <Route path="/multiplechoicegame" element={<MultipleChoiceGame />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
