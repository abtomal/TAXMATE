// ateco-service.js
import { atecoData } from './ateco-forfettario';

// Lazy loading del dataset completo
let atecoCompleto = null;

// Funzione per caricare i dati completi solo quando necessario
async function caricaAtecoCompleto() {
  if (!atecoCompleto) {
    const { default: dati } = await import('./ateco-completo');
    atecoCompleto = dati;
  }
  return atecoCompleto;
}

/**
 * Mappa il coefficiente di redditività in base al codice ATECO
 * @param {string} codice - Il codice ATECO
 * @returns {number} Il coefficiente di redditività
 */
export function mappaCoefficienti(codice) {
  const mappa = {
    "01": 86, // Agricoltura
    "02": 86, // Silvicoltura
    "03": 86, // Pesca
    "10": 40, // Industrie alimentari
    "11": 40, // Bevande
    "13": 67, // Tessili
    "14": 67, // Abbigliamento
    "15": 67, // Pelle
    "16": 67, // Legno
    "17": 67, // Carta
    "18": 67, // Stampa
    "20": 67, // Chimica
    "22": 67, // Gomma e plastica
    "23": 67, // Minerali non metalliferi
    "24": 67, // Metallurgia
    "25": 86, // Prodotti in metallo
    "26": 67, // Computer ed elettronica
    "27": 67, // Apparecchiature elettriche
    "28": 67, // Macchinari
    "31": 67, // Mobili
    "32": 67, // Altre industrie manifatturiere
    "33": 86, // Riparazione e manutenzione
    "41": 86, // Costruzione di edifici
    "42": 86, // Ingegneria civile
    "43": 86, // Lavori di costruzione specializzati
    "45": 40, // Commercio e riparazione di autoveicoli
    "46": 40, // Commercio all'ingrosso
    "47": 40, // Commercio al dettaglio
    "49": 40, // Trasporto terrestre
    "50": 40, // Trasporto marittimo
    "51": 40, // Trasporto aereo
    "52": 40, // Magazzinaggio
    "53": 40, // Servizi postali
    "55": 40, // Alloggio
    "56": 40, // Ristorazione
    "58": 67, // Attività editoriali
    "59": 67, // Produzione cinematografica
    "60": 67, // Attività di programmazione e trasmissione
    "61": 67, // Telecomunicazioni
    "62": 67, // Servizi IT
    "63": 67, // Servizi informativi
    "64": 67, // Servizi finanziari
    "65": 67, // Assicurazioni
    "66": 67, // Attività ausiliarie finanziarie
    "68": 40, // Attività immobiliari
    "69": 78, // Attività legali e contabilità
    "70": 67, // Attività di direzione aziendale
    "71": 78, // Attività degli studi di architettura e ingegneria
    "72": 67, // Ricerca scientifica
    "73": 67, // Pubblicità e ricerche di mercato
    "74": 78, // Altre attività professionali
    "75": 78, // Servizi veterinari
    "77": 40, // Noleggio
    "78": 67, // Attività di ricerca del personale
    "79": 67, // Agenzie di viaggio
    "80": 67, // Servizi di vigilanza
    "81": 67, // Servizi per edifici e paesaggio
    "82": 67, // Supporto alle imprese
    "85": 67, // Istruzione
    "86": 67, // Assistenza sanitaria
    "87": 67, // Servizi di assistenza sociale residenziale
    "88": 67, // Assistenza sociale non residenziale
    "90": 67, // Attività creative, artistiche e di intrattenimento
    "91": 67, // Biblioteche, archivi, musei
    "92": 67, // Attività riguardanti le lotterie
    "93": 67, // Attività sportive
    "94": 67, // Attività di organizzazioni associative
    "95": 67, // Riparazione di computer
    "96": 67, // Altri servizi personali
    "97": 67, // Attività di famiglie e convivenze
    "default": 67 // Valore predefinito
  };
  
  // Cerchiamo prima le corrispondenze esatte per i codici principali
  if (mappa[codice]) {
    return mappa[codice];
  }
  
  // Altrimenti prendiamo le prime 2 cifre
  const prefix = codice.split('.')[0];
  return mappa[prefix] || mappa.default;
}

/**
 * Determina se il codice ATECO corrisponde a un tipo artigiano o commerciante
 * @param {string} codice - Il codice ATECO
 * @returns {string} Il tipo ("artigiano" o "commerciante")
 */
export function determinaTipo(codice) {
  // Elenco di codici tipicamente artigianali
  const codiciArtigianali = [
    // Settore costruzioni
    "41", "42", "43", 
    // Riparazioni e installazioni
    "33", "95", 
    // Manifattura
    "10", "13", "14", "15", "16", "18", "23", "25", "31", "32",
    // Servizi alla persona
    "96.0",
    // Trasporto merci
    "49.41",
    // Specifici sottogruppi
    "74.20", // Fotografi
    "81.21", "81.22", // Pulizie
    "25.1", "25.2", "25.3", "25.5", "25.6", "25.7", "25.9", // Fabbricazione prodotti in metallo
    "43.21", "43.22", "43.29", "43.3", "43.9" // Installazione impianti e lavori di completamento
  ];
  
  for (const prefisso of codiciArtigianali) {
    if (codice.startsWith(prefisso)) {
      return "artigiano";
    }
  }
  
  return "commerciante";
}

/**
 * Determina la categoria del codice ATECO
 * @param {string} codice - Il codice ATECO
 * @param {string} descrizione - La descrizione del codice ATECO
 * @returns {string} La categoria
 */
export function determinaCategoria(codice, descrizione) {
  // Mappa delle principali categorie basate sui prefissi
  const mappaCategorie = {
    "01": "Agricoltura",
    "02": "Agricoltura",
    "03": "Agricoltura",
    "10": "Industria Alimentare",
    "11": "Industria Alimentare",
    "13": "Manifattura",
    "14": "Manifattura",
    "15": "Manifattura",
    "16": "Manifattura",
    "17": "Manifattura",
    "18": "Manifattura",
    "20": "Industria Chimica",
    "22": "Manifattura",
    "23": "Manifattura",
    "24": "Manifattura",
    "25": "Manifattura",
    "26": "Elettronica",
    "27": "Elettronica",
    "28": "Manifattura",
    "31": "Manifattura",
    "32": "Manifattura",
    "33": "Riparazione",
    "41": "Costruzioni",
    "42": "Costruzioni",
    "43": "Artigianato",
    "45": "Commercio",
    "46": "Commercio",
    "47": "Commercio",
    "49": "Trasporti",
    "50": "Trasporti",
    "51": "Trasporti",
    "52": "Logistica",
    "53": "Logistica",
    "55": "Turismo",
    "56": "Ristorazione",
    "58": "Editoria",
    "59": "Media",
    "60": "Media",
    "61": "Telecomunicazioni",
    "62": "Servizi IT",
    "63": "Servizi IT",
    "64": "Finanza",
    "65": "Finanza",
    "66": "Intermediazione",
    "68": "Immobiliare",
    "69": "Professioni",
    "70": "Consulenza",
    "71": "Professioni",
    "72": "Ricerca",
    "73": "Marketing",
    "74": "Design",
    "75": "Veterinaria",
    "77": "Noleggio",
    "78": "Risorse Umane",
    "79": "Turismo",
    "80": "Sicurezza",
    "81": "Servizi",
    "82": "Servizi",
    "85": "Istruzione",
    "86": "Sanità",
    "87": "Sanità",
    "88": "Servizi Sociali",
    "90": "Arte e Intrattenimento",
    "91": "Arte e Intrattenimento",
    "92": "Gioco",
    "93": "Sport",
    "94": "Associazioni",
    "95": "Riparazione",
    "96": "Servizi alla persona",
    "97": "Servizi alla persona"
  };
  
  const prefix = codice.split('.')[0];
  return mappaCategorie[prefix] || "Altro";
}

/**
 * Cerca i codici ATECO in base a un termine di ricerca
 * @param {string} termine - Il termine di ricerca
 * @param {number} limite - Limite di risultati (default: 10)
 * @returns {Promise<Array>} Array di risultati
 */
export async function cercaCodiciAteco(termine, limite = 10) {
  if (!termine) return [];
  
  const terminiRicerca = termine.toLowerCase().split(' ').filter(t => t.length > 0);
  
  // Prima cerca nel dataset forfettario (più comune e veloce)
  const risultatiComuni = atecoData.filter(ateco => {
    const testo = `${ateco.codice} ${ateco.descrizione} ${ateco.categoria}`.toLowerCase();
    return terminiRicerca.every(t => testo.includes(t));
  });
  
  if (risultatiComuni.length > 0) {
    return risultatiComuni.slice(0, limite);
  }
  
  // Se non trova nulla, carica e cerca nel dataset completo
  const datiCompleti = await caricaAtecoCompleto();
  
  return datiCompleti
    .filter(ateco => {
      const testo = `${ateco.codice} ${ateco.descrizione}`.toLowerCase();
      return terminiRicerca.every(t => testo.includes(t));
    })
    .map(ateco => ({
      ...ateco,
      coefficiente: mappaCoefficienti(ateco.codice),
      tipo: determinaTipo(ateco.codice),
      categoria: determinaCategoria(ateco.codice, ateco.descrizione),
      note: `Automaticamente categorizzato basato sul codice ${ateco.codice}`
    }))
    .slice(0, limite);
}

/**
 * Ottiene un singolo codice ATECO dato il suo codice
 * @param {string} codice - Il codice ATECO da cercare
 * @returns {Promise<Object|null>} L'oggetto codice ATECO o null se non trovato
 */
export async function getCodiceByCodice(codice) {
  if (!codice) return null;
  
  // Prima cerca nel dataset forfettario
  const trovato = atecoData.find(ateco => ateco.codice === codice);
  if (trovato) return trovato;
  
  // Se non trova, cerca nel dataset completo
  const datiCompleti = await caricaAtecoCompleto();
  const trovatoCompleto = datiCompleti.find(ateco => ateco.codice === codice);
  
  if (!trovatoCompleto) return null;
  
  // Arricchisci con le informazioni mancanti
  return {
    ...trovatoCompleto,
    coefficiente: mappaCoefficienti(trovatoCompleto.codice),
    tipo: determinaTipo(trovatoCompleto.codice),
    categoria: determinaCategoria(trovatoCompleto.codice, trovatoCompleto.descrizione),
    note: `Automaticamente categorizzato basato sul codice ${trovatoCompleto.codice}`
  };
}

export default {
  cercaCodiciAteco,
  getCodiceByCodice,
  mappaCoefficienti,
  determinaTipo,
  determinaCategoria
};