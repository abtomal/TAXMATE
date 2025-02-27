import React, { useState, useEffect } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';
import ScadenzeFatture from './ScadenzeFatture';
import FattureMensili from './FattureMensili';
import ProiezioniContabilita from './ProiezioniContabilita';
import { AlertCircle, PieChart, Settings } from 'lucide-react';

const GestioneFatture = () => {
  const [formData, setFormData] = useState({
    fatturato: '',
    codiceAteco: '',
    coefficienteRedditività: 0,
    descrizione: '',
    dataEmissione: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    pagata: false,
  });

  const [fattureSalvate, setFattureSalvate] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredAteco, setFilteredAteco] = useState([]);
  const [mostraProiezioni, setMostraProiezioni] = useState(false);
  const [mostraImpostazioni, setMostraImpostazioni] = useState(true);
  
  // Per la ricerca ATECO nel modale impostazioni
  const [searchTermImpostazioni, setSearchTermImpostazioni] = useState('');
  const [isOpenImpostazioni, setIsOpenImpostazioni] = useState(false);
  const [filteredAtecoImpostazioni, setFilteredAtecoImpostazioni] = useState([]);
  
  // Dati utente separati dal form normale
  const [datiUtente, setDatiUtente] = useState({
    codiceAteco: '',
    coefficienteRedditività: 0,
    annoApertura: new Date().getFullYear() - 1, // Default anno precedente
    tipologiaInps: 'commerciante'
  });

  // Carica le fatture salvate al caricamento del componente
  useEffect(() => {
    const savedInvoices = localStorage.getItem('fatture');
    if (savedInvoices) {
      setFattureSalvate(JSON.parse(savedInvoices));
    }
    
    // Carica i dati dell'utente dal localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setDatiUtente(parsedData);
        
        // Precompila il form con il codice ATECO memorizzato
        if (parsedData.codiceAteco) {
          setFormData(prevFormData => ({
            ...prevFormData,
            codiceAteco: parsedData.codiceAteco,
            coefficienteRedditività: parsedData.coefficienteRedditività || 0
          }));
          setSearchTerm(parsedData.codiceAteco);
          setSearchTermImpostazioni(parsedData.codiceAteco);
        }
        
        // Se l'anno di apertura è già impostato, nascondi il modale
        if (parsedData.annoApertura && parsedData.annoApertura < new Date().getFullYear()) {
          setMostraImpostazioni(false);
        }
      } catch (e) {
        console.error("Errore nel parsing dei dati utente:", e);
      }
    }
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredAteco([]);
      return;
    }

    const searchTerms = term.toLowerCase().split(' ').filter(t => t.length > 0);
    
    const filtered = atecoData.filter(ateco => {
      const searchString = `${ateco.codice} ${ateco.descrizione} ${ateco.categoria}`.toLowerCase();
      return searchTerms.every(t => searchString.includes(t));
    }).sort((a, b) => {
      const aStartsWithCode = a.codice.toLowerCase().startsWith(term.toLowerCase());
      const bStartsWithCode = b.codice.toLowerCase().startsWith(term.toLowerCase());
      if (aStartsWithCode && !bStartsWithCode) return -1;
      if (!aStartsWithCode && bStartsWithCode) return 1;
      return 0;
    }).slice(0, 10);

    setFilteredAteco(filtered);
    setIsOpen(true);
  };

  const handleSearchImpostazioni = (term) => {
    setSearchTermImpostazioni(term);
    if (!term) {
      setFilteredAtecoImpostazioni([]);
      return;
    }

    const searchTerms = term.toLowerCase().split(' ').filter(t => t.length > 0);
    
    const filtered = atecoData.filter(ateco => {
      const searchString = `${ateco.codice} ${ateco.descrizione} ${ateco.categoria}`.toLowerCase();
      return searchTerms.every(t => searchString.includes(t));
    }).sort((a, b) => {
      const aStartsWithCode = a.codice.toLowerCase().startsWith(term.toLowerCase());
      const bStartsWithCode = b.codice.toLowerCase().startsWith(term.toLowerCase());
      if (aStartsWithCode && !bStartsWithCode) return -1;
      if (!aStartsWithCode && bStartsWithCode) return 1;
      return 0;
    }).slice(0, 10);

    setFilteredAtecoImpostazioni(filtered);
    setIsOpenImpostazioni(true);
  };

  const salvaFattura = (e) => {
    e.preventDefault();
    
    // Se non c'è un codice ATECO nel form ma c'è nei dati utente, usalo
    let nuovaFattura = { ...formData };
    if (!nuovaFattura.codiceAteco && datiUtente.codiceAteco) {
      nuovaFattura.codiceAteco = datiUtente.codiceAteco;
      nuovaFattura.coefficienteRedditività = datiUtente.coefficienteRedditività;
    }
    
    // Aggiungi l'ID e la data di registrazione
    nuovaFattura = {
      ...nuovaFattura,
      id: Date.now(),
      dataRegistrazione: new Date().toISOString()
    };

    const nuoveFatture = [...fattureSalvate, nuovaFattura];
    setFattureSalvate(nuoveFatture);
    localStorage.setItem('fatture', JSON.stringify(nuoveFatture));

    // Se c'è un codice ATECO nel form, aggiorna i dati utente
    if (formData.codiceAteco) {
      const nuoviDatiUtente = {
        ...datiUtente,
        codiceAteco: formData.codiceAteco,
        coefficienteRedditività: formData.coefficienteRedditività
      };
      setDatiUtente(nuoviDatiUtente);
      localStorage.setItem('userData', JSON.stringify(nuoviDatiUtente));
    }

    setFormData({
      fatturato: '',
      codiceAteco: formData.codiceAteco, // Mantiene il codice ATECO
      coefficienteRedditività: formData.coefficienteRedditività, // Mantiene il coefficiente
      descrizione: '',
      dataEmissione: new Date().toISOString().split('T')[0],
      dataScadenza: '',
      pagata: false
    });
  };

  const togglePagamento = (id) => {
    const nuoveFatture = fattureSalvate.map(fattura => 
      fattura.id === id 
        ? {...fattura, pagata: !fattura.pagata}
        : fattura
    );
    setFattureSalvate(nuoveFatture);
    localStorage.setItem('fatture', JSON.stringify(nuoveFatture));
  };

  const rimuoviFattura = (id) => {
    const nuoveFatture = fattureSalvate.filter(f => f.id !== id);
    setFattureSalvate(nuoveFatture);
    localStorage.setItem('fatture', JSON.stringify(nuoveFatture));
  };

  const salvaDatiUtente = (e) => {
    e.preventDefault();
    
    // Verifica e salva i dati utente
    const nuoviDatiUtente = {
      ...datiUtente,
      annoApertura: parseInt(datiUtente.annoApertura),
      codiceAteco: datiUtente.codiceAteco || formData.codiceAteco,
      coefficienteRedditività: datiUtente.coefficienteRedditività || formData.coefficienteRedditività
    };
    
    // Se c'è un codice ATECO, aggiorna anche il form principale
    if (nuoviDatiUtente.codiceAteco && !formData.codiceAteco) {
      setFormData(prevFormData => ({
        ...prevFormData,
        codiceAteco: nuoviDatiUtente.codiceAteco,
        coefficienteRedditività: nuoviDatiUtente.coefficienteRedditività
      }));
      setSearchTerm(nuoviDatiUtente.codiceAteco);
    }
    
    setDatiUtente(nuoviDatiUtente);
    localStorage.setItem('userData', JSON.stringify(nuoviDatiUtente));
    setMostraImpostazioni(false);
  };

  // Quando si seleziona un codice ATECO nel form principale
  const selezionaAteco = (ateco) => {
    // Aggiorna il form corrente
    setFormData({
      ...formData,
      codiceAteco: ateco.codice,
      coefficienteRedditività: ateco.coefficiente
    });
    
    // Aggiorna anche i dati utente
    const nuoviDatiUtente = {
      ...datiUtente,
      codiceAteco: ateco.codice,
      coefficienteRedditività: ateco.coefficiente,
      tipologiaInps: ateco.tipo || 'commerciante'
    };
    
    setDatiUtente(nuoviDatiUtente);
    localStorage.setItem('userData', JSON.stringify(nuoviDatiUtente));
    
    setSearchTerm(ateco.codice);
    setIsOpen(false);
  };

  // Quando si seleziona un codice ATECO nelle impostazioni
  const selezionaAtecoImpostazioni = (ateco) => {
    // Aggiorna i dati utente
    const nuoviDatiUtente = {
      ...datiUtente,
      codiceAteco: ateco.codice,
      coefficienteRedditività: ateco.coefficiente,
      tipologiaInps: ateco.tipo || 'commerciante'
    };
    
    setDatiUtente(nuoviDatiUtente);
    localStorage.setItem('userData', JSON.stringify(nuoviDatiUtente));
    
    // Aggiorna anche il form principale
    setFormData({
      ...formData,
      codiceAteco: ateco.codice,
      coefficienteRedditività: ateco.coefficiente
    });
    setSearchTerm(ateco.codice);
    
    setSearchTermImpostazioni(ateco.codice);
    setIsOpenImpostazioni(false);
  };

  const calcolaTotali = () => {
    const totali = {
      totale: 0,
      numeroFatture: fattureSalvate.length,
      daPagare: 0,
      pagate: 0
    };

    fattureSalvate.forEach(fattura => {
      const importo = parseFloat(fattura.fatturato);
      totali.totale += importo;
      if (fattura.pagata) {
        totali.pagate += importo;
      } else {
        totali.daPagare += importo;
      }
    });

    return totali;
  };

  const totali = calcolaTotali();

  // Ottieni il nome del codice ATECO
  const getAtecoName = (codice) => {
    const ateco = atecoData.find(a => a.codice === codice);
    return ateco ? `${ateco.codice} - ${ateco.descrizione}` : codice;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 m-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Fatture</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setMostraImpostazioni(true)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Settings className="w-5 h-5 mr-2" />
            Impostazioni
          </button>
          <button
            onClick={() => setMostraProiezioni(true)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <PieChart className="w-5 h-5 mr-2" />
            Proiezioni contabilità
          </button>
        </div>
      </div>

      {/* Mostra il codice ATECO corrente se esiste */}
      {datiUtente.codiceAteco && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Codice ATECO principale:</p>
          <p className="font-medium">{getAtecoName(datiUtente.codiceAteco)}</p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Coefficiente: {datiUtente.coefficienteRedditività}%</span> | 
            Tipologia: {datiUtente.tipologiaInps === 'artigiano' ? 'Artigiano' : 'Commerciante'}
          </p>
        </div>
      )}

      <ScadenzeFatture fatture={fattureSalvate} />

      <form onSubmit={salvaFattura} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Importo Fattura (€)
            </label>
            <input
              type="number"
              value={formData.fatturato}
              onChange={(e) => setFormData({...formData, fatturato: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data Emissione
            </label>
            <input
              type="date"
              value={formData.dataEmissione}
              onChange={(e) => setFormData({...formData, dataEmissione: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data Scadenza
            </label>
            <input
              type="date"
              value={formData.dataScadenza}
              onChange={(e) => setFormData({...formData, dataScadenza: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Codice ATECO
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Cerca per codice, descrizione o categoria..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500"
            />
            {formData.codiceAteco && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFormData({
                    ...formData,
                    codiceAteco: '',
                    coefficienteRedditività: 0
                  });
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {isOpen && searchTerm && filteredAteco.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
              {filteredAteco.map((ateco) => (
                <button
                  key={ateco.codice}
                  type="button"
                  onClick={() => selezionaAteco(ateco)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col border-b"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {ateco.codice}
                    </span>
                    <span className="text-sm text-blue-600">
                      {ateco.coefficiente}%
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {ateco.descrizione}
                  </span>
                  <span className="text-xs text-gray-500">
                    {ateco.categoria} - {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {isOpen && searchTerm && filteredAteco.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
              Nessun codice ATECO trovato
            </div>
          )}
          
          {!formData.codiceAteco && datiUtente.codiceAteco && (
            <p className="text-xs text-gray-500 mt-1">
              Verrà utilizzato il codice ATECO principale se non ne selezioni un altro.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descrizione
          </label>
          <textarea
            value={formData.descrizione}
            onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        </div>

        <button
          type="submit"
          disabled={(!formData.codiceAteco && !datiUtente.codiceAteco) || !formData.fatturato || !formData.dataScadenza}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Registra Fattura
        </button>
      </form>

      {fattureSalvate.length > 0 && (
        <div className="mt-8">
          <div className="bg-gray-50 p-4 rounded mb-4">
            <h3 className="text-lg font-semibold mb-2">Riepilogo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Numero Fatture</p>
                <p className="text-lg font-medium">{totali.numeroFatture}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale Fatturato</p>
                <p className="text-lg font-medium">€ {totali.totale.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Totale pagamenti in attesa</p>
                <p className="text-lg font-medium text-orange-600">
                  € {totali.daPagare.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pagamenti ricevuti</p>
                <p className="text-lg font-medium text-green-600">
                  € {totali.pagate.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Fatture Registrate</h3>
          <FattureMensili 
            fatture={fattureSalvate}
            onTogglePagamento={togglePagamento}
            onRimuoviFattura={rimuoviFattura}
          />
        </div>
      )}
      
      {/* Modale Impostazioni */}
      {mostraImpostazioni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Impostazioni Partita IVA</h2>
              {/* Rendi il pulsante di chiusura visibile solo se è già stato impostato un anno di apertura */}
              {datiUtente.annoApertura && datiUtente.annoApertura < new Date().getFullYear() && (
                <button
                  onClick={() => setMostraImpostazioni(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <form onSubmit={salvaDatiUtente} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Anno di apertura partita IVA
                </label>
                <input
                  type="number"
                  value={datiUtente.annoApertura}
                  onChange={(e) => setDatiUtente({...datiUtente, annoApertura: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Questo dato è necessario per calcolare correttamente gli acconti e le agevolazioni fiscali.
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Codice ATECO principale
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cerca per codice, descrizione o categoria..."
                    value={searchTermImpostazioni}
                    onChange={(e) => handleSearchImpostazioni(e.target.value)}
                    onFocus={() => setIsOpenImpostazioni(true)}
                    className="w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {datiUtente.codiceAteco && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTermImpostazioni('');
                        setDatiUtente({
                          ...datiUtente,
                          codiceAteco: '',
                          coefficienteRedditività: 0
                        });
                      }}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                {isOpenImpostazioni && searchTermImpostazioni && filteredAtecoImpostazioni.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
                    {filteredAtecoImpostazioni.map((ateco) => (
                      <button
                        key={ateco.codice}
                        type="button"
                        onClick={() => selezionaAtecoImpostazioni(ateco)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex flex-col border-b"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {ateco.codice}
                          </span>
                          <span className="text-sm text-blue-600">
                            {ateco.coefficiente}%
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {ateco.descrizione}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ateco.categoria} - {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {isOpenImpostazioni && searchTermImpostazioni && filteredAtecoImpostazioni.length === 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-gray-500">
                    Nessun codice ATECO trovato
                  </div>
                )}
              </div>

              {datiUtente.codiceAteco && (
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-600">Codice ATECO selezionato</p>
                  <p className="font-medium">{getAtecoName(datiUtente.codiceAteco)}</p>
                  <p className="text-sm text-gray-600 mt-1">Tipologia contribuente</p>
                  <p className="font-medium">{datiUtente.tipologiaInps === 'artigiano' ? 'Artigiano' : 'Commerciante'}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              >
                Salva impostazioni
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal Proiezioni Contabilità */}
      {mostraProiezioni && (
        <ProiezioniContabilita 
          fatture={fattureSalvate}
          codiceAteco={datiUtente.codiceAteco}
          coefficienteRedditività={datiUtente.coefficienteRedditività}
          annoApertura={datiUtente.annoApertura}
          tipologiaInps={datiUtente.tipologiaInps}
          onClose={() => setMostraProiezioni(false)}
        />
      )}
    </div>
  );
};

export default GestioneFatture;