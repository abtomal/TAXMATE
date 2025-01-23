import React, { useState } from 'react';

const ForfettariaCalculator = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '1',
    annoApertura: new Date().getFullYear(),
    regioneInps: 'nord',
    spesePersonaleDipendente: 0,
    pensionato: false,
    altrePartiteIva: false,
    redditoDiLavoro: 0
  });

  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState(null);

  const LIMITE_FATTURATO = 85000;
  const LIMITE_REDDITO_LAVORO = 30000;

  const coefficientiRedditività = {
    '1': 40,
    '2': 54,
    '3': 62,
    '4': 67,
    '5': 86,
    '6': 78,
    '7': 40,
    '8': 40,
    '9': 62,
    '10': 67,
    '11': 78,
  };

  const aliquoteRegionaliInps = {
    nord: 24.00,
    centro: 24.00,
    sud: 24.00,
  };

  const verificaRequisiti = () => {
    const errors = [];
    
    if (parseFloat(formData.fatturato) > LIMITE_FATTURATO) {
      errors.push(`Il fatturato supera il limite di ${LIMITE_FATTURATO.toLocaleString()}€`);
    }

    if (parseFloat(formData.spesePersonaleDipendente) > 20000) {
      errors.push("Le spese per personale dipendente superano 20.000€");
    }

    if (parseFloat(formData.redditoDiLavoro) > LIMITE_REDDITO_LAVORO) {
      errors.push(`Il reddito da lavoro dipendente supera ${LIMITE_REDDITO_LAVORO.toLocaleString()}€`);
    }

    if (formData.altrePartiteIva) {
      errors.push("Non puoi avere partecipazioni in società");
    }

    return errors;
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
    const coefficiente = coefficientiRedditività[formData.codiceAteco] / 100;
    const aliquotaInps = aliquoteRegionaliInps[formData.regioneInps];
    
    const redditoImponibile = fatturato * coefficiente;
    const isFirst5Years = new Date().getFullYear() - parseInt(formData.annoApertura) < 5;
    
    // Aliquota ridotta per pensionati
    const aliquotaInpsEffettiva = formData.pensionato ? aliquotaInps / 2 : aliquotaInps;
    
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    const contributiInps = (redditoImponibile * aliquotaInpsEffettiva) / 100;
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
      scadenzeIVA: calcolaScadenzeIVA(fatturato)
    });
  };

  const calcolaScadenzeIVA = (fatturato) => {
    const oggi = new Date();
    const meseCorrente = oggi.getMonth() + 1;
    const trimestreCorrente = Math.ceil(meseCorrente / 3);
    
    let trimestri = {
      primoTrimestre: { importo: 0, scadenza: '16/05' },
      secondoTrimestre: { importo: 0, scadenza: '16/08' },
      terzoTrimestre: { importo: 0, scadenza: '16/11' },
      quartoTrimestre: { importo: 0, scadenza: '16/02' }
    };

    // Calcola l'IVA solo per i trimestri rimanenti
    for (let i = trimestreCorrente; i <= 4; i++) {
      const importoTrimestre = (fatturato * 0.25 * 0.22).toFixed(2);
      switch(i) {
        case 1:
          trimestri.primoTrimestre.importo = importoTrimestre;
          break;
        case 2:
          trimestri.secondoTrimestre.importo = importoTrimestre;
          break;
        case 3:
          trimestri.terzoTrimestre.importo = importoTrimestre;
          break;
        case 4:
          trimestri.quartoTrimestre.importo = importoTrimestre;
          break;
      }
    }

    return trimestri;
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
              max={LIMITE_FATTURATO}
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

          <div>
            <label className="block text-sm font-medium mb-1">
              Spese per personale dipendente (€)
            </label>
            <input
              type="number"
              value={formData.spesePersonaleDipendente}
              onChange={(e) => setFormData({...formData, spesePersonaleDipendente: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
        </form>

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
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Tassazione Effettiva</p>
                <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Netto Stimato</p>
                <p className="text-lg font-semibold">€ {results.nettoStimato}</p>
              </div>
            </div>
            {results.scadenzeIVA && (
              <div className="col-span-2 mt-4">
                <h4 className="text-lg font-semibold mb-3">Scadenze IVA (22%)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">1° Trimestre ({results.scadenzeIVA.primoTrimestre.scadenza})</p>
                    <p className="text-lg font-semibold">€ {results.scadenzeIVA.primoTrimestre.importo || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">2° Trimestre ({results.scadenzeIVA.secondoTrimestre.scadenza})</p>
                    <p className="text-lg font-semibold">€ {results.scadenzeIVA.secondoTrimestre.importo || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">3° Trimestre ({results.scadenzeIVA.terzoTrimestre.scadenza})</p>
                    <p className="text-lg font-semibold">€ {results.scadenzeIVA.terzoTrimestre.importo || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">4° Trimestre ({results.scadenzeIVA.quartoTrimestre.scadenza})</p>
                    <p className="text-lg font-semibold">€ {results.scadenzeIVA.quartoTrimestre.importo || '0.00'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForfettariaCalculator;