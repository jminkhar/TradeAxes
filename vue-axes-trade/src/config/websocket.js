/**
 * Configuration pour les connexions WebSocket
 */

// URL du serveur WebSocket - définir l'URL de manière fiable
const getWebSocketServerURL = () => {
  // Utiliser l'URL de l'API backend
  return 'wss://82654774-9bc5-43da-99f9-b50085727d1b-00-3pckgj7jvmyio.kirk.replit.dev/ws';
};

export default {
  getWebSocketServerURL
};