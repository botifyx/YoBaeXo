import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Albums from './pages/Albums';
import Licensing from './pages/Licensing';
import Donate from './pages/Donate';
import Remix from './pages/Remix';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

function App() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setIsChatOpen((prev: boolean) => !prev);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-200 relative">
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

        {/* Chatbot Toggle Icon */}
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 via-cyan-500 to-violet-500 text-white rounded-full shadow-2xl hover:shadow-neon-pink hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center"
          aria-label="Open Chatbot"
        >
          <MessageCircle className="h-7 w-7" />
        </button>

        {/* Chatbot */}
        {isChatOpen && (
          <Chatbot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;