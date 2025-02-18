import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ForfettariaCalculator from './components/ForfettariaCalculator';
import GestioneFatture from './components/GestioneFatture';
import LandingPage from './pages/LandingPage';

// Componente Navbar separato
const Navbar = () => {
  const location = useLocation();
  
  // Non mostrare la navbar nella landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Torna alla Home</Link>
        <div className="space-x-4">
          <Link to="/calcola" className="hover:text-blue-200">Calcola Contributi</Link>
          <Link to="/fatture" className="hover:text-blue-200">Gestisci Fatture</Link>
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
      </div>
    </Router>
  );
};

export default App;
