import React, { useState, useEffect } from 'react';
import { atecoData } from '../data/ateco-forfettario.js';
import ScadenzeFatture from './ScadenzeFatture';
import FattureMensili from './FattureMensili';
import ProiezioniContabilita from './ProiezioniContabilita';
import { AlertCircle, PieChart, Settings, PlusCircle, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [mostraFormNuovaFattura, setMostraFormNuovaFattura] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'
  
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
    
    // Nascondi il form dopo il salvataggio
    setMostraFormNuovaFattura(false);
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

  // Toggle l'ordine di visualizzazione
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Gestione Fatture</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMostraFormNuovaFattura(!mostraFormNuovaFattura)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {mostraFormNuovaFattura ? 'Nascondi form' : 'Nuova fattura'}
            </button>
            <button
              onClick={() => setMostraImpostazioni(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <Settings className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Impostazioni</span>
            </button>
            <button
              onClick={() => setMostraProiezioni(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <PieChart className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Proiezioni</span>
            </button>
          </div>
        </div>

        {/* Mostra il codice ATECO corrente se esiste */}
        {datiUtente.codiceAteco && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <p className="text-sm text-gray-600">Codice ATECO principale:</p>
                <p className="font-medium">{getAtecoName(datiUtente.codiceAteco)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  {datiUtente.coefficienteRedditività}%
                </span>
                <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                  {datiUtente.tipologiaInps === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                </span>
              </div>
            </div>
          </div>
        )}

        <ScadenzeFatture fatture={fattureSalvate} />

        {/* Form per nuova fattura (collassabile) */}
        <div className={`transition-all duration-300 overflow-hidden ${mostraFormNuovaFattura ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={salvaFattura} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-green-600" />
              Registra nuova fattura
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Importo Fattura (€)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                  <input
                    type="number"
                    value={formData.fatturato}
                    onChange={(e) => setFormData({...formData, fatturato: e.target.value})}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Data Emissione
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={formData.dataEmissione}
                    onChange={(e) => setFormData({...formData, dataEmissione: e.target.value})}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Data Scadenza
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={formData.dataScadenza}
                    onChange={(e) => setFormData({...formData, dataScadenza: e.target.value})}
                    className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Codice ATECO
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cerca per codice, descrizione o categoria..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  className="w-full p-2 pl-8 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {isOpen && searchTerm && filteredAteco.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  {filteredAteco.map((ateco) => (
                    <button
                      key={ateco.codice}
                      type="button"
                      onClick={() => selezionaAteco(ateco)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {ateco.codice}
                        </span>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {ateco.coefficiente}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 my-1 line-clamp-2">
                        {ateco.descrizione}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {ateco.categoria}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isOpen && searchTerm && filteredAteco.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
                  <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nessun codice ATECO trovato
                </div>
              )}
              
              {!formData.codiceAteco && datiUtente.codiceAteco && (
                <p className="text-xs text-gray-500 mt-1">
                  <svg className="w-4 h-4 inline-block mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verrà utilizzato il codice ATECO principale se non ne selezioni un altro.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Descrizione
              </label>
              <textarea
                value={formData.descrizione}
                onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                placeholder="Descrizione opzionale della fattura..."
              />
            </div>

            <button
              type="submit"
              disabled={(!formData.codiceAteco && !datiUtente.codiceAteco) || !formData.fatturato || !formData.dataScadenza}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registra Fattura
            </button>
          </form>
        </div>

        {fattureSalvate.length > 0 && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Riepilogo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600">Numero Fatture</p>
                  <p className="text-lg font-medium">{totali.numeroFatture}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-600">Totale Fatturato</p>
                  <p className="text-lg font-medium">€ {totali.totale.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
                  <p className="text-sm text-gray-600">In attesa di pagamento</p>
                  <p className="text-lg font-medium text-orange-600">
                    € {totali.daPagare.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
                  <p className="text-sm text-gray-600">Pagamenti ricevuti</p>
                  <p className="text-lg font-medium text-green-600">
                    € {totali.pagate.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Fatture Registrate</h3>
              <button
                onClick={toggleSortOrder}
                className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
              >
                {sortOrder === 'desc' ? (
                  <>
                    <ArrowDown className="w-4 h-4 mr-1" />
                    Più recenti
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Meno recenti
                  </>
                )}
              </button>
            </div>
            
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
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  Impostazioni Partita IVA
                </h2>
                {/* Rendi il pulsante di chiusura visibile solo se è già stato impostato un anno di apertura */}
                {datiUtente.annoApertura && datiUtente.annoApertura < new Date().getFullYear() && (
                  <button
                    onClick={() => setMostraImpostazioni(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <form onSubmit={salvaDatiUtente} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Anno di apertura partita IVA
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      value={datiUtente.annoApertura}
                      onChange={(e) => setDatiUtente({...datiUtente, annoApertura: e.target.value})}
                      className="w-full p-2 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1900"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Necessario per calcolare correttamente acconti e agevolazioni fiscali.
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Codice ATECO principale
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Cerca per codice, descrizione o categoria..."
                      value={searchTermImpostazioni}
                      onChange={(e) => handleSearchImpostazioni(e.target.value)}
                      onFocus={() => setIsOpenImpostazioni(true)}
                      className="w-full p-2 pl-8 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isOpenImpostazioni && searchTermImpostazioni && filteredAtecoImpostazioni.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                      {filteredAtecoImpostazioni.map((ateco) => (
                        <button
                          key={ateco.codice}
                          type="button"
                          onClick={() => selezionaAtecoImpostazioni(ateco)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {ateco.codice}
                            </span>
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {ateco.coefficiente}%
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 my-1 line-clamp-2">
                            {ateco.descrizione}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {ateco.categoria}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {ateco.tipo === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isOpenImpostazioni && searchTermImpostazioni && filteredAtecoImpostazioni.length === 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Nessun codice ATECO trovato
                    </div>
                  )}
                </div>

                {datiUtente.codiceAteco && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="text-sm text-gray-600">Codice ATECO selezionato</p>
                        <p className="font-medium">{getAtecoName(datiUtente.codiceAteco)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          {datiUtente.coefficienteRedditività}%
                        </span>
                        <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                          {datiUtente.tipologiaInps === 'artigiano' ? 'Artigiano' : 'Commerciante'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
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
    </div>
  );
};

export default GestioneFatture;