// src/components/ForfettariaCalculator.jsx
import React, { useState } from 'react';
import CalcoloForm from './CalcoloForm';
import RisultatiCalcolo from './RisultatiCalcolo';
import { calcolaContributiInps, verificaRequisiti } from '../utils/calcolatori';

const ForfettariaCalculator = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    annoApertura: new Date().getFullYear(),

    pensionato: false,
    altrePartiteIva: false,
    redditoDiLavoro: 0,
    coefficienteRedditività: 0,
    tipologiaInps: 'commerciante'
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
    
    const redditoImponibile = fatturato * coefficiente;
    const isFirst5Years = new Date().getFullYear() - parseInt(formData.annoApertura) < 5;
    
    // Calcola contributi INPS in base alla tipologia
    const contributiInps = calcolaContributiInps(
      redditoImponibile, 
      formData.tipologiaInps, 
      formData.pensionato
    );
    
    const aliquotaImposta = isFirst5Years ? 0.05 : 0.15;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    const totaleCosti = impostaSostitutiva + contributiInps;
    const nettoStimato = fatturato - totaleCosti;
    
    const tassazioneEffettiva = ((totaleCosti / fatturato) * 100).toFixed(1);
    
    setResults({
      redditoImponibile: redditoImponibile.toFixed(2),
      impostaSostitutiva: impostaSostitutiva.toFixed(2),
      contributiInps: contributiInps.toFixed(2),
      totaleCosti: totaleCosti.toFixed(2),
      nettoStimato: nettoStimato.toFixed(2),
      aliquotaApplicata: (aliquotaImposta * 100),
      tassazioneEffettiva
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Calcolatore Partita IVA Forfettaria</h1>
        
        <CalcoloForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={calculateTaxes}
          errors={errors}
        />

        <RisultatiCalcolo 
          results={results}
          tipologiaInps={formData.tipologiaInps}
        />
      </div>
    </div>
  );
};

export default ForfettariaCalculator;