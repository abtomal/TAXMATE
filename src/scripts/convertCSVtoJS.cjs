// Script per convertire il CSV dei codici ATECO in file JS

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * Converte il file CSV in formato JS
 * @param {string} csvPath - Percorso del file CSV
 * @param {string} outputPath - Percorso dove salvare il file JS
 */
function convertCSVtoJS(csvPath, outputPath) {
  console.log(`Conversione di ${csvPath} in corso...`);
  
  try {
    // Leggi il file CSV
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parsa il CSV (gestisce automaticamente le virgolette)
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`Letti ${records.length} codici ATECO dal file CSV`);
    
    // Trasforma i record in oggetti JS
    const atecoArray = records.map(record => {
      // Assumiamo che le colonne siano "Codice Ateco 2007 aggiornamento 2022" e "Titolo Ateco 2007 aggiornamento 2022"
      const codice = record['Codice Ateco 2007 aggiornamento 2022'] || '';
      const descrizione = record['Titolo Ateco 2007 aggiornamento 2022'] || '';
      
      return {
        codice: codice.trim(),
        descrizione: descrizione.trim()
      };
    });
    
    // Crea il contenuto del file JS
    const jsContent = `// File generato automaticamente - Contiene tutti i codici ATECO 2007 (aggiornamento 2022)
// Totale codici: ${atecoArray.length}

export const atecoCompleto = ${JSON.stringify(atecoArray, null, 2)};

export default atecoCompleto;`;
    
    // Assicurati che la directory di output esista
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Scrivi il file JS
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    
    console.log(`Conversione completata! File salvato in ${outputPath}`);
    console.log(`Sono stati convertiti ${atecoArray.length} codici ATECO`);

    // Dividi il file in chunks
    createChunks(atecoArray, path.join(outputDir, 'ateco-chunks'));
    
    return {
      totalCodes: atecoArray.length,
      outputPath
    };
  } catch (error) {
    console.error('Errore durante la conversione:', error);
    throw error;
  }
}

/**
 * Divide l'array di codici ATECO in chunk più piccoli
 * @param {Array} atecoArray - Array di codici ATECO
 * @param {string} chunksDir - Directory dove salvare i chunks
 */
function createChunks(atecoArray, chunksDir) {
  console.log(`Divisione dell'array in chunks più piccoli...`);
  
  // Crea la directory se non esiste
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }
  
  // Dimensione di ogni chunk
  const chunkSize = 500;
  
  // Dividi l'array in parti
  const chunks = [];
  for (let i = 0; i < atecoArray.length; i += chunkSize) {
    chunks.push(atecoArray.slice(i, i + chunkSize));
  }
  
  console.log(`Array diviso in ${chunks.length} chunks`);
  
  // Scrivi ogni chunk in un file separato
  chunks.forEach((chunk, index) => {
    const filePath = path.join(chunksDir, `chunk-${index}.js`);
    const fileContent = `// Parte ${index + 1} di ${chunks.length} del database ATECO
// Contiene ${chunk.length} codici

export const atecoChunk = ${JSON.stringify(chunk, null, 2)};

export default atecoChunk;`;

    fs.writeFileSync(filePath, fileContent, 'utf8');
  });
  
  // Crea un file index.js che importa tutti i chunks
  const indexFilePath = path.join(chunksDir, 'index.js');
  const indexContent = `// Indice dei chunks del database ATECO
// Totale chunks: ${chunks.length}

export const loadAllChunks = async () => {
  const chunks = [];
  
${chunks.map((_, index) => `  chunks.push((await import('./chunk-${index}.js')).default);`).join('\n')}
  
  // Unisce tutti i chunks in un unico array piatto
  return chunks.flat();
};

export default { loadAllChunks };`;

  fs.writeFileSync(indexFilePath, indexContent, 'utf8');
  
  console.log(`Chunks creati con successo in ${chunksDir}`);
}

// Esegui lo script se chiamato direttamente
if (require.main === module) {
  const csvPath = process.argv[2] || 'tabella_completaATECO2007aggiornamento2022.csv';
  const outputPath = process.argv[3] || 'src/data/ateco-completo.js';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`File CSV non trovato: ${csvPath}`);
    process.exit(1);
  }
  
  console.log(`Avvio conversione da ${csvPath} a ${outputPath}`);
  convertCSVtoJS(csvPath, outputPath);
}

module.exports = {
  convertCSVtoJS,
  createChunks
};