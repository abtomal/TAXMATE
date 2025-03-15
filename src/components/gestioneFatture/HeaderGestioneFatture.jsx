// src/components/gestioneFatture/HeaderGestioneFatture.jsx
import React from 'react';
import { PlusCircle, Settings, PieChart } from 'lucide-react';

const HeaderGestioneFatture = ({ 
  setMostraFormNuovaFattura, 
  mostraFormNuovaFattura,
  setMostraImpostazioni,
  setMostraProiezioni 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold">Gestione Fatture</h1>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMostraFormNuovaFattura(!mostraFormNuovaFattura)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {mostraFormNuovaFattura ? 'Nascondi form' : 'Nuova fattura'}
        </button>
        <button
          onClick={() => setMostraImpostazioni(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Settings className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Impostazioni</span>
        </button>
        <button
          onClick={() => setMostraProiezioni(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <PieChart className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Proiezioni</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderGestioneFatture;