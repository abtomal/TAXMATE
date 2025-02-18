import React, { useState } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';

const ForfettariaCalculator = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    annoApertura: new Date().getFullYear(),
    pensionato: false,
    altrePartiteIva: false,
    redditoDiLavoro: 0,
    coefficienteRedditività: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAteco, setFilteredAteco] = useState([]);
  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState(null);

  const COSTANTI = {
    QUOTA_FISSA_TRIMESTRALE_ARTIGIANO: 1106.76,
    SOGLIA_REDDITO_ARTIGIANO: 18415,
    ALIQUOTA_AGGIUNTIVA_ARTIGIANO: 0.24,
    ALIQUOTA_COMMERCIANTE: 0.2607,
    LIMITE_FATTURATO: 85000,
    LIMITE_REDDITO_LAVORO: 30000
  };

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

  const verificaRequisiti = () => {
    const errors = [];
    
    if (parseFloat(formData.fatturato) > COSTANTI.LIMITE_FATTURATO) {
      errors.push(`Il fatturato supera il limite di ${COSTANTI.LIMITE_FATTURATO.toLocaleString()}€`);
    }

    if (parseFloat(formData.redditoDiLavoro) > COSTANTI.LIMITE_REDDITO_LAVORO) {
      errors.push(`Il reddito da lavoro dipendente supera ${COSTANTI.LIMITE_REDDITO_LAVORO.toLocaleString()}€`);
    }

    if (formData.altrePartiteIva) {
      errors.push("Non puoi avere partecipazioni in società");
    }

    return errors;
  };

  const calcolaContributiInps = (redditoImponibile, selectedAteco, isPensionato) => {
    const tipo = selectedAteco?.tipo || 'commerciante';
    
    if (tipo === 'artigiano') {
      // Quota fissa annuale (4 trimestri)
      const quotaFissa = COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4;
      
      // Contributo aggiuntivo se il reddito supera la soglia
      let contributoAggiuntivo = 0;
      if (redditoImponibile > COSTANTI.SOGLIA_REDDITO_ARTIGIANO) {
        contributoAggiuntivo = (redditoImponibile - COSTANTI.SOGLIA_REDDITO_ARTIGIANO) * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO;
      }

      const totaleContributi = quotaFissa + contributoAggiuntivo;
      return isPensionato ? totaleContributi / 2 : totaleContributi;
    } else {
      // Commerciante
      const contributi = redditoImponibile * COSTANTI.ALIQUOTA_COMMERCIANTE;
      return isPensionato ? contributi / 2 : contributi;
    }
  };

  const calculateTaxes = (e) => {
    e.preventDefault();
    
    const errors = verificaRequisiti();
    setErrors(errors);
    
    if (errors.length > 0) {
      setResults(null);
      return;
    }

    const fatturato = parseFloat(formData.fatturato);
    const selectedAteco = atecoData.find(a => a.codice === formData.codiceAteco);
    const coefficiente = formData.coefficienteRedditività / 100;
    
    const redditoImponibile = fatturato * coefficiente;
    const isFirst5Years = new Date().getFullYear() - parseInt(formData.annoApertura) < 5;
    
    const contributiInps = calcolaContributiInps(redditoImponibile, selectedAteco, formData.pensionato);
    
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    const totaleCosti = impostaSostitutiva + contributiInps;
    const nettoStimato = fatturato - totaleCosti;
    
    const tassazioneEffettiva = ((totaleCosti / fatturato) * 100).toFixed(1);
    
    setResults({
      redditoImponibile: redditoImponibile.toFixed(2),
      impostaSostitutiva: impostaSostitutiva.toFixed(2),
      contributiInps: contributiInps.toFixed(2),
      totaleCosti: totaleCosti.toFixed(2),
      nettoStimato: nettoStimato.toFixed(2),
      aliquotaApplicata: (aliquotaImposta * 100),
      tassazioneEffettiva,
      tipo: selectedAteco?.tipo || 'commerciante'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Calcolatore Partita IVA Forfettaria</h1>
        
        <form onSubmit={calculateTaxes} className="space-y-4">
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

          {/* Ricerca ATECO migliorata */}
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

            {/* Dropdown risultati */}
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

            {/* Messaggio nessun risultato */}
            {isOpen && searchTerm && filteredAteco.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
                Nessun codice ATECO trovato
              </div>
            )}
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

        {results && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Risultati del calcolo:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Imposta Sostitutiva ({results.aliquotaApplicata}%)</p>
                <p className="text-lg font-semibold">€ {results.impostaSostitutiva}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Contributi INPS</p>
                <p className="text-lg font-semibold">€ {results.contributiInps}</p>
              </div>
              <div className="p-4 bg-red-200 rounded border-2 border-red-300">
                <p className="text-sm text-gray-600 ">Totale Costi</p>
                <p className="text-lg font-semibold">€ {results.totaleCosti}</p>
              </div>
              <div className="p-4 bg-yellow-200 rounded border-2 border-yellow-300">
                <p className="text-sm text-gray-600">Tassazione Effettiva</p>
                <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-center">
              <div className="p-4 bg-blue-200 rounded border-2 border-indigo-300">
                <p className="text-sm text-gray-600">Netto Stimato</p>
                <p className="text-lg font-semibold">€ {results.nettoStimato}</p>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ForfettariaCalculator;