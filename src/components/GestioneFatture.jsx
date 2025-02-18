import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { atecoData } from '../data/ateco-forfettario.js';

const GestioneFatture = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    coefficienteRedditività: 0,
    descrizione: '',
    dataEmissione: new Date().toISOString().split('T')[0]
  });

  const [fattureSalvate, setFattureSalvate] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAteco, setFilteredAteco] = useState([]);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('fatture');
    if (savedInvoices) {
      setFattureSalvate(JSON.parse(savedInvoices));
    }
  }, []);

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

  const salvaFattura = (e) => {
    e.preventDefault();
    
    const nuovaFattura = {
      ...formData,
      id: Date.now(),
      dataRegistrazione: new Date().toISOString()
    };

    const nuoveFatture = [...fattureSalvate, nuovaFattura];
    setFattureSalvate(nuoveFatture);
    localStorage.setItem('fatture', JSON.stringify(nuoveFatture));

    setFormData({
      fatturato: '',
      codiceAteco: '',
      coefficienteRedditività: 0,
      descrizione: '',
      dataEmissione: new Date().toISOString().split('T')[0]
    });
  };

  const rimuoviFattura = (id) => {
    const nuoveFatture = fattureSalvate.filter(f => f.id !== id);
    setFattureSalvate(nuoveFatture);
    localStorage.setItem('fatture', JSON.stringify(nuoveFatture));
  };

  const calcolaTotali = () => {
    const totale = fattureSalvate.reduce((acc, fattura) => acc + parseFloat(fattura.fatturato), 0);
    return {
      totale,
      numeroFatture: fattureSalvate.length
    };
  };

  const totali = calcolaTotali();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 m-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Fatture</h1>
      </div>

      <form onSubmit={salvaFattura} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Importo Fattura (€)
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
              Data Emissione
            </label>
            <input
              type="date"
              value={formData.dataEmissione}
              onChange={(e) => setFormData({...formData, dataEmissione: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
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
                    coefficienteRedditività: 0
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
                      coefficienteRedditività: ateco.coefficiente
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
                    {ateco.categoria}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descrizione
          </label>
          <textarea
            value={formData.descrizione}
            onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        </div>

        <button
          type="submit"
          disabled={!formData.fatturato || !formData.codiceAteco}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Registra Fattura
        </button>
      </form>

      {fattureSalvate.length > 0 && (
        <div className="mt-8">
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-2">Riepilogo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Numero Fatture</p>
                <p className="text-lg font-medium">{totali.numeroFatture}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Fatturato</p>
                <p className="text-lg font-medium">€ {totali.totale.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Fatture Registrate</h3>
          <div className="space-y-2">
            {fattureSalvate.map((fattura) => (
              <div key={fattura.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <p className="font-medium">€ {parseFloat(fattura.fatturato).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{new Date(fattura.dataEmissione).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Codice ATECO: {fattura.codiceAteco} ({fattura.coefficienteRedditività}%)
                  </p>
                  {fattura.descrizione && (
                    <p className="text-sm text-gray-600">{fattura.descrizione}</p>
                  )}
                </div>
                <button
                  onClick={() => rimuoviFattura(fattura.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneFatture;