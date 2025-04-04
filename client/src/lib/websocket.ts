/**
 * Module de gestion des connexions WebSocket
 * Permet d'établir et gérer de manière robuste la connexion au serveur WebSocket
 */

type MessageHandler = (data: any) => void;

interface WebSocketHandlers {
  onMessage?: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private handlers: WebSocketHandlers = {};
  private isConnecting = false;

  /**
   * Initialise le gestionnaire WebSocket
   * @param path Chemin du endpoint WebSocket (par défaut '/ws')
   */
  constructor(path: string = '/ws') {
    // Déterminer l'URL du WebSocket en fonction de l'environnement
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}${path}`;
    console.log(`WebSocket URL initialized: ${this.url}`);;
  }

  /**
   * Établit la connexion au serveur WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }
      
      this.isConnecting = true;
      
      try {
        console.log(`Establishing WebSocket connection to ${this.url}`);
        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          if (this.handlers.onOpen) {
            this.handlers.onOpen();
          }
          
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          if (this.handlers.onMessage) {
            try {
              const data = JSON.parse(event.data);
              this.handlers.onMessage(data);
            } catch (e) {
              console.error('Error parsing WebSocket message:', e);
            }
          }
        };
        
        this.socket.onclose = () => {
          console.log('WebSocket connection closed');
          this.isConnecting = false;
          
          if (this.handlers.onClose) {
            this.handlers.onClose();
          }
          
          this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          if (this.handlers.onError) {
            this.handlers.onError(error);
          }
          
          reject(error);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.isConnecting = false;
        reject(error);
        
        // Tenter de se reconnecter en cas d'erreur
        this.attemptReconnect();
      }
    });
  }

  /**
   * Tente de se reconnecter au serveur WebSocket
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached');
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // La gestion des erreurs est déjà faite dans connect()
      });
    }, delay);
  }

  /**
   * Envoie un message au serveur WebSocket
   * @param data Données à envoyer (sera converti en JSON)
   */
  send(data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    } catch (e) {
      console.error('Error sending WebSocket message:', e);
      return false;
    }
  }

  /**
   * Définit les gestionnaires d'événements WebSocket
   * @param handlers Object contenant les gestionnaires d'événements
   */
  setHandlers(handlers: WebSocketHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Ferme la connexion WebSocket
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Vérifie si la connexion WebSocket est active
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Exporter une instance singleton pour l'utiliser dans toute l'application
export const websocketManager = new WebSocketManager();
export default websocketManager;