import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <h1 className="text-5xl md:text-7xl font-bold mb-2 text-shadow-lg shadow-black/40">
                TAXMATE
              </h1>
              <p className="text-blue-100 text-lg italic">Il tuo assistente fiscale</p>
            </div>
            
            <p className="text-xl mb-8 text-blue-100">
              Calcola tasse, contributi e gestisci le scadenze del regime forfettario
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto text-left">
              <div className="flex items-center space-x-3 bg-blue-600/30 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Calcolo tasse istantaneo</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-600/30 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Gestione fatture</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-600/30 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Calcolo anticipi</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-600/30 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Assistente AI</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link 
                to="/calcola"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-cyan-300 transition-colors transform hover:-translate-y-1 duration-200 flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Anagrafica
              </Link>
              <Link 
                to="/fatture"
                className="bg-blue-800 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:bg-blue-900 transition-colors transform hover:-translate-y-1 duration-200 flex justify-center items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contabilità
              </Link>
            </div>
            
            <div className="mt-12 text-sm text-blue-200 bg-blue-600/30 p-4 rounded-lg max-w-md mx-auto">
              <p>Dati aggiornati al 2025</p>
              <p className="mt-1">Questo strumento è gratuito e non richiede registrazione</p>
              <p className="mt-1">I tuoi dati sono salvati solo sul tuo dispositivo</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;