import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ForfettariaCalculator from './components/ForfettariaCalculator';
import GestioneFatture from './components/gestioneFatture/GestioneFatture';
import LandingPage from './pages/LandingPage';
import AssistenteAI from './components/AssistenteAI';

// Componente Navbar migliorato
const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Non mostrare la navbar nella landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-blue-600 text-white p-4 sticky top-0 z-30 shadow-md">
      <div className="max-w-4xl mx-auto">
        {/* Versione Desktop */}
        <div className="hidden md:flex justify-between items-center">
          <Link to="/" className="text-xl hover:text-blue-200 font-bold flex items-center">
            <span className="mr-2">TAXMATE</span>
          </Link>
          <div className="space-x-6">
            <Link to="/calcola" className="hover:text-blue-200 font-bold transition-colors duration-200">Anagrafica</Link>
            <Link to="/fatture" className="hover:text-blue-200 font-bold transition-colors duration-200">Contabilità</Link>
          </div>
        </div>

        {/* Versione Mobile */}
        <div className="md:hidden">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">TAXMATE</Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
              aria-label="Menu di navigazione"
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

          {/* Menu mobile con animazione */}
          <div 
            className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-2 py-2">
              <Link 
                to="/calcola" 
                className="block py-2 px-4 hover:bg-blue-700 rounded-lg font-bold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Anagrafica
              </Link>
              <Link 
                to="/fatture" 
                className="block py-2 px-4 hover:bg-blue-700 rounded-lg font-bold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contabilità
              </Link>
            </div>
          </div>
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