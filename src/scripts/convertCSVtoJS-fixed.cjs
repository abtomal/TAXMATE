const fs = require('fs');
const path = require('path');

const inputFileName = 'tabella_completa-ATECO-2007-aggiornamento-2022.csv';
const outputFileName = 'atecoData.js';

// Percorsi completi
const inputPath = path.join(__dirname, '..', '..', inputFileName);
const outputPath = path.join(__dirname, '..', 'data', outputFileName);

// Mappattura dei coefficienti di redditività
const mappaCoefficienti = {
  "01": 86, "02": 86, "03": 86, "10": 40, "11": 40, "13": 67, "14": 67, "15": 67, 
  "16": 67, "17": 67, "18": 67, "20": 67, "22": 67, "23": 67, "24": 67, "25": 86, 
  "26": 67, "27": 67, "28": 67, "31": 67, "32": 67, "33": 86, "41": 86, "42": 86, 
  "43": 86, "45": 40, "46": 40, "47": 40, "49": 40, "50": 40, "51": 40, "52": 40, 
  "53": 40, "55": 40, "56": 40, "58": 67, "59": 67, "60": 67, "61": 67, "62": 67, 
  "63": 67, "64": 67, "65": 67, "66": 67, "68": 40, "69": 78, "70": 67, "71": 78, 
  "72": 67, "73": 67, "74": 78, "75": 78, "77": 40, "78": 67, "79": 67, "80": 67, 
  "81": 67, "82": 67, "85": 67, "86": 67, "87": 67, "88": 67, "90": 67, "91": 67, 
  "92": 67, "93": 67, "94": 67, "95": 67, "96": 67, "97": 67, "default": 67
};

// Mappa descrizioni manuali per codici importanti per il forfettario
const descrizioniManuali = {
  "47.11.40": "Minimercati ed altri esercizi non specializzati",
  "47.89.09": "Commercio al dettaglio ambulante di altri prodotti",
  "47.91.10": "Commercio al dettaglio via internet",
  "62.01.00": "Produzione di software non connesso all'edizione",
  "62.02.00": "Consulenza nel settore delle tecnologie dell'informatica",
  "63.11.19": "Altre elaborazioni elettroniche di dati",
  "69.10.10": "Attività degli studi legali",
  "69.20.11": "Servizi forniti da dottori commercialisti",
  "71.11.00": "Attività degli studi di architettura",
  "96.02.01": "Servizi dei saloni di barbiere e parrucchiere",
  "96.02.02": "Servizi degli istituti di bellezza",
  "43.21.01": "Installazione di impianti elettrici",
  "43.22.01": "Installazione di impianti idraulici",
  "86.90.21": "Fisioterapia",
  "86.90.29": "Altre attività paramediche indipendenti",
  "70.22.01": "Attività di consulenza per la gestione aziendale",
  "73.11.01": "Ideazione di campagne pubblicitarie",
  "74.10.10": "Attività di design e moda",
  "41.20.00": "Costruzione di edifici residenziali e non residenziali",
  "43.29.09": "Altri lavori di costruzione e installazione",
  "85.59.30": "Scuole e corsi di lingua",
  "85.59.90": "Altri servizi di istruzione",
  "66.21.00": "Attività dei periti e liquidatori indipendenti",
  "66.22.01": "Broker di assicurazioni",
  "49.41.00": "Trasporto di merci su strada",
  "52.29.22": "Servizi logistici relativi alla distribuzione delle merci",
  "74.10.29": "Altre attività dei disegnatori grafici",
  "90.01.09": "Altre rappresentazioni artistiche",
  "96.09.09": "Altri servizi per la persona nca."
};

// Lista di codici artigianali
const codiciArtigianali = [
  "41", "42", "43", "33", "95", "10", "13", "14", "15", "16", "18", "23", "25", 
  "31", "32", "96.0", "49.41", "74.20", "81.21", "81.22", "25.1", "25.2", "25.3", 
  "25.5", "25.6", "25.7", "25.9", "43.21", "43.22", "43.29", "43.3", "43.9"
];

// Mappa delle categorie
const mappaCategorie = {
  "01": "Agricoltura", "02": "Agricoltura", "03": "Agricoltura", "10": "Industria Alimentare",
  "11": "Industria Alimentare", "13": "Manifattura", "14": "Manifattura", "15": "Manifattura",
  "16": "Manifattura", "17": "Manifattura", "18": "Manifattura", "20": "Industria Chimica",
  "22": "Manifattura", "23": "Manifattura", "24": "Manifattura", "25": "Manifattura",
  "26": "Elettronica", "27": "Elettronica", "28": "Manifattura", "31": "Manifattura",
  "32": "Manifattura", "33": "Riparazione", "41": "Costruzioni", "42": "Costruzioni",
  "43": "Artigianato", "45": "Commercio", "46": "Commercio", "47": "Commercio",
  "49": "Trasporti", "50": "Trasporti", "51": "Trasporti", "52": "Logistica",
  "53": "Logistica", "55": "Turismo", "56": "Ristorazione", "58": "Editoria",
  "59": "Media", "60": "Media", "61": "Telecomunicazioni", "62": "Servizi IT",
  "63": "Servizi IT", "64": "Finanza", "65": "Finanza", "66": "Intermediazione",
  "68": "Immobiliare", "69": "Professioni", "70": "Consulenza", "71": "Professioni",
  "72": "Ricerca", "73": "Marketing", "74": "Design", "75": "Veterinaria",
  "77": "Noleggio", "78": "Risorse Umane", "79": "Turismo", "80": "Sicurezza",
  "81": "Servizi", "82": "Servizi", "85": "Istruzione", "86": "Sanità",
  "87": "Sanità", "88": "Servizi Sociali", "90": "Arte e Intrattenimento",
  "91": "Arte e Intrattenimento", "92": "Gioco", "93": "Sport", "94": "Associazioni",
  "95": "Riparazione", "96": "Servizi alla persona", "97": "Servizi alla persona",
  "default": "Altro"
};

// Funzione per determinare la tipologia (artigiano/commerciante)
function determinaTipo(codice) {
  for (const prefisso of codiciArtigianali) {
    if (codice.startsWith(prefisso)) {
      return "artigiano";
    }
  }
  return "commerciante";
}

// Funzione per determinare la categoria
function determinaCategoria(codice) {
  const prefix = codice.split('.')[0];
  return mappaCategorie[prefix] || mappaCategorie["default"];
}

// Funzione per ottenere il coefficiente di redditività
function getCoefficient(codice) {
  // Cerca corrispondenze esatte
  if (mappaCoefficienti[codice]) {
    return mappaCoefficienti[codice];
  }
  
  // Altrimenti prendi le prime 2 cifre
  const prefix = codice.split('.')[0];
  return mappaCoefficienti[prefix] || mappaCoefficienti["default"];
}

// Funzione per ottenere la descrizione
function getDescrizione(codice, descrizioneCSV) {
  // Prima controlliamo se esiste una descrizione manuale
  if (descrizioniManuali[codice]) {
    return descrizioniManuali[codice];
  }

  // Altrimenti usiamo la descrizione dal CSV se disponibile
  if (descrizioneCSV && descrizioneCSV.trim() !== '') {
    return descrizioneCSV.trim();
  }

  // Se non abbiamo descrizioni manuali, otteniamo informazioni dal codice stesso
  const parti = codice.split('.');
  if (parti.length === 3) {
    const prefisso = parti[0];
    let descGenerica = '';
    
    switch(prefisso) {
      case '01': case '02': case '03':
        descGenerica = "Attività nel settore agricolo/forestale/ittico";
        break;
      case '10': case '11': case '12':
        descGenerica = "Industria alimentare o delle bevande";
        break;
      case '13': case '14': case '15':
        descGenerica = "Manifattura tessile, abbigliamento o pelle";
        break;
      case '16': case '17': case '18':
        descGenerica = "Lavorazione legno, carta o stampa";
        break;
      case '20': case '21': case '22': case '23':
        descGenerica = "Produzione chimica, farmaceutica o materiali";
        break;
      case '24': case '25':
        descGenerica = "Lavorazione metalli";
        break;
      case '26': case '27': case '28':
        descGenerica = "Produzione apparecchiature elettriche/elettroniche";
        break;
      case '31': case '32': case '33':
        descGenerica = "Produzione mobili, altre industrie o riparazioni";
        break;
      case '41': case '42': case '43':
        descGenerica = "Attività di costruzione o installazione";
        break;
      case '45': case '46': case '47':
        descGenerica = "Attività commerciale";
        break;
      case '49': case '50': case '51': case '52': case '53':
        descGenerica = "Servizi di trasporto o logistica";
        break;
      case '55': case '56':
        descGenerica = "Servizi di alloggio o ristorazione";
        break;
      case '58': case '59': case '60': case '61': case '62': case '63':
        descGenerica = "Attività di informazione, comunicazione o informatica";
        break;
      case '64': case '65': case '66':
        descGenerica = "Attività finanziaria o assicurativa";
        break;
      case '68':
        descGenerica = "Attività immobiliare";
        break;
      case '69': case '70': case '71': case '72': case '73': case '74': case '75':
        descGenerica = "Attività professionale, scientifica o tecnica";
        break;
      case '77': case '78': case '79': case '80': case '81': case '82':
        descGenerica = "Servizi di supporto alle imprese";
        break;
      case '85':
        descGenerica = "Attività di istruzione";
        break;
      case '86': case '87': case '88':
        descGenerica = "Attività sanitaria o di assistenza sociale";
        break;
      case '90': case '91': case '92': case '93':
        descGenerica = "Attività artistiche, sportive o di intrattenimento";
        break;
      case '94': case '95': case '96': case '97':
        descGenerica = "Altri servizi";
        break;
      default:
        descGenerica = "Attività economica specificata dal codice";
    }
    
    return `${descGenerica} (${codice})`;
  }
  
  // Se tutto fallisce
  return `Attività con codice ${codice}`;
}

function convertCSVtoJS() {
  try {
    // Leggi il file CSV
    const csvData = fs.readFileSync(inputPath, 'utf8');
    
    // Variabile per tenere traccia dei codici validi
    let codiciValidiTrovati = 0;
    let codiciConDescrizioneManuale = 0;
    let codiciConDescrizioneGenerata = 0;
    
    // Dividi in righe, pulendo eventuali ritorni a capo Windows
    const lines = csvData.split(/\r?\n/);
    console.log(`File CSV letto con ${lines.length} righe`);
    
    // Estrai tutti i codici validi dal CSV, non preoccupandoti delle descrizioni
    const codiciAteco = [];
    const codePattern = /^[\d]{2}\.[\d]{2}\.[\d]{2}$/;
    
    // Primo passaggio: Estrai tutti i codici dal file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Cerchiamo di estrarre il codice. Potrebbe essere all'inizio della riga o tra virgolette
      let codice = '';
      
      // Prova a estrarre un codice di formato xx.xx.xx
      const match = line.match(/["']?(\d{2}\.\d{2}\.\d{2})["']?/);
      if (match) {
        codice = match[1];
      }
      
      // Se non troviamo un codice nel formato standard, passiamo alla prossima riga
      if (!codice || !codePattern.test(codice)) {
        continue;
      }
      
      // Ottenere una descrizione dal CSV è complesso, quindi usiamo una descrizione generica
      const descrizione = getDescrizione(codice, line);
      
      // Calcola il coefficiente in base al codice
      const coefficiente = getCoefficient(codice);
      
      // Determina la tipologia (artigiano/commerciante)
      const tipo = determinaTipo(codice);
      
      // Determina la categoria
      const categoria = determinaCategoria(codice);
      
      // Conta per statistiche
      codiciValidiTrovati++;
      if (descrizioniManuali[codice]) {
        codiciConDescrizioneManuale++;
      } else {
        codiciConDescrizioneGenerata++;
      }
      
      // Aggiungi all'array
      codiciAteco.push({
        codice: codice,
        descrizione: descrizione,
        coefficiente: coefficiente,
        tipo: tipo,
        categoria: categoria,
        note: `Settore ${categoria}`
      });
    }
    
    // Come fallback, aggiungiamo manualmente i codici più comuni nel forfettario
    // se non sono stati trovati nel CSV
    const codiciComuni = Object.keys(descrizioniManuali);
    for (const codice of codiciComuni) {
      // Verifica se il codice è già nell'array
      const esistente = codiciAteco.find(item => item.codice === codice);
      if (!esistente) {
        const descrizione = descrizioniManuali[codice];
        const coefficiente = getCoefficient(codice);
        const tipo = determinaTipo(codice);
        const categoria = determinaCategoria(codice);
        
        codiciAteco.push({
          codice: codice,
          descrizione: descrizione,
          coefficiente: coefficiente,
          tipo: tipo,
          categoria: categoria,
          note: `Settore ${categoria}`
        });
        
        codiciValidiTrovati++;
        codiciConDescrizioneManuale++;
      }
    }
    
    // Ordina per codice
    codiciAteco.sort((a, b) => a.codice.localeCompare(b.codice));
    
    // Crea il contenuto del file JS
    const jsContent = `// File generato automaticamente da convertCSVtoJS-fixed.cjs
// Dati dalla tabella ATECO 2007 (aggiornamento 2022)
export const atecoData = ${JSON.stringify(codiciAteco, null, 2)};

export default atecoData;`;
    
    // Assicurati che la directory di destinazione esista
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Scrivi il file JS
    fs.writeFileSync(outputPath, jsContent);
    
    console.log(`Conversione completata con successo! File generato: ${outputPath}`);
    console.log(`Trovati ${codiciValidiTrovati} codici ATECO validi`);
    console.log(`  - ${codiciConDescrizioneManuale} con descrizione manuale`);
    console.log(`  - ${codiciConDescrizioneGenerata} con descrizione generata`);
  } catch (error) {
    console.error('Errore durante la conversione:', error);
  }
}

convertCSVtoJS();