import React, { useState } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';
import { COSTANTI } from '../utils/calcolatori.js';

const CalcoloForm = ({ formData, setFormData, onSubmit, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAteco, setFilteredAteco] = useState([]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredAteco([]);
      return;
    }

    const searchTerms = term.toLowerCase().split(' ').filter(t => t.length > 0);
    
    const filtered = atecoData.filter(ateco => {
      const searchString = `${ateco.codice} ${ateco.descrizione} ${ateco.categoria}`.toLowerCase();
      return searchTerms.every(t => searchString.includes(t));
    }).sort((a, b) => {
      const aStartsWithCode = a.codice.toLowerCase().startsWith(term.toLowerCase());
      const bStartsWithCode = b.codice.toLowerCase().startsWith(term.toLowerCase());
      if (aStartsWithCode && !bStartsWithCode) return -1;
      if (!aStartsWithCode && bStartsWithCode) return 1;
      return 0;
    }).slice(0, 10);

    setFilteredAteco(filtered);
    setIsOpen(true);
  };

  const mostraFatturatoPrecedente = () => {
    const annoCorrente = new Date().getFullYear();
    return parseInt(formData.annoApertura) < annoCorrente;
  };

  const getTipologiaLabel = () => {
    if (!formData.codiceAteco) return "Seleziona un codice ATECO";
    
    const selectedAteco = atecoData.find(a => a.codice === formData.codiceAteco);
    if (!selectedAteco) return "Tipologia non determinata";
    
    return selectedAteco.tipo === 'artigiano' ? "Artigiano" : "Commerciante";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calcolatore Partita IVA Forfettaria</h1>

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
            max={COSTANTI.LIMITE_FATTURATO}
            required
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Codice ATECO
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca per codice, descrizione o categoria..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500"
            />
            {formData.codiceAteco && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFormData({
                    ...formData,
                    codiceAteco: '',
                    coefficienteRedditività: 0,
                    tipologiaInps: 'commerciante'
                  });
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {isOpen && searchTerm && filteredAteco.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
              {filteredAteco.map((ateco) => (
                <button
                  key={ateco.codice}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      codiceAteco: ateco.codice,
                      coefficienteRedditività: ateco.coefficiente,
                      tipologiaInps: ateco.tipo || 'commerciante'
                    });
                    setSearchTerm(ateco.codice);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col border-b"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {ateco.codice}
                    </span>
                    <span className="text-sm text-blue-600">
                      {ateco.coefficiente}%
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {ateco.descrizione}
                  </span>
                  <span className="text-xs text-gray-500">
                    {ateco.categoria} - {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {isOpen && searchTerm && filteredAteco.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              Nessun codice ATECO trovato
            </div>
          )}
        </div>

        {formData.codiceAteco && (
          <div className="p-3 bg-gray-50 rounded border">
            <p className="text-sm text-gray-600">Tipologia contribuente</p>
            <p className="font-medium">{getTipologiaLabel()}</p>
          </div>
        )}

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

        {mostraFatturatoPrecedente() && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Fatturato Anno Precedente (€)
            </label>
            <input
              type="number"
              value={formData.fatturatoPrecedente}
              onChange={(e) => setFormData({...formData, fatturatoPrecedente: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              max={COSTANTI.LIMITE_FATTURATO}
            />
          </div>
        )}

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

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Calcola
        </button>
      </form>
    </div>
  );
};

export default CalcoloForm;