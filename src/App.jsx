import { useState } from 'react'
import FlashcardPage from './pages/FlashcardPage.jsx'
import HomePage from './pages/HomePage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/myflashcard" element={<FlashcardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
