// src/components/RisultatiCalcolo.jsx
import React from 'react';
import { COSTANTI } from '../utils/calcolatori';
import { calcolaAccontiEImposte } from '../utils/calcolo-saldo-imposte';

const RisultatiCalcolo = ({ results, tipologiaInps, annoApertura, fatturatoPrecedente, fatturato, coefficienteRedditività }) => {
  if (!results) return null;

  // Calcolo degli acconti per l'anno successivo
  const calcolaAccontiAnnoSuccessivo = () => {
    const annoCorrente = new Date().getFullYear();
    // Se la partita IVA è stata appena aperta, non bisogna pagare acconti per l'anno successivo
    if (parseInt(annoApertura) === annoCorrente) {
      return {
        deveCalcolareAcconti: false,
        importoTotale: 0,
        messaggio: "Non sono previsti acconti per l'anno successivo perché la partita IVA è stata aperta nell'anno corrente."
      };
    }

    const impostaSostitutiva = parseFloat(results.impostaSostitutiva);
    if (impostaSostitutiva <= 0) {
      return {
        deveCalcolareAcconti: false,
        importoTotale: 0,
        messaggio: "Non sono previsti acconti per l'anno successivo perché l'imposta sostitutiva è pari a 0."
      };
    }

    const soglia = 257.52;

    if (impostaSostitutiva < soglia) {
      return {
        deveCalcolareAcconti: true,
        unicaRata: true,
        importoTotale: impostaSostitutiva,
        importoUnicaRata: impostaSostitutiva,
        scadenzaUnicaRata: "30 novembre",
        messaggio: `L'acconto di ${impostaSostitutiva.toFixed(2)}€ è inferiore a 257,52€ e va versato in un'unica soluzione l'anno prossimo.`
      };
    } else {
      const primaRata = Math.floor(impostaSostitutiva * 0.5 * 100) / 100; // Arrotonda per difetto a 2 decimali
      const secondaRata = Math.floor((impostaSostitutiva - primaRata) * 100) / 100; // Arrotonda il resto
      
      return {
        deveCalcolareAcconti: true,
        unicaRata: false,
        importoTotale: impostaSostitutiva,
        importoPrimaRata: primaRata,
        importoSecondaRata: secondaRata,
        scadenzaPrimaRata: "30 giugno",
        scadenzaSecondaRata: "30 novembre",
        messaggio: `L'acconto di ${impostaSostitutiva.toFixed(2)}€ per l'anno prossimo va versato in due rate.`
      };
    }
  };

  // Calcola situazione degli acconti versati e saldo/rimborso
  const infoAccontiVersati = calcolaAccontiEImposte(
    fatturatoPrecedente, 
    fatturato, 
    coefficienteRedditività, 
    annoApertura
  );

  // Calcola acconti per l'anno successivo
  const infoAcconti = calcolaAccontiAnnoSuccessivo();
  
  // Calcolo del totale che include anche gli acconti per l'anno successivo
  // e tiene conto del saldo da pagare o del rimborso
  let totaleCostiConAcconti = 0;
  
  if (infoAccontiVersati.haAccontiVersati) {
    // Se ci sono acconti versati, consideriamo il saldo (se positivo) o non consideriamo il rimborso (lo terrà comunque a parte)
    totaleCostiConAcconti = parseFloat(results.contributiInps) + Math.max(infoAccontiVersati.saldoDaPagare, 0) + infoAcconti.importoTotale;
  } else {
    // Se non ci sono acconti versati, consideriamo l'imposta completa
    totaleCostiConAcconti = parseFloat(results.totaleCosti) + infoAcconti.importoTotale;
  }
  
  // Ricalcola il netto con gli acconti inclusi
  let nettoStimatoConAcconti = parseFloat(fatturato) - totaleCostiConAcconti;
  
  // Se c'è un rimborso, lo aggiungiamo al netto
  if (infoAccontiVersati.rimborso > 0) {
    nettoStimatoConAcconti += infoAccontiVersati.rimborso;
  }

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
        
        {/* Sezione acconti versati e saldo */}
        {infoAccontiVersati.haAccontiVersati && (
          <>
            {infoAccontiVersati.saldoDaPagare > 0 && (
              <div className="p-4 bg-red-50 rounded">
                <p className="text-sm text-gray-600">Saldo da pagare</p>
                <p className="text-lg font-semibold">€ {infoAccontiVersati.saldoDaPagare.toFixed(2)}</p>
              </div>
            )}
            {infoAccontiVersati.rimborso > 0 && (
              <div className="p-4 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Credito d'imposta (rimborso)</p>
                <p className="text-lg font-semibold">€ {infoAccontiVersati.rimborso.toFixed(2)}</p>
              </div>
            )}
          </>
        )}
        
        
        <div className="p-4 bg-red-200 rounded md:col-span-2">
          <p className="text-sm text-black-600 font-semibold">Quanto devi tenere da parte</p>
          <p className="text-lg font-semibold">€ {totaleCostiConAcconti.toFixed(2)}</p>
          <p className="text-xs text-gray-700 mt-1">
            {infoAccontiVersati.haAccontiVersati 
              ? "Include contributi INPS, eventuale saldo tasse e acconti per l'anno successivo" 
              : "Include tasse, contributi e acconti per l'anno successivo"}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <p className="text-sm text-gray-600">Tassazione Effettiva</p>
          <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
        </div>
        <div className="p-4 bg-blue-200 rounded">
          <p className="text-sm text-black-600 font-semibold">Quanto puoi spendere</p>
          <p className="text-lg font-semibold">€ {nettoStimatoConAcconti.toFixed(2)}</p>
        </div>
      </div>

      {/* Sezione dettaglio acconti già versati */}
      {infoAccontiVersati.haAccontiVersati && (
        <div className="mt-6 border rounded-lg p-4 bg-green-50">
          <h4 className="text-lg font-semibold mb-3">Acconti già versati per l'anno corrente</h4>
          <p className="mb-3">{infoAccontiVersati.messaggioAcconti}</p>
          
          {infoAccontiVersati.unicaRata ? (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Rata unica</p>
                  <p className="text-sm text-gray-600">Scadenza: {infoAccontiVersati.scadenzaUnicaRata}</p>
                </div>
                <p className="text-xl font-bold">€ {infoAccontiVersati.importoUnicaRata.toFixed(2)}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Prima rata (50%)</p>
                    <p className="text-sm text-gray-600">Scadenza: {infoAccontiVersati.scadenzaPrimaRata}</p>
                  </div>
                  <p className="text-xl font-bold">€ {infoAccontiVersati.importoPrimaRata.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Seconda rata (50%)</p>
                    <p className="text-sm text-gray-600">Scadenza: {infoAccontiVersati.scadenzaSecondaRata}</p>
                  </div>
                  <p className="text-xl font-bold">€ {infoAccontiVersati.importoSecondaRata.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 rounded bg-white border border-green-200">
            <p className="font-medium">{infoAccontiVersati.messaggioSaldo}</p>
          </div>
        </div>
      )}

      {/* Sezione Acconti per l'anno successivo */}
      <div className="mt-6 border rounded-lg p-4 bg-indigo-50">
        <h4 className="text-lg font-semibold mb-3">Acconti per l'anno successivo</h4>
        
        {!infoAcconti.deveCalcolareAcconti ? (
          <p className="text-gray-700">{infoAcconti.messaggio}</p>
        ) : infoAcconti.unicaRata ? (
          <div>
            <p className="mb-3">{infoAcconti.messaggio}</p>
            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Rata unica</p>
                  <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaUnicaRata}</p>
                </div>
                <p className="text-xl font-bold">€ {infoAcconti.importoUnicaRata.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3">{infoAcconti.messaggio}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Prima rata (50%)</p>
                    <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaPrimaRata}</p>
                  </div>
                  <p className="text-xl font-bold">€ {infoAcconti.importoPrimaRata.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Seconda rata (50%)</p>
                    <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaSecondaRata}</p>
                  </div>
                  <p className="text-xl font-bold">€ {infoAcconti.importoSecondaRata.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
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