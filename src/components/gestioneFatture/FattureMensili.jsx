import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FattureMensili = ({ fatture, onTogglePagamento, onRimuoviFattura }) => {
  // Stato per tenere traccia dei periodi espansi
  const [periodiEspansi, setPeriodiEspansi] = useState({});

  // Raggruppa le fatture per mese/anno
  const gruppiFatture = fatture.reduce((gruppi, fattura) => {
    const data = new Date(fattura.dataEmissione);
    const chiave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    
    if (!gruppi[chiave]) {
      gruppi[chiave] = {
        fatture: [],
        totale: 0,
        totaleNonPagato: 0,
        totalePagato: 0
      };
    }
    
    gruppi[chiave].fatture.push(fattura);
    const importo = parseFloat(fattura.fatturato);
    gruppi[chiave].totale += importo;
    
    if (fattura.pagata) {
      gruppi[chiave].totalePagato += importo;
    } else {
      gruppi[chiave].totaleNonPagato += importo;
    }
    
    return gruppi;
  }, {});

  // Converti l'oggetto in array e ordina per data decrescente
  const periodi = Object.entries(gruppiFatture)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([periodo, dati]) => ({
      periodo,
      ...dati
    }));

  // Funzione per formattare il periodo
  const formattaPeriodo = (periodo) => {
    const [anno, mese] = periodo.split('-');
    const data = new Date(anno, parseInt(mese) - 1);
    return data.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  // Funzione per toggle espansione/compressione
  const toggleEspansione = (periodo) => {
    setPeriodiEspansi(prev => ({
      ...prev,
      [periodo]: !prev[periodo]
    }));
  };

  // Inizializza tutti i periodi come espansi al primo render
  React.useEffect(() => {
    if (periodi.length > 0 && Object.keys(periodiEspansi).length === 0) {
      const statoIniziale = periodi.reduce((acc, { periodo }) => {
        acc[periodo] = true;
        return acc;
      }, {});
      setPeriodiEspansi(statoIniziale);
    }
  }, [periodi]);

  return (
    <div className="space-y-4">
      {periodi.map(periodo => (
        <div key={periodo.periodo} className="border rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
          <div 
            className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 cursor-pointer"
            onClick={() => toggleEspansione(periodo.periodo)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {periodiEspansi[periodo.periodo] ? 
                  <ChevronDown className="w-5 h-5 mr-2 text-blue-600" /> : 
                  <ChevronRight className="w-5 h-5 mr-2 text-blue-600" />
                }
                <h3 className="text-lg font-semibold">
                  {formattaPeriodo(periodo.periodo)}
                </h3>
              </div>
              <div className="hidden md:flex gap-4 text-sm">
                <span className="text-gray-600">
                  Totale: €{periodo.totale.toLocaleString()}
                </span>
                <span className="text-green-600">
                  Pagato: €{periodo.totalePagato.toLocaleString()}
                </span>
                <span className="text-orange-600">
                  In attesa: €{periodo.totaleNonPagato.toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Versione mobile dei totali */}
            <div className="md:hidden mt-2 grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-200 p-1 rounded text-center">
                <span className="block text-xs text-gray-600">Totale</span>
                <span className="font-medium">€{periodo.totale.toLocaleString()}</span>
              </div>
              <div className="bg-green-100 p-1 rounded text-center">
                <span className="block text-xs text-green-600">Pagato</span>
                <span className="font-medium text-green-600">€{periodo.totalePagato.toLocaleString()}</span>
              </div>
              <div className="bg-orange-100 p-1 rounded text-center">
                <span className="block text-xs text-orange-600">In attesa</span>
                <span className="font-medium text-orange-600">€{periodo.totaleNonPagato.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {periodiEspansi[periodo.periodo] && (
            <div className="divide-y">
              {periodo.fatture.map(fattura => (
                <div key={fattura.id} className="p-4 bg-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div>
                      <div className="flex flex-col md:flex-row md:items-baseline md:space-x-2">
                        <p className="font-medium text-lg">
                          €{parseFloat(fattura.fatturato).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Emessa: {new Date(fattura.dataEmissione).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs mr-1">
                          {fattura.codiceAteco}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                          {fattura.coefficienteRedditività}%
                        </span>
                      </p>
                      {fattura.descrizione && (
                        <p className="text-sm text-gray-600 mt-1 border-l-2 border-gray-200 pl-2 italic">
                          {fattura.descrizione}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Scadenza: {new Date(fattura.dataScadenza).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 self-end md:self-start">
                      <button
                        onClick={() => onTogglePagamento(fattura.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          fattura.pagata 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        {fattura.pagata ? 'Pagata' : 'In attesa'}
                      </button>
                      <button
                        onClick={() => onRimuoviFattura(fattura.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {periodi.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Nessuna fattura registrata</p>
          <p className="text-sm text-gray-400 mt-1">Le fatture che registri appariranno qui</p>
        </div>
      )}
    </div>
  );
};

export default FattureMensili;