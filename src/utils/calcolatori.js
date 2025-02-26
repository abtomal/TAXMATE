export const COSTANTI = {
  QUOTA_FISSA_TRIMESTRALE_ARTIGIANO: 1106.76,
  SOGLIA_REDDITO_ARTIGIANO: 18415,
  ALIQUOTA_AGGIUNTIVA_ARTIGIANO: 0.24,
  ALIQUOTA_COMMERCIANTE: 0.2607,
  LIMITE_FATTURATO: 85000,
  LIMITE_FATTURATO_IMMEDIATO: 100000,
  LIMITE_REDDITO_LAVORO: 30000,
};

export const calcolaContributiInps = (redditoImponibile, tipologiaInps, isPensionato) => {
  if (tipologiaInps === 'artigiano') {
    const quotaFissa = COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4;
    
    let contributoAggiuntivo = 0;
    if (redditoImponibile > COSTANTI.SOGLIA_REDDITO_ARTIGIANO) {
      const redditoEccedente = redditoImponibile - COSTANTI.SOGLIA_REDDITO_ARTIGIANO;
      contributoAggiuntivo = redditoEccedente * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO;
    }

    const totaleContributi = quotaFissa + contributoAggiuntivo;
    return isPensionato ? totaleContributi / 2 : totaleContributi;
  } else {
    const contributi = redditoImponibile * COSTANTI.ALIQUOTA_COMMERCIANTE;
    return isPensionato ? contributi / 2 : contributi;
  }
};

export const verificaRequisiti = (formData) => {
  const errors = [];
  
  // Verifica il limite di fatturato per l'anno corrente
  if (parseFloat(formData.fatturato) > COSTANTI.LIMITE_FATTURATO) {
    errors.push(`Il fatturato dell'anno corrente supera il limite di ${COSTANTI.LIMITE_FATTURATO.toLocaleString()}€. Dall'anno prossimo dovrai passare al regime ordinario.`);
  }

  // Verifica il limite di fatturato di 100.000€ (uscita immediata)
  if (parseFloat(formData.fatturato) > COSTANTI.LIMITE_FATTURATO_IMMEDIATO) {
    errors.push(`Il fatturato supera il limite di ${COSTANTI.LIMITE_FATTURATO_IMMEDIATO.toLocaleString()}€. Sei già fuori dal regime forfettario.`);
  }

  // Verifica se il fatturato dell'anno precedente supera il limite
  if (formData.fatturatoPrecedente && parseFloat(formData.fatturatoPrecedente) > COSTANTI.LIMITE_FATTURATO) {
    errors.push(`Il fatturato dell'anno precedente supera il limite di ${COSTANTI.LIMITE_FATTURATO.toLocaleString()}€. Dovresti già essere nel regime ordinario.`);
  }

  // Verifica il limite di reddito da lavoro dipendente
  if (parseFloat(formData.redditoDiLavoro) > COSTANTI.LIMITE_REDDITO_LAVORO) {
    errors.push(`Il reddito da lavoro dipendente supera ${COSTANTI.LIMITE_REDDITO_LAVORO.toLocaleString()}€. Non puoi accedere al regime forfettario.`);
  }

  // Verifica partecipazioni in società
  if (formData.altrePartiteIva) {
    errors.push("Non puoi avere partecipazioni in società e rimanere nel regime forfettario.");
  }

  return errors;
};