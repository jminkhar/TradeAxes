import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Types for chat messages
type MessageSender = 'user' | 'admin' | 'bot';

interface ChatMessage {
  id: number;
  sessionId: string;
  sender: MessageSender;
  message: string;
  timestamp: string;
  read: boolean;
}

// Étapes du chatbot
type ChatbotStep = 
  | 'welcome'
  | 'name'
  | 'company'
  | 'service'
  | 'phone'
  | 'confirmation'
  | 'livechat_request'
  | 'livechat_waiting'
  | 'completed';

// Information client collectée
interface CustomerInfo {
  name: string;
  company: string;
  service: string;
  phone: string;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [chatbotActive, setChatbotActive] = useState(true);
  const [currentStep, setCurrentStep] = useState<ChatbotStep>('welcome');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    company: '',
    service: '',
    phone: ''
  });
  const [waitingForLiveAgent, setWaitingForLiveAgent] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Connect to WebSocket server on component mount
  useEffect(() => {
    // Generate a unique session ID if not present
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chat_session_id', newSessionId);
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Request messages for this session
      if (sessionId) {
        socket.send(JSON.stringify({
          type: 'get_session_messages',
          sessionId
        }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.message]);
        
        // Si le message vient de l'admin, désactiver le chatbot
        if (data.message.sender === 'admin') {
          setChatbotActive(false);
          
          // Si en attente d'un agent, passer à la conversation en direct
          if (waitingForLiveAgent) {
            setWaitingForLiveAgent(false);
          }
          
          // If the chat is not open and the message is from admin, increment unread count
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
            
            // Show a toast for new admin message
            toast({
              title: "Nouveau message",
              description: "Vous avez reçu un nouveau message d'Axes Trade",
              duration: 5000,
            });
          }
        }
      } else if (data.type === 'session_messages') {
        setMessages(data.messages);
        
        // Vérifier si le chatbot doit être activé pour cette session
        const hasAdminMessages = data.messages.some((msg: ChatMessage) => msg.sender === 'admin');
        setChatbotActive(!hasAdminMessages);
        
        // Déterminer l'étape actuelle du chatbot si nécessaire
        if (!hasAdminMessages) {
          determineCurrentStep(data.messages);
        }
      } else if (data.type === 'unread_count') {
        setUnreadCount(data.count);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite avec la connexion au chat en direct. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
      setConnected(false);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    // Clean up on unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [sessionId, toast]);
  
  // Déterminer l'étape actuelle du chatbot en fonction des messages existants
  const determineCurrentStep = (chatMessages: ChatMessage[]) => {
    const userMessages = chatMessages.filter(msg => msg.sender === 'user');
    const botMessages = chatMessages.filter(msg => msg.sender === 'bot' || msg.sender === 'admin');
    
    // Si aucun message, commencer par l'accueil
    if (botMessages.length === 0) {
      // Envoyer le message d'accueil après un court délai
      setTimeout(() => sendBotMessage(getChatbotMessage('welcome')), 500);
      return;
    }
    
    // Récupérer les informations client des messages précédents
    const info = { ...customerInfo };
    let currentState: ChatbotStep = 'welcome';
    
    // Parcourir les échanges de messages pour reconstituer l'état du chat
    if (botMessages.some(msg => msg.message.includes("Quel est votre nom"))) {
      currentState = 'name';
      if (userMessages.length >= 1) {
        info.name = userMessages[0].message;
        currentState = 'company';
      }
    }
    
    if (botMessages.some(msg => msg.message.includes("de quelle entreprise"))) {
      currentState = 'company';
      if (userMessages.length >= 2) {
        info.company = userMessages[1].message;
        currentState = 'service';
      }
    }
    
    if (botMessages.some(msg => msg.message.includes("quel type de service"))) {
      currentState = 'service';
      if (userMessages.length >= 3) {
        info.service = userMessages[2].message;
        currentState = 'phone';
      }
    }
    
    if (botMessages.some(msg => msg.message.includes("numéro de téléphone"))) {
      currentState = 'phone';
      if (userMessages.length >= 4) {
        info.phone = userMessages[3].message;
        currentState = 'confirmation';
      }
    }
    
    if (botMessages.some(msg => msg.message.includes("vous contacter rapidement"))) {
      currentState = 'confirmation';
    }
    
    if (botMessages.some(msg => msg.message.includes("préférez-vous parler"))) {
      currentState = 'livechat_request';
    }
    
    if (botMessages.some(msg => msg.message.includes("recherche un conseiller"))) {
      currentState = 'livechat_waiting';
      setWaitingForLiveAgent(true);
    }
    
    if (botMessages.some(msg => msg.message.includes("Merci pour votre"))) {
      currentState = 'completed';
    }
    
    setCurrentStep(currentState);
    setCustomerInfo(info);
  };

  // Envoyer un message du chatbot
  const sendBotMessage = (messageText: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    try {
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: {
          sessionId,
          sender: 'bot',
          message: messageText,
          read: true
        }
      }));
    } catch (error) {
      console.error('Error sending bot message:', error);
    }
  };

  // Obtenir le message du chatbot en fonction de l'étape
  const getChatbotMessage = (step: ChatbotStep): string => {
    switch (step) {
      case 'welcome':
        return "Bonjour et bienvenue chez Axes Trade ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?";
      case 'name':
        return "Pour mieux vous assister, j'aurais besoin de quelques informations. Quel est votre nom ?";
      case 'company':
        return `Merci ${customerInfo.name}. Et de quelle entreprise faites-vous partie ?`;
      case 'service':
        return "Super ! Maintenant, pouvez-vous me dire quel type de service ou produit vous intéresse ? (Imprimantes, consommables, maintenance, etc.)";
      case 'phone':
        return "Excellent ! Afin qu'un de nos conseillers puisse vous recontacter, pourriez-vous me laisser votre numéro de téléphone ?";
      case 'confirmation':
        return `Merci pour ces informations ${customerInfo.name}. Un conseiller d'Axes Trade vous contactera très rapidement au ${customerInfo.phone} concernant votre demande sur ${customerInfo.service}. Préférez-vous parler immédiatement avec un conseiller en ligne ?`;
      case 'livechat_request':
        return "Souhaitez-vous être mis en relation avec un conseiller maintenant ? (Oui/Non)";
      case 'livechat_waiting':
        return "Je recherche un conseiller disponible pour vous. Veuillez patienter quelques instants...";
      case 'completed':
        return `Merci pour votre demande ${customerInfo.name}. Notre équipe vous contactera dans les plus brefs délais. Bonne journée !`;
      default:
        return "Comment puis-je vous aider ?";
    }
  };

  // Progresser dans les étapes du chatbot
  const processUserResponse = (userMessage: string) => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('name');
        setTimeout(() => sendBotMessage(getChatbotMessage('name')), 1000);
        break;
      case 'name':
        setCustomerInfo({ ...customerInfo, name: userMessage });
        setCurrentStep('company');
        setTimeout(() => sendBotMessage(getChatbotMessage('company')), 1000);
        break;
      case 'company':
        setCustomerInfo({ ...customerInfo, company: userMessage });
        setCurrentStep('service');
        setTimeout(() => sendBotMessage(getChatbotMessage('service')), 1000);
        break;
      case 'service':
        setCustomerInfo({ ...customerInfo, service: userMessage });
        setCurrentStep('phone');
        setTimeout(() => sendBotMessage(getChatbotMessage('phone')), 1000);
        break;
      case 'phone':
        setCustomerInfo({ ...customerInfo, phone: userMessage });
        setCurrentStep('confirmation');
        setTimeout(() => sendBotMessage(getChatbotMessage('confirmation')), 1000);
        break;
      case 'confirmation':
      case 'livechat_request':
        // Si l'utilisateur veut parler à un conseiller
        if (userMessage.toLowerCase().includes('oui') || userMessage.toLowerCase() === 'o') {
          setCurrentStep('livechat_waiting');
          setWaitingForLiveAgent(true);
          setTimeout(() => sendBotMessage(getChatbotMessage('livechat_waiting')), 1000);
          
          // Envoyer une notification aux administrateurs (sera géré côté serveur)
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'live_chat_request',
              payload: {
                sessionId,
                customerInfo
              }
            }));
          }
        } else {
          // L'utilisateur ne souhaite pas de chat en direct
          setCurrentStep('completed');
          setTimeout(() => sendBotMessage(getChatbotMessage('completed')), 1000);
        }
        break;
      default:
        break;
    }
  };
  
  // Scroll to bottom of messages when new message arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && socketRef.current && socketRef.current.readyState === WebSocket.OPEN && unreadCount > 0) {
      socketRef.current.send(JSON.stringify({
        type: 'mark_read',
        sessionId
      }));
      setUnreadCount(0);
    }
  }, [isOpen, unreadCount, sessionId]);

  // Envoyer le message d'ouverture du chatbot quand le chat est ouvert pour la première fois
  useEffect(() => {
    if (isOpen && chatbotActive && messages.length === 0 && connected) {
      setTimeout(() => {
        sendBotMessage(getChatbotMessage('welcome'));
      }, 500);
    }
  }, [isOpen, chatbotActive, messages.length, connected]);

  const handleSendMessage = () => {
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    try {
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: {
          sessionId,
          sender: 'user',
          message: message.trim(),
          read: false
        }
      }));
      
      const userMessage = message.trim();
      setMessage("");
      
      // Si le chatbot est actif, traiter la réponse de l'utilisateur
      if (chatbotActive && !waitingForLiveAgent) {
        setTimeout(() => {
          processUserResponse(userMessage);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Votre message n'a pas pu être envoyé. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat bubble button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <FontAwesomeIcon icon={faCommentDots} className="text-xl" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 shadow-lg">
          <Card className="border-2">
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">Chat Axes Trade</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)} 
                  className="text-primary-foreground h-8 w-8"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea 
                ref={scrollAreaRef as any}
                className="h-80 px-4 pt-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                    <FontAwesomeIcon icon={faCommentDots} className="text-3xl mb-2" />
                    <p>Démarrez une conversation avec nous !</p>
                    <p className="text-sm">Notre équipe sera ravie de vous aider.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-4">
                    {messages.map((msg, index) => (
                      <div 
                        key={msg.id || `msg-${index}`}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {(msg.sender === 'admin' || msg.sender === 'bot') && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/logo.png" alt="Axes Trade" />
                              <AvatarFallback>AT</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div>
                            <div 
                              className={`
                                p-3 rounded-lg 
                                ${msg.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : msg.sender === 'bot'
                                    ? 'bg-muted'
                                    : 'bg-blue-100 dark:bg-blue-900'
                                }
                              `}
                            >
                              {msg.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(msg.timestamp || new Date().toISOString())}
                              {msg.sender === 'admin' && <span className="ml-1 font-medium">• Conseiller</span>}
                              {msg.sender === 'bot' && <span className="ml-1">• Assistant</span>}
                            </div>
                          </div>
                          
                          {msg.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>You</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {waitingForLiveAgent && (
                      <div className="flex justify-center my-2">
                        <div className="bg-muted rounded-lg p-2 text-sm text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-100"></div>
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-200"></div>
                          </div>
                          <p className="text-xs mt-1">En attente d'un conseiller...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="border-t p-3">
              <form 
                className="flex w-full gap-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                  disabled={!connected}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!message.trim() || !connected}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}