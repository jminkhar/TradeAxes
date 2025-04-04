import React, { useState, useEffect, useRef } from 'react';
import websocketManager from '@/lib/websocket';
import { v4 as uuidv4 } from 'uuid';

type MessageSender = 'user' | 'admin';

interface ChatMessage {
  id?: number;
  sessionId: string;
  sender: MessageSender;
  message: string;
  timestamp?: string;
  read?: boolean;
}

/**
 * Composant de chat en direct 
 * Permet aux utilisateurs d'interagir avec le service client
 */
const LiveChatComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser le chat
  useEffect(() => {
    // Récupérer ou générer un ID de session unique
    const storedSessionId = localStorage.getItem('chat_session_id');
    const newSessionId = storedSessionId || uuidv4();
    
    if (!storedSessionId) {
      localStorage.setItem('chat_session_id', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Configurer les gestionnaires d'événements WebSocket
    websocketManager.setHandlers({
      onMessage: handleWebSocketMessage,
      onOpen: () => {
        // Demander les messages précédents
        if (newSessionId) {
          websocketManager.send({
            type: 'get_session_messages',
            sessionId: newSessionId
          });
        }
      }
    });
    
    // Se connecter au WebSocket
    websocketManager.connect().catch(error => {
      console.error('Failed to connect to WebSocket:', error);
    });
    
    // Nettoyer la connexion WebSocket à la fermeture
    return () => {
      // Ne pas déconnecter le WebSocket ici pour permettre la réception des messages en arrière-plan
    };
  }, []);

  // Faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Marquer les messages comme lus lorsque le chat est ouvert
  useEffect(() => {
    if (isOpen && sessionId) {
      websocketManager.send({
        type: 'mark_read',
        sessionId
      });
    }
  }, [isOpen, sessionId]);

  // Gestionnaire de messages WebSocket
  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'chat_message') {
      setMessages(prevMessages => [...prevMessages, data.message]);
    } else if (data.type === 'session_messages') {
      setMessages(data.messages || []);
    } else if (data.type === 'unread_count') {
      setUnreadCount(data.count || 0);
    }
  };

  // Envoyer un message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !sessionId) return;
    
    const chatMessage: ChatMessage = {
      sessionId,
      sender: 'user',
      message: message.trim()
    };
    
    websocketManager.send({
      type: 'chat_message',
      payload: chatMessage
    });
    
    setMessage('');
  };

  // Faire défiler jusqu'au dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Formater la date du message
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton de chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>
      
      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border">
          {/* En-tête */}
          <div className="bg-blue-600 text-white p-3 font-bold">
            Chat en direct - Axes Trade
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                Commencez une conversation avec nous !
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`mb-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    } text-gray-500`}
                  >
                    {msg.timestamp ? formatDate(msg.timestamp) : 'Envoi en cours...'}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Formulaire d'envoi */}
          <form onSubmit={sendMessage} className="border-t p-2 flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 border rounded-l p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r"
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

export default LiveChatComponent;