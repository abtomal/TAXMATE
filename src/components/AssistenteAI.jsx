// src/components/AssistenteAI.jsx
import React, { useState, useRef, useEffect } from 'react';

const AssistenteAI = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ciao! Sono il tuo assistente virtuale per questioni fiscali relative al regime forfettario. Come posso aiutarti oggi?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // user message
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [
        { 
          role: "system", 
          content: "Sei un assistente commercialista specializzato nella partita iva a regime forfettario italiano. Fornisci informazioni precise e aggiornate sulla normativa fiscale, ma specifica sempre che sono consigli generali e che l'utente dovrebbe consultare un professionista per casi specifici."
        },
        ...messages,
        userMessage
      ];
      
      // API OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: assistantResponse }
      ]);
    } catch (error) {
      console.error('Errore nella comunicazione con l\'API:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          role: 'assistant', 
          content: "Errore di comunicazione con OpenAI. Riprova più tardi o consulta un commercialista per assistenza." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Pulsante per aprire/chiudere la chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-24 h-16 rounded-full shadow-lg transition-colors duration-300 ${
          isOpen ? 'bg-red-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-800'
        }`}
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
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chiedi qualcosa..."
              className="flex-grow p-2 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading || !input.trim()}
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