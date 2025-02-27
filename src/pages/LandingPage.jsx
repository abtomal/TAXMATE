import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow-lg shadow-black/40">
               TAXMATE
          </h1>
            
            <p className="text-xl mb-8 text-blue-100">
              Strumento per calcolare tasse, contributi e scadenze del regime forfettario
            </p>

            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Calcolo immediato delle tasse</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Calcolo degli anticipi</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Gestione delle fatture</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link 
                to="/calcola"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-cyan-300 transition-colors"
              >
                Anagrafica
              </Link>
              <Link 
                to="/fatture"
                className="bg-blue-800 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-cyan-600 transition-colors"
              >
                Contabilità
              </Link>
            </div>
            
            <div className="mt-16 text-sm text-blue-200">
              <p>Dati aggiornati al 2025</p>
              <p>Questo strumento è al momento gratuito e non richiede registrazione</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;