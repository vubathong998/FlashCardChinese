import FlashcardPage from './pages/flashCardPage/FlashcardPage.jsx';
import HomePage from './pages/homePage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/myflashcard" element={<FlashcardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
