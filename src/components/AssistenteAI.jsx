import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const AssistenteAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente virtuale per questioni fiscali relative al regime forfettario. Come posso aiutarti oggi?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(true);
  const messagesEndRef = useRef(null);
  
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
          content: "Sei un assistente commercialista che opera in un'azienda che si chiama Taxmate, specializzato nell'anagrafica e la contabilità per la partita iva a regime forfettario italiano. Fornisci informazioni precise e aggiornate sulla normativa fiscale del regime forfettario, ma specifica sempre che sono consigli generali e che l'utente dovrebbe consultare un professionista per casi specifici."
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
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-24 h-16 rounded-full shadow-lg transition-colors duration-300 ${
          isOpen ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${!apiKeyValid ? 'opacity-50' : ''}`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-sm font-semibold">Assistente AI</span>
        )}
      </button>

      {/* Finestra di chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-3 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <h2 className="font-semibold">Assistente AI</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-3 bg-gray-50">
            {!apiKeyValid && (
              <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
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
                  className={`inline-block p-2 rounded-lg max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center py-2">
                <div className="inline-block p-2 bg-gray-200 rounded-lg text-sm">
                  L'assistente sta scrivendo...
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
              className="flex-grow p-2 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading || !apiKeyValid}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading || !input.trim() || !apiKeyValid}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AssistenteAI;