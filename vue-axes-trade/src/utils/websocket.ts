import websocketConfig from '@/config/websocket';

/**
 * Gestionnaire WebSocket pour la partie admin
 */
export default class WebSocketManager {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private connectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];
  private closeHandlers: (() => void)[] = [];
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Établit une connexion WebSocket sécurisée
   */
  connect() {
    try {
      // Utiliser la configuration centralisée
      const wsUrl = websocketConfig.getWebSocketServerURL();
      
      console.log('Admin WebSocket connection URL:', wsUrl);
      
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Admin WebSocket connection established');
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler());
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.socket.onclose = () => {
        console.log('Admin WebSocket connection closed');
        this.closeHandlers.forEach(handler => handler());
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to establish Admin WebSocket connection:', error);
    }
  }

  /**
   * Envoie un message au serveur
   * @param data Données à envoyer
   */
  send(data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Tente de se reconnecter après une déconnexion
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect in ${this.reconnectAttempts * 1000}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, this.reconnectAttempts * 1000);
  }

  /**
   * Ajoute un gestionnaire de messages
   * @param handler Fonction de traitement des messages
   */
  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  /**
   * Ajoute un gestionnaire de connexion
   * @param handler Fonction appelée à la connexion
   */
  onConnect(handler: () => void) {
    this.connectionHandlers.push(handler);
  }

  /**
   * Ajoute un gestionnaire d'erreur
   * @param handler Fonction de traitement des erreurs
   */
  onError(handler: (error: Event) => void) {
    this.errorHandlers.push(handler);
  }

  /**
   * Ajoute un gestionnaire de fermeture
   * @param handler Fonction appelée à la fermeture
   */
  onClose(handler: () => void) {
    this.closeHandlers.push(handler);
  }

  /**
   * Ferme la connexion WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Vérifie si la connexion est active
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Instance singleton pour toute l'application
export const adminWebSocket = new WebSocketManager();