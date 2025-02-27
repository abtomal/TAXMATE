// src/components/ProiezioniContabilita.jsx
import React, { useState, useEffect } from 'react';
import { COSTANTI } from '../utils/calcolatori';

const ProiezioniContabilita = ({ fatture, codiceAteco, coefficienteRedditività, annoApertura, tipologiaInps, onClose }) => {
  const [mostraDettagli, setMostraDettagli] = useState(false);
  const [results, setResults] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    const annoCorrente = new Date().getFullYear();
    // Converti annoApertura in un numero intero valido
    const annoAperturaNum = parseInt(annoApertura);
    
    // Salva informazioni di debug
    setDebugInfo({
      annoAperturaOriginale: annoApertura,
      annoAperturaConvertito: annoAperturaNum,
      annoCorrente,
      isAnnoCorrente: annoAperturaNum === annoCorrente,
      isAnnoValido: !isNaN(annoAperturaNum) && annoAperturaNum > 1900 && annoAperturaNum <= annoCorrente
    });
    
    // Filtra le fatture dell'anno corrente
    const fattureAnnoCorrente = fatture.filter(fattura => {
      const dataEmissione = new Date(fattura.dataEmissione);
      return dataEmissione.getFullYear() === annoCorrente;
    });
    
    // Calcola il fatturato totale dell'anno corrente
    const fatturato = fattureAnnoCorrente.reduce((total, fattura) => 
      total + parseFloat(fattura.fatturato), 0);
    
    // Calcola il reddito imponibile
    const coefficiente = coefficienteRedditività / 100;
    const redditoImponibile = fatturato * coefficiente;
    
    // Determina se l'azienda è nei primi 5 anni
    const isFirst5Years = annoCorrente - annoAperturaNum < 5;
    
    // Calcola l'imposta sostitutiva
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    
    // Calcola i contributi INPS
    let contributiInps = 0;
    if (tipologiaInps === 'artigiano') {
      // Quota fissa annuale
      let contributo = COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4;
      
      // Contributo aggiuntivo se il reddito supera la soglia
      if (redditoImponibile > COSTANTI.SOGLIA_REDDITO_ARTIGIANO) {
        contributo += (redditoImponibile - COSTANTI.SOGLIA_REDDITO_ARTIGIANO) * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO;
      }
      
      contributiInps = contributo;
    } else {
      // Commerciante
      contributiInps = redditoImponibile * COSTANTI.ALIQUOTA_COMMERCIANTE;
    }
    
    // Calcola il totale dei costi
    const totaleCosti = impostaSostitutiva + contributiInps;
    
    // Calcola il netto stimato
    const nettoStimato = fatturato - totaleCosti;
    
    // Calcola la tassazione effettiva
    const tassazioneEffettiva = fatturato > 0 ? ((totaleCosti / fatturato) * 100).toFixed(1) : "0.0";
    
    // Prepara i risultati
    setResults({
      fatturato: fatturato.toFixed(2),
      redditoImponibile: redditoImponibile.toFixed(2),
      impostaSostitutiva: impostaSostitutiva.toFixed(2),
      contributiInps: contributiInps.toFixed(2),
      totaleCosti: totaleCosti.toFixed(2),
      nettoStimato: nettoStimato.toFixed(2),
      aliquotaApplicata: (aliquotaImposta * 100),
      tassazioneEffettiva
    });
  }, [fatture, codiceAteco, coefficienteRedditività, annoApertura, tipologiaInps]);
  
  if (!results) return <div className="p-6 text-center">Calcolo in corso...</div>;
  
  // Calcolo degli acconti per l'anno successivo
  const calcolaAccontiAnnoSuccessivo = () => {
    const annoCorrente = new Date().getFullYear();
    // Converti annoApertura in un numero intero valido
    const annoAperturaNum = parseInt(annoApertura);
    
    // Verifica se l'anno di apertura è valido e se è l'anno corrente
    const isAnnoValido = !isNaN(annoAperturaNum) && annoAperturaNum > 1900 && annoAperturaNum <= annoCorrente;
    const isAnnoCorrente = annoAperturaNum === annoCorrente;
    
    // Se l'anno non è valido o è l'anno corrente, non calcolare gli acconti
    if (!isAnnoValido || isAnnoCorrente) {
      return {
        deveCalcolareAcconti: false,
        importoTotale: 0,
        messaggio: `Non sono previsti acconti per l'anno successivo perché ${
          !isAnnoValido ? "l'anno di apertura non è valido." : "la partita IVA è stata aperta nell'anno corrente."
        }`
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
  
  // Calcola acconti per l'anno successivo
  const infoAcconti = calcolaAccontiAnnoSuccessivo();
  
  // Aggiunge gli acconti al totale dei costi
  const totaleCostiConAcconti = parseFloat(results.totaleCosti) + infoAcconti.importoTotale;
  
  // Ricalcola il netto con gli acconti inclusi
  const nettoStimatoConAcconti = parseFloat(results.nettoStimato) - infoAcconti.importoTotale;
  
  // Stato acconti anno successivo
  const getStatoAccontiAnnoSuccessivo = () => {
    if (!infoAcconti.deveCalcolareAcconti) {
      return infoAcconti.messaggio;
    } else if (infoAcconti.unicaRata) {
      return <><span className="font-bold">€ {infoAcconti.importoTotale.toFixed(2)}</span> in unica soluzione entro il 30 novembre.</>;
    } else {
      return <><span className="font-bold">€ {infoAcconti.importoTotale.toFixed(2)}</span> in due rate: <span className="font-bold">€ {infoAcconti.importoPrimaRata.toFixed(2)}</span> entro il 30 giugno e <span className="font-bold">€ {infoAcconti.importoSecondaRata.toFixed(2)}</span> entro il 30 novembre.</>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Proiezioni Contabilità</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-2">Basato su</h3>
            <p>Fatturato dell'anno corrente: <span className="font-bold">€ {results.fatturato}</span></p>
            <p>Partita IVA aperta nell'anno: <span className="font-bold">{debugInfo.annoAperturaConvertito || "N/A"}</span></p>
          </div>
          
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
          
          {/* Sezione acconti per l'anno successivo */}
          <div className="p-5 bg-yellow-200 rounded-lg shadow border border-black-100">
            <h4 className="text-md font-semibold text-black-800">Acconti per l'anno successivo</h4>
            <p className="text-sm mt-2">{getStatoAccontiAnnoSuccessivo()}</p>
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
      </div>
    </div>
  );
};

export default ProiezioniContabilita;