import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const AssistenteAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ciao! Sono l\'assistente AI di Taxmate. Come posso aiutarti?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Inizializzazione del client OpenAI
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  
  // Verifica che la chiave API sia presente
  useEffect(() => {
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyValid(false);
      setErrorMessage('Chiave API mancante. Controlla la configurazione del file .env');
    }
  }, [apiKey]);

  const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  }) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chiude l'assistente quando si clicca al di fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        // Controlla se il clic è sul pulsante dell'assistente (che ha già il suo gestore)
        const assistantButton = document.getElementById('assistant-toggle-button');
        if (assistantButton && !assistantButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Verifica se la chiave API è valida
    if (!apiKeyValid || !openai) {
      setErrorMessage('Impossibile utilizzare l\'assistente: Chiave API OpenAI non configurata o non valida.');
      return;
    }

    // Aggiunta del messaggio dell'utente
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Qui prepariamo tutti i messaggi per la chiamata API
      const allMessages = [
        { 
          role: "system", 
          content: "Sei un assistente commercialista che opera in un'azienda che si chiama Taxmate, specializzato nell'anagrafica e la contabilità per la partita iva a regime forfettario italiano. Fornisci informazioni precise e aggiornate sulla normativa fiscale del regime forfettario, fai più domande possibili al cliente in modo da capire chiaramente la sua domanda per dargli una risposta precisa e veritiera ma specifica sempre che sono consigli generali e che l'utente dovrebbe consultare un professionista per casi specifici."
        },
        ...messages.filter(msg => msg.role !== 'system'),
        userMessage
      ];

      // Chiamata all'API OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 500
      });
      
      // Estrazione della risposta dell'assistente
      const assistantResponse = response.choices[0].message.content;
      
      // Aggiunta della risposta ai messaggi
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: assistantResponse }
      ]);
    } catch (error) {
      console.error('Errore completo:', error);
      
      let errorDetails = 'Errore sconosciuto';
      
      if (error.response) {
        const statusCode = error.response.status;
        
        if (statusCode === 429) {
          errorDetails = 'Limite di utilizzo raggiunto. È necessario aggiornare il piano OpenAI o attendere il reset del limite.';
          setApiKeyValid(false);
        } else if (statusCode === 401) {
          errorDetails = 'Chiave API non valida o scaduta. Controlla le impostazioni del tuo account OpenAI.';
          setApiKeyValid(false);
        } else {
          errorDetails = `Errore API: ${statusCode}`;
        }
      } else if (error.message) {
        errorDetails = `Errore di comunicazione: ${error.message}`;
      }

      setErrorMessage(errorDetails);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Mi dispiace, non posso rispondere in questo momento: ${errorDetails}. Per assistenza immediata, ti consiglio di consultare un commercialista.` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Pulsante per aprire/chiudere la chat */}
      <button
        id="assistant-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 text-white scale-110' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
        } ${!apiKeyValid ? 'opacity-50' : ''}`}
        aria-label="Assistente AI"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Finestra di chat con animazione */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="absolute bottom-20 right-0 w-full sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-[calc(100vw-2rem)]"
          style={{
            animation: 'slide-up 0.3s ease-out'
          }}
        >
          <div className="p-3 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h2 className="font-semibold">Assistente AI</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-[60vh] sm:h-80 overflow-y-auto p-3 bg-gray-50">
            {!apiKeyValid && (
              <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
                <p className="font-semibold">⚠️ Configurazione API incompleta</p>
                <p className="text-sm">L'assistente AI non può funzionare correttamente con le attuali impostazioni API. Controlla la tua chiave API OpenAI.</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 ${msg.role === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center py-2">
                <div className="inline-block p-2 bg-gray-200 rounded-lg text-sm flex items-center space-x-2">
                  <div className="dot-pulse"></div>
                  <span>L'assistente sta scrivendo...</span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="text-center py-2">
                <div className="inline-block p-2 bg-red-100 text-red-800 rounded-lg text-sm">
                  {errorMessage}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKeyValid ? "Chiedi qualcosa..." : "Assistente non disponibile"}
              className="flex-grow p-2 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !apiKeyValid}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              disabled={isLoading || !input.trim() || !apiKeyValid}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Stili CSS aggiuntivi */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .dot-pulse {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #606060;
          color: #606060;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0.25s;
        }
        
        .dot-pulse::before,
        .dot-pulse::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #606060;
          color: #606060;
        }
        
        .dot-pulse::before {
          left: -15px;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0s;
        }
        
        .dot-pulse::after {
          left: 15px;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0.5s;
        }
        
        @keyframes dot-pulse {
          0% { transform: scale(0.2); opacity: 0.8; }
          20% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default AssistenteAI;