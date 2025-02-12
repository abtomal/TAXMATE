import React, { useState, useRef, useEffect } from 'react';
import { atecoData } from '../data/ateco-forfettario';

const CalcoloForm = ({ formData, setFormData, onSubmit, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredAteco, setFilteredAteco] = useState(atecoData);
  const dropdownRef = useRef(null);

  const filterAteco = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredAteco(atecoData);
      return;
    }
    
    const filtered = atecoData.filter(ateco => 
      ateco.codice.toLowerCase().includes(term.toLowerCase()) ||
      ateco.descrizione.toLowerCase().includes(term.toLowerCase()) ||
      ateco.categoria.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAteco(filtered);
    setIsDropdownOpen(true);
  };

  const handleSelectAteco = (ateco) => {
    setFormData({
      ...formData,
      codiceAteco: ateco.codice,
      coefficienteRedditività: ateco.coefficiente
    });
    setSearchTerm(`${ateco.codice} (${ateco.categoria}) - ${ateco.descrizione}`);
    setIsDropdownOpen(false);
  };

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Fatturato Annuo (€)
        </label>
        <input
          type="number"
          value={formData.fatturato}
          onChange={(e) => setFormData({...formData, fatturato: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tipologia
        </label>
        <select
          value={formData.tipologiaInps}
          onChange={(e) => setFormData({...formData, tipologiaInps: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="commerciante">Commerciante</option>
          <option value="artigiano">Artigiano</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Codice ATECO
        </label>
        <div className="space-y-2" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca per descrizione, codice o categoria..."
              value={searchTerm}
              onChange={(e) => filterAteco(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilteredAteco(atecoData);
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}

            {isDropdownOpen && searchTerm && (
              <div className="absolute z-50 w-full bg-white mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredAteco.length === 0 ? (
                  <div className="p-2 text-gray-500">Nessun risultato trovato</div>
                ) : (
                  filteredAteco.map((ateco) => (
                    <div
                      key={ateco.codice}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectAteco(ateco)}
                    >
                      <div className="font-medium text-sm">
                        {ateco.codice} ({ateco.categoria}) - {ateco.descrizione}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Coefficiente: {ateco.coefficiente}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {formData.codiceAteco && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              {atecoData.find(a => a.codice === formData.codiceAteco)?.note}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Anno di apertura
        </label>
        <input
          type="number"
          value={formData.annoApertura}
          onChange={(e) => setFormData({...formData, annoApertura: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          min="1900"
          max={new Date().getFullYear()}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Reddito da lavoro dipendente (€)
        </label>
        <input
          type="number"
          value={formData.redditoDiLavoro}
          onChange={(e) => setFormData({...formData, redditoDiLavoro: e.target.value})}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pensionato"
            checked={formData.pensionato}
            onChange={(e) => setFormData({...formData, pensionato: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="pensionato">Sei pensionato?</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="altrePartiteIva"
            checked={formData.altrePartiteIva}
            onChange={(e) => setFormData({...formData, altrePartiteIva: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="altrePartiteIva">Hai partecipazioni in società?</label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
      >
        Calcola
      </button>

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
          <h3 className="font-semibold mb-2">Errori riscontrati:</h3>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default CalcoloForm;