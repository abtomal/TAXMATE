// src/components/gestioneFatture/RiepilogoTotali.jsx
import React from 'react';

const RiepilogoTotali = ({ totali, limiteFatturato }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mb-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Riepilogo
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Numero Fatture</p>
          <p className="text-lg font-medium">{totali.numeroFatture}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Totale Fatturato</p>
          <p className="text-lg font-medium">€ {totali.totale.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
          <p className="text-sm text-gray-600">In attesa di pagamento</p>
          <p className="text-lg font-medium text-orange-600">
            € {totali.daPagare.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
          <p className="text-sm text-gray-600">Pagamenti ricevuti</p>
          <p className="text-lg font-medium text-green-600">
            € {totali.pagate.toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Barra di progresso fatturato */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-600">Progresso fatturato annuale</p>
          <p className="text-sm font-medium text-gray-700">{totali.totale.toLocaleString()}€ / {limiteFatturato.toLocaleString()}€</p>
        </div>
        <div className="w-full h-8 bg-blue-100 rounded-full overflow-hidden shadow-inner relative">
          {/* Barra colorata */}
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-teal-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((totali.totale / limiteFatturato) * 100, 100)}%` }}
          ></div>
          
          {/* Testo centrato (posizionato sopra la barra) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-800 drop-shadow-sm px-2">
              {totali.totale.toLocaleString()}€
            </span>
          </div>
        </div>
        {totali.totale > (limiteFatturato * 0.8) && (
          <p className="mt-1 text-xs text-orange-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Ti stai avvicinando al limite del regime forfettario ({limiteFatturato.toLocaleString()}€)
          </p>
        )}
      </div>
    </div>
  );
};

export default RiepilogoTotali;