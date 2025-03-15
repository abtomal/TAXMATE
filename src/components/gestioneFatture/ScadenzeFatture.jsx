import React from 'react';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ScadenzeFatture = ({ fatture }) => {
  const [fattureDaPagare, setFattureDaPagare] = useState([]);

  useEffect(() => {
    const oggi = new Date();
    // Filtra le fatture non pagate e in scadenza nei prossimi 30 giorni
    const inScadenza = fatture.filter(fattura => {
      if (fattura.pagata) return false;
      const dataScadenza = new Date(fattura.dataScadenza);
      const giorniMancanti = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
      return giorniMancanti >= 0 && giorniMancanti <= 30;
    });

    setFattureDaPagare(inScadenza.sort((a, b) => 
      new Date(a.dataScadenza) - new Date(b.dataScadenza)
    ));
  }, [fatture]);

  if (fattureDaPagare.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-orange-50 rounded-lg p-4 border border-orange-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <AlertCircle className="text-orange-500" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-orange-800">
          Fatture in scadenza
        </h3>
      </div>
      
      <div className="space-y-3">
        {fattureDaPagare.map(fattura => {
          const dataScadenza = new Date(fattura.dataScadenza);
          const oggi = new Date();
          const giorniMancanti = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
          
          // Stili basati sull'urgenza
          let urgenzaStyle = 'bg-orange-100 border-orange-200';
          let badgeStyle = 'bg-orange-200 text-orange-800';
          let badgeText = `${giorniMancanti} giorni`;
          
          if (giorniMancanti <= 7) {
            urgenzaStyle = 'bg-red-100 border-red-200';
            badgeStyle = 'bg-red-200 text-red-800';
            
            if (giorniMancanti === 0) {
              badgeText = 'OGGI!';
            } else if (giorniMancanti === 1) {
              badgeText = 'DOMANI';
            } else {
              badgeText = `${giorniMancanti} giorni`;
            }
          } else if (giorniMancanti <= 15) {
            urgenzaStyle = 'bg-yellow-100 border-yellow-200';
            badgeStyle = 'bg-yellow-200 text-yellow-800';
          }

          return (
            <div 
              key={fattura.id} 
              className={`p-3 rounded-lg border ${urgenzaStyle} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-baseline justify-between sm:justify-start">
                    <p className="font-medium text-lg">€ {parseFloat(fattura.fatturato).toLocaleString()}</p>
                    <span className={`ml-2 text-xs py-1 px-2 rounded-full ${badgeStyle} font-medium`}>
                      {badgeText}
                    </span>
                  </div>
                  {fattura.descrizione && (
                    <p className="text-sm text-gray-600 mt-1 border-l-2 border-gray-300 pl-2">
                      {fattura.descrizione}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center justify-end">
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Scade il {dataScadenza.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScadenzeFatture;