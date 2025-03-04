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
  const inputRef = useRef(null);
  
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

  // Focus sull'input quando la chat si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Adatta l'altezza della chat in base all'altezza della viewport
  useEffect(() => {
    const adjustChatHeight = () => {
      if (chatContainerRef.current) {
        const viewportHeight = window.innerHeight;
        const buttonHeight = 64; // 16 (h-16) + 16 (bottom-4) + 32 (margin)
        const maxChatHeight = viewportHeight * 0.7; // Max 70% della viewport
        
        const chatContainer = chatContainerRef.current.querySelector('.chat-messages-container');
        if (chatContainer) {
          const headerHeight = 48; // Approssimazione dell'header
          const formHeight = 64; // Approssimazione del form
          const availableHeight = maxChatHeight - headerHeight - formHeight;
          
          chatContainer.style.maxHeight = `${availableHeight}px`;
          chatContainer.style.height = `${Math.min(availableHeight, 320)}px`; // Default 320px, ma non più grande di availableHeight
        }
      }
    };

    if (isOpen) {
      adjustChatHeight();
      window.addEventListener('resize', adjustChatHeight);
    }

    return () => {
      window.removeEventListener('resize', adjustChatHeight);
    };
  }, [isOpen]);

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
        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 text-white scale-110' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
        } ${!apiKeyValid ? 'opacity-50' : ''}`}
        aria-label="Assistente AI"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Finestra di chat con animazione */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="fixed bottom-20 left-4 right-4 sm:absolute sm:left-auto sm:right-0 sm:bottom-16 sm:w-96 w-auto mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            animation: 'slide-up 0.3s ease-out',
            maxWidth: 'calc(100vw - 2rem)'
          }}
        >
          <div className="p-2 sm:p-3 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h2 className="font-semibold text-sm sm:text-base">Assistente AI</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="chat-messages-container overflow-y-auto p-2 sm:p-3 bg-gray-50">
            {!apiKeyValid && (
              <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-xs sm:text-sm">
                <p className="font-semibold">⚠️ Configurazione API incompleta</p>
                <p>L'assistente AI non può funzionare correttamente con le attuali impostazioni API. Controlla la tua chiave API OpenAI.</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-2 sm:mb-3 ${msg.role === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block p-2 sm:p-3 rounded-lg max-w-[90%] text-xs sm:text-sm ${
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
                <div className="inline-block p-2 bg-gray-200 rounded-lg text-xs sm:text-sm flex items-center space-x-2">
                  <div className="dot-pulse"></div>
                  <span>L'assistente sta scrivendo...</span>
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="text-center py-2">
                <div className="inline-block p-2 bg-red-100 text-red-800 rounded-lg text-xs sm:text-sm">
                  {errorMessage}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-gray-200 flex">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKeyValid ? "Chiedi qualcosa..." : "Assistente non disponibile"}
              className="flex-grow p-2 text-xs sm:text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !apiKeyValid}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              disabled={isLoading || !input.trim() || !apiKeyValid}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background-color: #606060;
          color: #606060;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0.25s;
        }
        
        @media (min-width: 640px) {
          .dot-pulse {
            width: 10px;
            height: 10px;
            border-radius: 5px;
          }
        }
        
        .dot-pulse::before,
        .dot-pulse::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background-color: #606060;
          color: #606060;
        }
        
        @media (min-width: 640px) {
          .dot-pulse::before,
          .dot-pulse::after {
            width: 10px;
            height: 10px;
            border-radius: 5px;
          }
        }
        
        .dot-pulse::before {
          left: -12px;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0s;
        }
        
        .dot-pulse::after {
          left: 12px;
          animation: dot-pulse 1.5s infinite linear;
          animation-delay: 0.5s;
        }
        
        @media (min-width: 640px) {
          .dot-pulse::before {
            left: -15px;
          }
          
          .dot-pulse::after {
            left: 15px;
          }
        }
        
        @keyframes dot-pulse {
          0% { transform: scale(0.2); opacity: 0.8; }
          20% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.2); opacity: 0.8; }
        }
        
        /* Nasconde la scrollbar ma mantiene la funzionalità */
        .chat-messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .chat-messages-container::-webkit-scrollbar {
          width: 4px;
        }
        
        .chat-messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default AssistenteAI;