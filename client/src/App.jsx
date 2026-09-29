import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WardrobeProvider } from './context/WardrobeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TryOn from './pages/TryOn'
import StyleAdvisor from './pages/StyleAdvisor'
import Wardrobe from './pages/Wardrobe'

export default function App() {
  return (
    <WardrobeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/try-on"       element={<TryOn />} />
              <Route path="/style-advisor" element={<StyleAdvisor />} />
              <Route path="/wardrobe"     element={<Wardrobe />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WardrobeProvider>
  )
}
