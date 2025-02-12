import ForfettariaCalculator from '../components/ForfettariaCalculator';
import { Link } from 'react-router-dom';

const CalculatorPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
          ← Torna alla home
        </Link>
        <ForfettariaCalculator />
      </div>
    </div>
  );
};

export default CalculatorPage;