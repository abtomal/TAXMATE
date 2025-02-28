import React, { useState, useEffect } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';
import { cercaCodiciAteco, getCodiceByCodice } from '../services/ateco-service.js';

const AtecoSearch = ({ onSelect, selectedCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // State per il codice selezionato
  const [selectedAteco, setSelectedAteco] = useState(null);
  
  // Carica il dettaglio del codice selezionato
  useEffect(() => {
    const loadSelectedAteco = async () => {
      if (selectedCode) {
        // Prima cerca nei risultati già caricati
        const found = searchResults.find(item => item.codice === selectedCode);
        if (found) {
          setSelectedAteco(found);
          return;
        }
        
        // Cerca nel dataset forfettario (sincronamente)
        const foundInData = atecoData.find(item => item.codice === selectedCode);
        if (foundInData) {
          setSelectedAteco(foundInData);
          return;
        }
        
        // Se non lo trova, cerca nel dataset completo
        try {
          const result = await getCodiceByCodice(selectedCode);
          setSelectedAteco(result);
        } catch (error) {
          console.error("Errore nel caricare il codice selezionato:", error);
        }
      } else {
        setSelectedAteco(null);
      }
    };
    
    loadSelectedAteco();
  }, [selectedCode, searchResults]);
  
  // Gestisce la ricerca
  useEffect(() => {
    const search = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const results = await cercaCodiciAteco(searchTerm, 10);
        setSearchResults(results);
      } catch (error) {
        console.error("Errore nella ricerca:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce
    const timer = setTimeout(() => {
      search();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Codice ATECO
      </label>
      
      {/* Campo di ricerca principale */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={selectedAteco 
            ? `${selectedAteco.codice} - ${selectedAteco.descrizione}`
            : "Cerca per codice, descrizione o categoria..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full p-2 pl-9 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
        {selectedAteco && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              onSelect('');
            }}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Lista risultati */}
      {isOpen && searchTerm && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((ateco) => (
            <button
              key={ateco.codice}
              type="button"
              onClick={() => {
                onSelect(ateco.codice);
                setSearchTerm('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {ateco.codice}
                </span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {ateco.coefficiente}%
                </span>
              </div>
              <span className="text-sm text-gray-600 my-1 line-clamp-2">
                {ateco.descrizione}
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {ateco.categoria}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stato di caricamento */}
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
          <div className="flex justify-center items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Ricerca in corso...</span>
          </div>
        </div>
      )}

      {/* Nessun risultato */}
      {isOpen && searchTerm && !isLoading && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
          <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Nessun codice ATECO trovato
        </div>
      )}

      {/* Input nascosto per il valore effettivo */}
      <input
        type="hidden"
        name="codiceAteco"
        value={selectedCode}
        required
      />
    </div>
  );
};

export default AtecoSearch;