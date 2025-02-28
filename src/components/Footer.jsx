// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonna 1 - Info principali */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-lg font-semibold mb-3">Taxmate</h3>
            <p className="text-sm">
              Strumento per il calcolo delle tasse e dei contributi, gestione delle fatture e delle scadenze.
              <br className="hidden md:block" />
              Le fatture vengono memorizzate all'interno della memoria del tuo dispositivo.
            </p>
          </div>

          {/* Colonna 2 - Links utili */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-lg font-semibold mb-3">Link Utili</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a 
                href="https://www.agenziaentrate.gov.it" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors bg-gray-700 px-3 py-1 rounded-full inline-block"
              >
                Agenzia delle Entrate
              </a>
              <a 
                href="https://www.inps.it" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors bg-gray-700 px-3 py-1 rounded-full inline-block"
              >
                INPS
              </a>
            </div>
          </div>

          {/* Colonna 3 - Contatti/Info */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-lg font-semibold mb-3">Informazioni</h3>
            <div className="text-sm space-y-1">
              <p>Dati aggiornati al 2025</p>
              <p>Idea di Matteo Roiatti</p>
              <p>Sviluppato da Alessandro Ponton</p>
              <p>Versione Alpha</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} Taxmate. Tutti i diritti riservati.</p>
          <p className="mt-2 text-gray-400 max-w-md mx-auto">
            Le informazioni fornite sono solo a scopo indicativo. 
            Consulta sempre un professionista per decisioni fiscali.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;