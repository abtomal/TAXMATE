// src/utils/calcolatori.js

export const COSTANTI = {
    QUOTA_FISSA_TRIMESTRALE_ARTIGIANO: 1106.76,
    SOGLIA_REDDITO_ARTIGIANO: 18415,
    ALIQUOTA_AGGIUNTIVA_ARTIGIANO: 0.24,
    ALIQUOTA_COMMERCIANTE: 0.2607,
    LIMITE_FATTURATO: 85000,
    LIMITE_REDDITO_LAVORO: 30000,
  };
  
  export const calcolaContributiInps = (redditoImponibile, tipologiaInps, isPensionato) => {
    if (tipologiaInps === 'artigiano') {
      // Quota fissa annuale (4 trimestri)
      const quotaFissa = COSTANTI.QUOTA_FISSA_TRIMESTRALE_ARTIGIANO * 4;
      
      // Contributo aggiuntivo per reddito eccedente
      let contributoAggiuntivo = 0;
      if (redditoImponibile > COSTANTI.SOGLIA_REDDITO_ARTIGIANO) {
        const redditoEccedente = redditoImponibile - COSTANTI.SOGLIA_REDDITO_ARTIGIANO;
        contributoAggiuntivo = redditoEccedente * COSTANTI.ALIQUOTA_AGGIUNTIVA_ARTIGIANO;
      }
  
      const totaleContributi = quotaFissa + contributoAggiuntivo;
      // Se pensionato, si paga la metà sia della quota fissa che del contributo aggiuntivo
      return isPensionato ? totaleContributi / 2 : totaleContributi;
    } else {
      // Commerciante
      const contributi = redditoImponibile * COSTANTI.ALIQUOTA_COMMERCIANTE;
      return isPensionato ? contributi / 2 : contributi;
    }
  };
  
  export const verificaRequisiti = (formData) => {
    const errors = [];
    
    if (parseFloat(formData.fatturato) > COSTANTI.LIMITE_FATTURATO) {
      errors.push(`Il fatturato supera il limite di ${COSTANTI.LIMITE_FATTURATO.toLocaleString()}€`);
    }
  
  
  
    if (parseFloat(formData.redditoDiLavoro) > COSTANTI.LIMITE_REDDITO_LAVORO) {
      errors.push(`Il reddito da lavoro dipendente supera ${COSTANTI.LIMITE_REDDITO_LAVORO.toLocaleString()}€`);
    }
  
    if (formData.altrePartiteIva) {
      errors.push("Non puoi avere partecipazioni in società");
    }
  
    return errors;
  };