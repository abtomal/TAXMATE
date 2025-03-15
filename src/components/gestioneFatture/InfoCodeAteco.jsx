// src/components/gestioneFatture/InfoCodeAteco.jsx
import React from 'react';

const InfoCodeAteco = ({ datiUtente, getAtecoName }) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <p className="text-sm text-gray-600">Codice ATECO principale:</p>
          <p className="font-medium">{getAtecoName(datiUtente.codiceAteco)}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
            {datiUtente.coefficienteRedditività}%
          </span>
          <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
            {datiUtente.tipologiaInps === 'artigiano' ? 'Artigiano' : 'Commerciante'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoCodeAteco;