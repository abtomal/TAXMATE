// src/components/RisultatiCalcolo.jsx
import React, { useState } from 'react';
import { COSTANTI } from '../utils/calcolatori';
import { calcolaAccontiEImposte } from '../utils/calcolo-saldo-imposte';

const RisultatiCalcolo = ({ results, tipologiaInps, annoApertura, fatturatoPrecedente, fatturato, coefficienteRedditività }) => {
  const [mostraDettagli, setMostraDettagli] = useState(false);
  
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

  // Stato acconti già versati (saldo o credito)
  const getStatoAccontiMessaggio = () => {
    if (!infoAccontiVersati.haAccontiVersati) {
      return "Nessun acconto versato per l'anno in corso.";
    } else if (infoAccontiVersati.saldoDaPagare > 0) {
      return <>Dovrai pagare un saldo di <span className="font-bold">€ {infoAccontiVersati.saldoDaPagare.toFixed(2)}</span> con la prossima dichiarazione.</>;
    } else if (infoAccontiVersati.rimborso > 0) {
      return <>Hai diritto a un rimborso di <span className="font-bold">€ {infoAccontiVersati.rimborso.toFixed(2)}</span> con la prossima dichiarazione.</>;
    } else {
      return "Gli acconti versati coprono esattamente l'imposta dovuta.";
    }
  };

  // Stato acconti anno successivo
  const getStatoAccontiAnnoSuccessivo = () => {
    if (!infoAcconti.deveCalcolareAcconti) {
      return "Nessun acconto da versare per l'anno successivo.";
    } else if (infoAcconti.unicaRata) {
      return <><span className="font-bold">€ {infoAcconti.importoTotale.toFixed(2)}</span> in unica soluzione entro il 30 novembre.</>;
    } else {
      return <><span className="font-bold">€ {infoAcconti.importoTotale.toFixed(2)}</span> in due rate: <span className="font-bold">€ {infoAcconti.importoPrimaRata.toFixed(2)}</span> entro il 30 giugno e <span className="font-bold">€ {infoAcconti.importoSecondaRata.toFixed(2)}</span> entro il 30 novembre.</>;
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold">Risultati del calcolo:</h3>
      
      {/* Sezione principale con i risultati più importanti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card grande: Quanto devi tenere da parte */}
        <div className="p-6 bg-red-100 rounded-lg shadow-md border border-red-200">
          <h4 className="text-lg font-semibold text-red-800">Quanto devi tenere da parte</h4>
          <p className="text-3xl font-bold text-red-800 my-3">€ {totaleCostiConAcconti.toFixed(2)}</p>
          <p className="text-sm text-red-700">
            Include tasse, contributi e acconti per l'anno successivo
          </p>
        </div>
        
        {/* Card grande: Quanto puoi spendere */}
        <div className="p-6 bg-blue-100 rounded-lg shadow-md border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800">Quanto puoi spendere</h4>
          <p className="text-3xl font-bold text-blue-800 my-3">€ {nettoStimatoConAcconti.toFixed(2)}</p>
          <p className="text-sm text-blue-700">
            Ciò che rimane dopo tasse, contributi e acconti
          </p>
        </div>
      </div>
      
      {/* Sezione informazioni sugli acconti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Acconti anno successivo */}
        <div className="p-5 bg-yellow-200 rounded-lg shadow border border-black-100">
          <h4 className="text-md font-semibold text-black-800">Acconti per l'anno successivo</h4>
          <p className="text-sm mt-2">{getStatoAccontiAnnoSuccessivo()}</p>
        </div>
        
        {/* Situazione acconti anno corrente */}
        <div className="p-5 bg-yellow-100 rounded-lg shadow border border-black100">
          <h4 className="text-md font-semibold text-black-800">Acconti già versati</h4>
          <p className="text-sm mt-2">{getStatoAccontiMessaggio()}</p>
          {infoAccontiVersati.haAccontiVersati && (
            <p className="text-sm mt-1">
              Acconti versati: <span className="font-bold">€ {infoAccontiVersati.importoAccontiVersati.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Pulsante per mostrare/nascondere i dettagli */}
      <div className="text-center mt-6">
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded shadow"
          onClick={() => setMostraDettagli(!mostraDettagli)}
        >
          {mostraDettagli ? "Nascondi dettagli" : "Approfondisci"}
        </button>
      </div>
      
      {/* Sezione dettagli */}
      {mostraDettagli && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Dettaglio calcoli</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              <p className="text-sm text-gray-600">Reddito Imponibile</p>
              <p className="text-lg font-semibold">€ {results.redditoImponibile}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="text-sm text-gray-600">Imposta Sostitutiva ({results.aliquotaApplicata}%)</p>
              <p className="text-lg font-semibold">€ {results.impostaSostitutiva}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="text-sm text-gray-600">Contributi INPS</p>
              <p className="text-lg font-semibold">€ {results.contributiInps}</p>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <p className="text-sm text-gray-600">Tassazione Effettiva</p>
              <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
            </div>
          </div>
          
          {/* Dettaglio acconti già versati */}
          {infoAccontiVersati.haAccontiVersati && (
            <div className="mb-6">
              <h5 className="text-md font-semibold mb-3">Dettaglio acconti già versati</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">Acconti già versati</p>
                  <p className="text-lg font-semibold">€ {infoAccontiVersati.importoAccontiVersati.toFixed(2)}</p>
                </div>
                {infoAccontiVersati.saldoDaPagare > 0 && (
                  <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-600">Saldo da pagare</p>
                    <p className="text-lg font-semibold">€ {infoAccontiVersati.saldoDaPagare.toFixed(2)}</p>
                  </div>
                )}
                {infoAccontiVersati.rimborso > 0 && (
                  <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-600">Credito d'imposta (rimborso)</p>
                    <p className="text-lg font-semibold">€ {infoAccontiVersati.rimborso.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-white rounded shadow">
                <p className="text-sm">{infoAccontiVersati.messaggioAcconti}</p>
                <p className="text-sm mt-2">{infoAccontiVersati.messaggioSaldo}</p>
              </div>
            </div>
          )}
          
          {/* Dettaglio acconti anno successivo */}
          {infoAcconti.deveCalcolareAcconti && (
            <div className="mb-6">
              <h5 className="text-md font-semibold mb-3">Dettaglio acconti anno successivo</h5>
              
              {infoAcconti.unicaRata ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-white rounded shadow">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Prima rata (50%)</p>
                        <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaPrimaRata}</p>
                      </div>
                      <p className="text-xl font-bold">€ {infoAcconti.importoPrimaRata.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Seconda rata (50%)</p>
                        <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaSecondaRata}</p>
                      </div>
                      <p className="text-xl font-bold">€ {infoAcconti.importoSecondaRata.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Dettaglio contributi artigiani */}
          {tipologiaInps === 'artigiano' && (
            <div>
              <h5 className="text-md font-semibold mb-3">Dettaglio Contributi Artigiani</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">Quota Fissa Annuale</p>
                  <p className="text-lg font-semibold">€ {(COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4).toFixed(2)}</p>
                </div>
                {parseFloat(results.redditoImponibile) > COSTANTI.SOGLIA_REDDITO_ARTIGIANO && (
                  <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-600">Contributo Aggiuntivo</p>
                    <p className="text-lg font-semibold">€ {((parseFloat(results.redditoImponibile) - COSTANTI.SOGLIA_REDDITO_ARTIGIANO) * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <h5 className="text-md font-semibold mb-3">Scadenze Contributi Fissi</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">1° Trimestre (16/05)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">2° Trimestre (22/08)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">3° Trimestre (16/11)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                  <p className="text-sm text-gray-600">4° Trimestre (16/02)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RisultatiCalcolo;