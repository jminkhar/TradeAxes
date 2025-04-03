import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Types for chat messages
type MessageSender = 'user' | 'admin';

interface ChatMessage {
  id: number;
  sessionId: string;
  sender: MessageSender;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Connect to WebSocket server on component mount
  useEffect(() => {
    // Generate a unique session ID if not present
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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
        
        // If the chat is not open and the message is from admin, increment unread count
        if (!isOpen && data.message.sender === 'admin') {
          setUnreadCount(prev => prev + 1);
          
          // Show a toast for new admin message
          toast({
            title: "Nouveau message",
            description: "Vous avez reçu un nouveau message d'Axes Trade",
            duration: 5000,
          });
        }
      } else if (data.type === 'session_messages') {
        setMessages(data.messages);
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
      
      setMessage("");
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
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {msg.sender === 'admin' && (
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
                                  : 'bg-muted'
                                }
                              `}
                            >
                              {msg.message}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(msg.timestamp)}
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