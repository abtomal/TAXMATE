// src/components/RisultatiCalcolo.jsx
import React from 'react';
import { COSTANTI } from '../utils/calcolatori';

const RisultatiCalcolo = ({ results, tipologiaInps }) => {
  if (!results) return null;

  return (
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
        <div className="p-4 bg-red-200 rounded">
          <p className="text-sm text-gray-600">Totale Costi</p>
          <p className="text-lg font-semibold">€ {results.totaleCosti}</p>
        </div>
        <div className="p-4 bg-yellow-200 rounded">
          <p className="text-sm text-gray-600">Tassazione Effettiva</p>
          <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
        </div>
        <div className="p-4 bg-blue-200 rounded">
          <p className="text-sm text-gray-600">Netto Stimato</p>
          <p className="text-lg font-semibold">€ {results.nettoStimato}</p>
        </div>
      </div>

      {tipologiaInps === 'artigiano' && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-3">Dettaglio Contributi Artigiani</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Quota Fissa Annuale</p>
              <p className="text-lg font-semibold">€ {(COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4).toFixed(2)}</p>
            </div>
            {parseFloat(results.redditoImponibile) > COSTANTI.SOGLIA_REDDITO_ARTIGIANO && (
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Contributo Aggiuntivo (24% sul reddito eccedente {COSTANTI.SOGLIA_REDDITO_ARTIGIANO}€)</p>
                <p className="text-lg font-semibold">€ {((parseFloat(results.redditoImponibile) - COSTANTI.SOGLIA_REDDITO_ARTIGIANO) * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO).toFixed(2)}</p>
              </div>
            )}
          </div>
          <h4 className="text-lg font-semibold mb-3">Scadenze Contributi Fissi</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">1° Trimestre (16/05)</p>
              <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">2° Trimestre (22/08)</p>
              <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">3° Trimestre (16/11)</p>
              <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">4° Trimestre (16/02)</p>
              <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RisultatiCalcolo;