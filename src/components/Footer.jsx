// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonna 1 - Info principali */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Calcolatore Forfettario</h3>
            <p className="text-sm">
              Strumento per il calcolo delle tasse e dei contributi, gestione delle fatture e delle scadenze.<br></br>
              Le fatture vengono memorizzate all'interno della memoria del tuo dispositivo.
            </p>
          </div>

          {/* Colonna 2 - Links utili */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Link Utili</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.agenziaentrate.gov.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Agenzia delle Entrate
                </a>
              </li>
              <li>
                <a 
                  href="https://www.inps.it" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  INPS
                </a>
              </li>
            </ul>
          </div>

          {/* Colonna 3 - Contatti/Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Informazioni</h3>
            <div className="text-sm space-y-2">
              <p>Dati aggiornati al 2025</p>
              <p>Idea di Matteo Roiatti</p>
              <p>Sviluppato da Alessandro Ponton</p>
              <p>Versione Alpha</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>© {new Date().getFullYear()} Taxmate. Tutti i diritti riservati.</p>
          <p className="mt-2 text-gray-400">
            Le informazioni fornite sono solo a scopo indicativo. 
            Consulta sempre un professionista per decisioni fiscali.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;