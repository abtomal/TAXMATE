// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CalculatorPage from './pages/CalculatorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calcola" element={<CalculatorPage />} />
      </Routes>
    </Router>
  );
}

export default App;