import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Albums from './pages/Albums';
import Licensing from './pages/Licensing';
import Donate from './pages/Donate';
import Remix from './pages/Remix';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-200">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/licensing" element={<Licensing />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/remix" element={<Remix />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;