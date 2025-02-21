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
    <div className="mb-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="text-orange-500" size={24} />
        <h3 className="text-lg font-semibold text-orange-800">
          Fatture in scadenza
        </h3>
      </div>
      
      <div className="space-y-3">
        {fattureDaPagare.map(fattura => {
          const dataScadenza = new Date(fattura.dataScadenza);
          const oggi = new Date();
          const giorniMancanti = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
          
          const urgenzaStyle = giorniMancanti <= 7 
            ? 'bg-red-100 border-red-200' 
            : giorniMancanti <= 15 
              ? 'bg-yellow-100 border-yellow-200'
              : 'bg-orange-100 border-orange-200';

          return (
            <div 
              key={fattura.id} 
              className={`p-3 rounded border ${urgenzaStyle}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">€ {parseFloat(fattura.fatturato).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{fattura.descrizione}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Scade il {new Date(fattura.dataScadenza).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {giorniMancanti === 0 
                      ? 'Scade oggi!' 
                      : giorniMancanti === 1 
                        ? 'Scade domani'
                        : `Mancano ${giorniMancanti} giorni`}
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