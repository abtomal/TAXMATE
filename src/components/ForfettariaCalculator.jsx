import React, { useState } from 'react';

const ForfettariaCalculator = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '1',
    annoApertura: new Date().getFullYear(),
    regioneInps: 'nord',
  });

  const [results, setResults] = useState(null);

  const coefficientiRedditività = {
    '1': 40, // Commercio all'ingrosso e al dettaglio
    '2': 54, // Intermediari del commercio
    '3': 62, // Attività professionali, scientifiche, tecniche, sanitarie
    '4': 67, // Servizi di informazione e comunicazione
    '5': 86, // Industria e artigianato
    '6': 78, // Costruzioni e attività immobiliari
    '7': 40, // Commercio ambulante
    '8': 40, // Commercio di alimenti e bevande
    '9': 62, // Studi di ingegneria e architettura
    '10': 67, // Servizi di marketing e pubblicità
    '11': 78, // Manutenzione edifici e giardinaggio
  };

  const aliquoteRegionaliInps = {
    nord: 24.00,
    centro: 24.00,
    sud: 24.00,
  };

  const calculateTaxes = (e) => {
    e.preventDefault();
    
    const fatturato = parseFloat(formData.fatturato);
    const coefficiente = coefficientiRedditività[formData.codiceAteco] / 100;
    const aliquotaInps = aliquoteRegionaliInps[formData.regioneInps];
    
    const redditoImponibile = fatturato * coefficiente;
    const isFirst5Years = new Date().getFullYear() - parseInt(formData.annoApertura) < 5;
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    const contributiInps = (redditoImponibile * aliquotaInps) / 100;
    const totaleCosti = impostaSostitutiva + contributiInps;
    const nettoStimato = fatturato - totaleCosti;
    
    setResults({
      redditoImponibile: redditoImponibile.toFixed(2),
      impostaSostitutiva: impostaSostitutiva.toFixed(2),
      contributiInps: contributiInps.toFixed(2),
      totaleCosti: totaleCosti.toFixed(2),
      nettoStimato: nettoStimato.toFixed(2),
      aliquotaApplicata: (aliquotaImposta * 100)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Codice ATECO
            </label>
            <select
              value={formData.codiceAteco}
              onChange={(e) => setFormData({...formData, codiceAteco: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Commercio all'ingrosso e al dettaglio (40%)</option>
              <option value="2">Intermediari del commercio (54%)</option>
              <option value="3">Attività professionali, scientifiche, tecniche, sanitarie (62%)</option>
              <option value="4">Servizi di informazione e comunicazione (67%)</option>
              <option value="5">Industria e artigianato (86%)</option>
              <option value="6">Costruzioni e attività immobiliari (78%)</option>
              <option value="7">Commercio ambulante (40%)</option>
              <option value="8">Commercio di alimenti e bevande (40%)</option>
              <option value="9">Studi di ingegneria e architettura (62%)</option>
              <option value="10">Servizi di marketing e pubblicità (67%)</option>
              <option value="11">Manutenzione edifici e giardinaggio (78%)</option>
            </select>
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
              Regione INPS
            </label>
            <select
              value={formData.regioneInps}
              onChange={(e) => setFormData({...formData, regioneInps: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="nord">Nord Italia</option>
              <option value="centro">Centro Italia</option>
              <option value="sud">Sud Italia</option>
            </select>
          </div>

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
                <p className="text-sm text-gray-600">Reddito Imponibile</p>
                <p className="text-lg font-semibold">€ {results.redditoImponibile}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Imposta Sostitutiva ({results.aliquotaApplicata}%)</p>
                <p className="text-lg font-semibold">€ {results.impostaSostitutiva}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Contributi INPS</p>
                <p className="text-lg font-semibold">€ {results.contributiInps}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Totale Costi</p>
                <p className="text-lg font-semibold">€ {results.totaleCosti}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded col-span-2">
                <p className="text-sm text-gray-600">Netto Stimato</p>
                <p className="text-lg font-semibold">€ {results.nettoStimato}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForfettariaCalculator;