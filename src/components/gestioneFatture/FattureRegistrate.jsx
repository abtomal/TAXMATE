// src/components/gestioneFatture/FattureRegistrate.jsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import FattureMensili from './FattureMensili';

const FattureRegistrate = ({ 
  sortOrder, 
  toggleSortOrder, 
  fattureSalvate, 
  onTogglePagamento, 
  onRimuoviFattura 
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Fatture Registrate</h3>
        <button
          onClick={toggleSortOrder}
          className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
        >
          {sortOrder === 'desc' ? (
            <>
              <ArrowDown className="w-4 h-4 mr-1" />
              Più recenti
            </>
          ) : (
            <>
              <ArrowUp className="w-4 h-4 mr-1" />
              Meno recenti
            </>
          )}
        </button>
      </div>
      
      <FattureMensili 
        fatture={fattureSalvate}
        onTogglePagamento={onTogglePagamento}
        onRimuoviFattura={onRimuoviFattura}
      />
    </div>
  );
};

export default FattureRegistrate;