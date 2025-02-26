import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ForfettariaCalculator from './components/ForfettariaCalculator';
import GestioneFatture from './components/GestioneFatture';
import LandingPage from './pages/LandingPage';
import AssistenteAI from './components/AssistenteAI';

// Componente Navbar separato
const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Non mostrare la navbar nella landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Versione Desktop */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="text-l">Torna alla Home</Link>
          <div className="space-x-4">
            <Link to="/calcola" className="hover:text-blue-200 font-bold">Calcola Contributi</Link>
            <Link to="/fatture" className="hover:text-blue-200 font-bold">Gestisci Fatture</Link>
          </div>
        </div>

        {/* Versione Mobile */}
        <div className="md:hidden">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-l">Torna alla Home</Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 focus:outline-none"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <div className="mt-4 space-y-2">
              <Link 
                to="/calcola" 
                className="block py-2 px-4 hover:bg-blue-700 rounded font-bold"
                onClick={() => setIsMenuOpen(false)}
              >
                Calcola Contributi
              </Link>
              <Link 
                to="/fatture" 
                className="block py-2 px-4 hover:bg-blue-700 rounded font-bold"
                onClick={() => setIsMenuOpen(false)}
              >
                Gestisci Fatture
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/calcola" element={<ForfettariaCalculator />} />
          <Route path="/fatture" element={<GestioneFatture />} />
        </Routes>
        {/* Assistente AI flottante presente in tutte le pagine */}
        <AssistenteAI />
      </div>
    </Router>
  );
};

export default App;