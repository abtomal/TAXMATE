const fs = require('fs');
const path = require('path');

const inputFileName = 'tabella_completa-ATECO-2007-aggiornamento-2022.csv';
const outputFileName = 'atecoData.js';

// Percorsi completi
const inputPath = path.join(__dirname, '..', '..', inputFileName); // Aggiusta il percorso in base alla posizione effettiva del CSV
const outputPath = path.join(__dirname, '..', 'data', outputFileName);

function convertCSVtoJS() {
  try {
    // Leggi il file CSV
    const csvData = fs.readFileSync(inputPath, 'utf8');
    
    // Dividi le righe
    const lines = csvData.split('\n');
    
    // Estrai le intestazioni (prima riga)
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Converti le righe rimanenti in oggetti
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Salta righe vuote
      
      const values = lines[i].split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] ? values[index].trim() : '';
      });
      
      data.push(entry);
    }
    
    // Crea il contenuto del file JS
    const jsContent = `// File generato automaticamente da convertCSVtoJS.cjs
// Dati dalla tabella ATECO 2007 (aggiornamento 2022)
export const atecoData = ${JSON.stringify(data, null, 2)};
`;
    
    // Assicurati che la directory di destinazione esista
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Scrivi il file JS
    fs.writeFileSync(outputPath, jsContent);
    
    console.log(`Conversione completata con successo! File generato: ${outputPath}`);
  } catch (error) {
    console.error('Errore durante la conversione:', error);
  }
}

convertCSVtoJS();