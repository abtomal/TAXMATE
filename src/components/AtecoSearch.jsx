import React, { useState, useMemo } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';

const AtecoSearch = ({ onSelect, selectedCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Funzione di ricerca migliorata
  const filteredAteco = useMemo(() => {
    if (!searchTerm) return [];
    
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return atecoData.filter(ateco => {
      const searchString = `${ateco.codice} ${ateco.descrizione} ${ateco.categoria}`.toLowerCase();
      
      // Tutti i termini di ricerca devono essere presenti
      return searchTerms.every(term => searchString.includes(term));
    }).sort((a, b) => {
      // Prioritizza i risultati che iniziano con il termine di ricerca
      const aStartsWithCode = a.codice.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWithCode = b.codice.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (aStartsWithCode && !bStartsWithCode) return -1;
      if (!aStartsWithCode && bStartsWithCode) return 1;
      
      return 0;
    }).slice(0, 10); // Limita a 10 risultati per performance
  }, [searchTerm]);

  const selectedAteco = atecoData.find(a => a.codice === selectedCode);

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">
        Codice ATECO
      </label>
      
      {/* Campo di ricerca principale */}
      <div className="relative">
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
          className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500"
        />
        {selectedAteco && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              onSelect('');
            }}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Lista risultati */}
      {isOpen && searchTerm && filteredAteco.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
          {filteredAteco.map((ateco) => (
            <button
              key={ateco.codice}
              type="button"
              onClick={() => {
                onSelect(ateco.codice);
                setSearchTerm('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col border-b"
            >
              <span className="font-medium">
                {ateco.codice} - {ateco.categoria}
              </span>
              <span className="text-sm text-gray-600">
                {ateco.descrizione}
              </span>
              <span className="text-sm text-blue-600">
                Coefficiente: {ateco.coefficiente}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Nessun risultato */}
      {isOpen && searchTerm && filteredAteco.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
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