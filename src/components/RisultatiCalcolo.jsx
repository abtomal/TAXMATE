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
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2 text-center">Risultati del calcolo</h3>
        <p className="text-sm text-center text-blue-100 mb-4">Dati aggiornati al {new Date().getFullYear()}</p>
      </div>
      
      {/* Sezione principale con i risultati più importanti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Quanto devi tenere da parte */}
        <div className="p-5 bg-red-50 rounded-lg shadow-md border border-red-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 bg-red-500 opacity-10"></div>
          <h4 className="text-lg font-semibold text-red-800 mb-2">Quanto devi tenere da parte</h4>
          <p className="text-3xl font-bold text-red-800 mb-2">€ {totaleCostiConAcconti.toFixed(2)}</p>
          <div className="flex items-center text-sm text-red-700">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Include tasse, contributi e acconti</span>
          </div>
        </div>
        
        {/* Card Quanto puoi spendere */}
        <div className="p-5 bg-green-50 rounded-lg shadow-md border border-green-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 bg-green-500 opacity-10"></div>
          <h4 className="text-lg font-semibold text-green-800 mb-2">Quanto puoi spendere</h4>
          <p className="text-3xl font-bold text-green-800 mb-2">€ {nettoStimatoConAcconti.toFixed(2)}</p>
          <div className="flex items-center text-sm text-green-700">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ciò che rimane dopo tasse e contributi</span>
          </div>
        </div>
      </div>
      
      {/* Sezione informazioni sugli acconti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Acconti anno successivo */}
        <div className="p-5 bg-amber-50 rounded-lg shadow-md border border-amber-200">
          <div className="flex items-start mb-3">
            <div className="bg-amber-200 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-md font-semibold text-amber-800">Acconti per l'anno successivo</h4>
          </div>
          <p className="text-sm mt-2 text-amber-700">{getStatoAccontiAnnoSuccessivo()}</p>
        </div>
        
        {/* Situazione acconti anno corrente */}
        <div className="p-5 bg-blue-50 rounded-lg shadow-md border border-blue-200">
          <div className="flex items-start mb-3">
            <div className="bg-blue-200 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-md font-semibold text-blue-800">Acconti già versati</h4>
          </div>
          <p className="text-sm mt-2 text-blue-700">{getStatoAccontiMessaggio()}</p>
          {infoAccontiVersati.haAccontiVersati && (
            <p className="text-sm mt-1 text-blue-700">
              Acconti versati: <span className="font-bold">€ {infoAccontiVersati.importoAccontiVersati.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Pulsante per mostrare/nascondere i dettagli */}
      <div className="text-center mt-6">
        <button 
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-full shadow transition-colors flex items-center mx-auto"
          onClick={() => setMostraDettagli(!mostraDettagli)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mostraDettagli ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            )}
          </svg>
          {mostraDettagli ? "Nascondi dettagli" : "Mostra dettagli"}
        </button>
      </div>
      
      {/* Sezione dettagli */}
      {mostraDettagli && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Dettaglio calcoli
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Reddito Imponibile</p>
              <p className="text-lg font-semibold">€ {results.redditoImponibile}</p>
              <p className="text-xs text-gray-500 mt-1">
                {parseFloat(fatturato).toLocaleString()}€ × {coefficienteRedditività}%
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Contributi INPS</p>
              <p className="text-lg font-semibold">€ {results.contributiInps}</p>
              <p className="text-xs text-gray-500 mt-1">
                {tipologiaInps === 'artigiano' ? 'Calcolo artigiani' : `${parseFloat(results.redditoImponibile).toLocaleString()}€ × 26,07%`}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Imponibile Netto</p>
              <p className="text-lg font-semibold">€ {(parseFloat(results.redditoImponibile) - parseFloat(results.contributiInps)).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Reddito Imponibile - Contributi INPS
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Imposta Sostitutiva ({results.aliquotaApplicata}%)</p>
              <p className="text-lg font-semibold">€ {results.impostaSostitutiva}</p>
              <p className="text-xs text-gray-500 mt-1">
                Imponibile Netto × {results.aliquotaApplicata}%
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Totale Tasse e Contributi</p>
              <p className="text-lg font-semibold">€ {results.totaleCosti}</p>
              <p className="text-xs text-gray-500 mt-1">
                Imposta Sostitutiva + Contributi INPS
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">Tassazione Effettiva</p>
              <p className="text-lg font-semibold">{results.tassazioneEffettiva}%</p>
              <p className="text-xs text-gray-500 mt-1">
                (Totale costi ÷ Fatturato) × 100
              </p>
            </div>
          </div>
          
          {/* Dettaglio acconti già versati */}
          {infoAccontiVersati.haAccontiVersati && (
            <div className="mb-6">
              <h5 className="text-md font-semibold mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dettaglio acconti già versati
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-600">Acconti già versati</p>
                  <p className="text-lg font-semibold">€ {infoAccontiVersati.importoAccontiVersati.toFixed(2)}</p>
                </div>
                {infoAccontiVersati.saldoDaPagare > 0 && (
                  <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Saldo da pagare</p>
                    <p className="text-lg font-semibold">€ {infoAccontiVersati.saldoDaPagare.toFixed(2)}</p>
                  </div>
                )}
                {infoAccontiVersati.rimborso > 0 && (
                  <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Credito d'imposta (rimborso)</p>
                    <p className="text-lg font-semibold">€ {infoAccontiVersati.rimborso.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-white rounded-lg shadow">
                <p className="text-sm">{infoAccontiVersati.messaggioAcconti}</p>
                <p className="text-sm mt-2">{infoAccontiVersati.messaggioSaldo}</p>
              </div>
            </div>
          )}
          
          {/* Dettaglio acconti anno successivo */}
          {infoAcconti.deveCalcolareAcconti && (
            <div className="mb-6">
              <h5 className="text-md font-semibold mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dettaglio acconti anno successivo
              </h5>
              
              {infoAcconti.unicaRata ? (
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Rata unica</p>
                      <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaUnicaRata}</p>
                    </div>
                    <div className="bg-amber-50 px-3 py-1 rounded border border-amber-200">
                      <p className="text-lg font-bold">€ {infoAcconti.importoUnicaRata.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Prima rata (50%)</p>
                        <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaPrimaRata}</p>
                      </div>
                      <div className="bg-amber-50 px-3 py-1 rounded border border-amber-200">
                        <p className="text-lg font-bold">€ {infoAcconti.importoPrimaRata.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Seconda rata (50%)</p>
                        <p className="text-sm text-gray-600">Scadenza: {infoAcconti.scadenzaSecondaRata}</p>
                      </div>
                      <div className="bg-amber-50 px-3 py-1 rounded border border-amber-200">
                        <p className="text-lg font-bold">€ {infoAcconti.importoSecondaRata.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Dettaglio contributi artigiani */}
          {tipologiaInps === 'artigiano' && (
            <div>
              <h5 className="text-md font-semibold mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Dettaglio Contributi Artigiani
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-600">Quota Fissa Annuale</p>
                  <p className="text-lg font-semibold">€ {(COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4).toFixed(2)}</p>
                </div>
                {parseFloat(results.redditoImponibile) > COSTANTI.SOGLIA_REDDITO_ARTIGIANO && (
                  <div className="p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Contributo Aggiuntivo</p>
                    <p className="text-lg font-semibold">€ {((parseFloat(results.redditoImponibile) - COSTANTI.SOGLIA_REDDITO_ARTIGIANO) * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO).toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <h5 className="text-md font-semibold mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Scadenze Contributi Fissi
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-600">1° Trimestre (16/05)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-600">2° Trimestre (22/08)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow">
                  <p className="text-sm text-gray-600">3° Trimestre (16/11)</p>
                  <p className="text-lg font-semibold">€ {COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow">
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