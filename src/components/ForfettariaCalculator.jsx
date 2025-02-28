import React, { useState } from 'react';
import CalcoloForm from './Form';
import RisultatiCalcolo from './RisultatiCalcolo';
import { calcolaContributiInps, verificaRequisiti } from '../utils/calcolatori';

const ForfettariaCalculator = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    fatturatoPrecedente: '',
    codiceAteco: '',
    annoApertura: new Date().getFullYear(),
    pensionato: false,
    altrePartiteIva: false,
    redditoDiLavoro: 0,
    coefficienteRedditività: 0,
    tipologiaInps: 'commerciante' // Valore predefinito, verrà aggiornato quando si seleziona un codice ATECO
  });

  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState(null);

  const calculateTaxes = (e) => {
    e.preventDefault();
    
    const errors = verificaRequisiti(formData);
    setErrors(errors);
    
    if (errors.length > 0) {
      setResults(null);
      return;
    }

    const fatturato = parseFloat(formData.fatturato);
    const coefficiente = formData.coefficienteRedditività / 100;
    
    // Calcolo del reddito imponibile lordo
    const redditoImponibile = fatturato * coefficiente;
    
    // Calcolo dei contributi INPS
    const contributiInps = calcolaContributiInps(
      redditoImponibile, 
      formData.tipologiaInps, 
      formData.pensionato
    );
    
    // MODIFICA: Calcolo dell'imponibile netto (sottraendo i contributi INPS)
    const imponibileNetto = redditoImponibile - contributiInps;
    
    // Determina se si applica l'aliquota agevolata per i primi 5 anni
    const isFirst5Years = new Date().getFullYear() - parseInt(formData.annoApertura) < 5;
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    
    // MODIFICA: Calcolo dell'imposta sostitutiva sull'imponibile netto
    const impostaSostitutiva = imponibileNetto * aliquotaImposta;
    
    // Calcolo del totale costi
    const totaleCosti = impostaSostitutiva + contributiInps;
    
    // Calcolo del netto stimato
    const nettoStimato = fatturato - totaleCosti;
    
    // Calcolo della tassazione effettiva
    const tassazioneEffettiva = ((totaleCosti / fatturato) * 100).toFixed(1);
    
    setResults({
      redditoImponibile: redditoImponibile.toFixed(2),
      contributiInps: contributiInps.toFixed(2),
      imponibileNetto: imponibileNetto.toFixed(2), // Aggiungiamo l'imponibile netto
      impostaSostitutiva: impostaSostitutiva.toFixed(2),
      totaleCosti: totaleCosti.toFixed(2),
      nettoStimato: nettoStimato.toFixed(2),
      aliquotaApplicata: (aliquotaImposta * 100),
      tassazioneEffettiva
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CalcoloForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={calculateTaxes}
          errors={errors}
        />

        <RisultatiCalcolo 
          results={results}
          tipologiaInps={formData.tipologiaInps}
          annoApertura={formData.annoApertura}
          fatturatoPrecedente={formData.fatturatoPrecedente}
          fatturato={formData.fatturato}
          coefficienteRedditività={formData.coefficienteRedditività}
        />
      </div>
    </div>
  );
};

export default ForfettariaCalculator;