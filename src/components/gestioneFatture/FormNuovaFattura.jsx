// src/components/gestioneFatture/FormNuovaFattura.jsx
import React from 'react';
import { PlusCircle, Calendar } from 'lucide-react';

const FormNuovaFattura = ({
  mostraFormNuovaFattura,
  formData,
  setFormData,
  datiUtente,
  handleSearch,
  searchTerm,
  setSearchTerm,
  isOpen,
  filteredAteco,
  selezionaAteco,
  salvaFattura
}) => {
  if (!mostraFormNuovaFattura) return null;

  return (
    <div className="mb-6">
      <form onSubmit={salvaFattura} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <PlusCircle className="w-5 h-5 mr-2 text-green-600" />
          Registra nuova fattura
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Importo Fattura (€)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
              <input
                type="number"
                value={formData.fatturato}
                onChange={(e) => setFormData({...formData, fatturato: e.target.value})}
                className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Data Emissione
              </label>
              <div className="relative">
                {!formData.dataEmissione && (
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                )}
                <input
                  type="date"
                  value={formData.dataEmissione}
                  onChange={(e) => setFormData({...formData, dataEmissione: e.target.value})}
                  className={`w-full p-2 ${!formData.dataEmissione ? 'pl-8' : 'pl-3'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Data Scadenza
              </label>
              <div className="relative">
                {!formData.dataScadenza && (
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                )}
                <input
                  type="date"
                  value={formData.dataScadenza}
                  onChange={(e) => setFormData({...formData, dataScadenza: e.target.value})}
                  className={`w-full p-2 ${!formData.dataScadenza ? 'pl-8' : 'pl-3'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
            </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Codice ATECO
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cerca per codice, descrizione o categoria..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full p-2 pl-8 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {isOpen && searchTerm && filteredAteco.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
              {filteredAteco.map((ateco) => (
                <button
                  key={ateco.codice}
                  type="button"
                  onClick={() => selezionaAteco(ateco)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b"
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

          {isOpen && searchTerm && filteredAteco.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
              <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nessun codice ATECO trovato
            </div>
          )}
          
          {!formData.codiceAteco && datiUtente.codiceAteco && (
            <p className="text-xs text-gray-500 mt-1">
              <svg className="w-4 h-4 inline-block mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verrà utilizzato il codice ATECO principale se non ne selezioni un altro.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Descrizione
          </label>
          <textarea
            value={formData.descrizione}
            onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Descrizione opzionale della fattura..."
          />
        </div>

        <button
          type="submit"
          disabled={(!formData.codiceAteco && !datiUtente.codiceAteco) || !formData.fatturato || !formData.dataScadenza}
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registra Fattura
        </button>
      </form>
    </div>
  );
};

export default FormNuovaFattura;