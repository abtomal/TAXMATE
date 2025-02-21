import React from 'react';

const FattureMensili = ({ fatture, onTogglePagamento, onRimuoviFattura }) => {
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

  return (
    <div className="space-y-6">
      {periodi.map(periodo => (
        <div key={periodo.periodo} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {formattaPeriodo(periodo.periodo)}
              </h3>
              <div className="flex gap-4 text-sm">
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
          </div>
          
          <div className="divide-y">
            {periodo.fatture.map(fattura => (
              <div key={fattura.id} className="p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <p className="font-medium">
                        €{parseFloat(fattura.fatturato).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Emessa: {new Date(fattura.dataEmissione).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Codice ATECO: {fattura.codiceAteco} ({fattura.coefficienteRedditività}%)
                    </p>
                    {fattura.descrizione && (
                      <p className="text-sm text-gray-600">{fattura.descrizione}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Scadenza: {new Date(fattura.dataScadenza).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTogglePagamento(fattura.id)}
                      className={`px-3 py-1 rounded ${
                        fattura.pagata 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {fattura.pagata ? 'Pagamento ricevuto' : 'Attesa pagamento'}
                    </button>
                    <button
                      onClick={() => onRimuoviFattura(fattura.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FattureMensili;