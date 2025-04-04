import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BadgeCustom } from "@/components/ui/badge-custom";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faTimes, 
  faCheck, 
  faEye, 
  faArrowLeft,
  faComment,
  faCommentDots,
  faPaperPlane,
  faPhone,
  faUser,
  faBuilding,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

// Types
interface ContactMessage {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  price: string | null;
  categories: string[];
  badge: {
    text: string;
    color: string;
  } | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageView {
  id: number;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
  countryCode: string | null;
  timestamp: string;
}

interface ChatMessage {
  id: number;
  sessionId: string;
  sender: 'user' | 'admin' | 'bot';
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatSession {
  sessionId: string;
  customerInfo: {
    name: string;
    company: string;
    service: string;
    phone: string;
  };
  lastActivity: string;
  unreadCount: number;
  messages: ChatMessage[];
}

// Form types for add/edit operations
interface BlogPostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  tags: string;
  isPublished: boolean;
  publishedAt: string;
}

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  price: string;
  categories: string;
  badgeText: string;
  badgeColor: string;
  featured: boolean;
}

// Helper functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState("messages");
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'chat'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedChatSession, setSelectedChatSession] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [adminChatMessage, setAdminChatMessage] = useState('');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Effet pour se connecter au WebSocket et gérer les messages de chat
  useEffect(() => {
    if (activeTab !== 'chat') return;
    
    // Établir la connexion WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    setWsConnection(socket);
    
    socket.onopen = () => {
      setWsConnected(true);
      console.log('Admin WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        // Ajouter le message à la session correspondante
        setChatSessions(prev => {
          const sessionIndex = prev.findIndex(s => s.sessionId === data.message.sessionId);
          
          if (sessionIndex >= 0) {
            // Mise à jour d'une session existante
            const updatedSessions = [...prev];
            const session = {...updatedSessions[sessionIndex]};
            
            // Ajouter le message
            session.messages = [...session.messages, data.message];
            session.lastActivity = data.message.timestamp;
            
            // Mettre à jour le compteur de messages non lus si ce n'est pas la session actuellement sélectionnée
            if (selectedChatSession !== data.message.sessionId && data.message.sender === 'user') {
              session.unreadCount = (session.unreadCount || 0) + 1;
            }
            
            updatedSessions[sessionIndex] = session;
            return updatedSessions;
          } else if (data.message.sender === 'user') {
            // Nouvelle session
            return [...prev, {
              sessionId: data.message.sessionId,
              customerInfo: {
                name: 'Client',
                company: '',
                service: '',
                phone: ''
              },
              lastActivity: data.message.timestamp,
              unreadCount: 1,
              messages: [data.message]
            }];
          }
          
          return prev;
        });
        
        // Si ce n'est pas la session actuellement sélectionnée et que c'est un message utilisateur, afficher une notification
        if (selectedChatSession !== data.message.sessionId && data.message.sender === 'user') {
          toast({
            title: "Nouveau message",
            description: "Un client a envoyé un nouveau message",
            duration: 5000,
          });
        }
      } else if (data.type === 'session_messages') {
        // Si on reçoit des messages de session, les ajouter à la session correspondante
        const sessionId = data.messages[0]?.sessionId;
        if (sessionId && data.messages.length) {
          setChatSessions(prev => {
            const sessionIndex = prev.findIndex(s => s.sessionId === sessionId);
            
            if (sessionIndex >= 0) {
              // Mise à jour d'une session existante
              const updatedSessions = [...prev];
              const session = {...updatedSessions[sessionIndex]};
              
              // Remplacer les messages
              session.messages = data.messages;
              
              // Trouver la dernière activité
              const lastMessage = data.messages[data.messages.length - 1];
              if (lastMessage) {
                session.lastActivity = lastMessage.timestamp;
              }
              
              updatedSessions[sessionIndex] = session;
              return updatedSessions;
            }
            
            return prev;
          });
        }
      } else if (data.type === 'admin_notification') {
        if (data.notification.type === 'live_chat_request') {
          // Un client demande un chat en direct
          toast({
            title: "Demande de chat en direct",
            description: data.notification.message,
            duration: 10000,
          });
          
          // Ajouter ou mettre à jour la session
          setChatSessions(prev => {
            const sessionIndex = prev.findIndex(s => s.sessionId === data.notification.sessionId);
            
            if (sessionIndex >= 0) {
              // Mise à jour d'une session existante
              const updatedSessions = [...prev];
              const session = {...updatedSessions[sessionIndex]};
              
              // Mettre à jour les infos client
              session.customerInfo = data.notification.customerInfo;
              session.lastActivity = data.notification.timestamp;
              session.unreadCount = (session.unreadCount || 0) + 1;
              
              updatedSessions[sessionIndex] = session;
              return updatedSessions;
            } else {
              // Nouvelle session
              return [...prev, {
                sessionId: data.notification.sessionId,
                customerInfo: data.notification.customerInfo,
                lastActivity: data.notification.timestamp,
                unreadCount: 1,
                messages: []
              }];
            }
          });
        }
      }
    };
    
    socket.onerror = (error) => {
      console.error('Admin WebSocket error:', error);
      setWsConnected(false);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite avec la connexion au chat en direct. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    };
    
    socket.onclose = () => {
      console.log('Admin WebSocket connection closed');
      setWsConnected(false);
    };
    
    // Nettoyage à la désinscription
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [activeTab, selectedChatSession, toast]);
  
  // Gérer l'envoi de message par l'admin
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminChatMessage.trim() || !wsConnection || wsConnection.readyState !== WebSocket.OPEN || !selectedChatSession) {
      return;
    }
    
    try {
      wsConnection.send(JSON.stringify({
        type: 'chat_message',
        payload: {
          sessionId: selectedChatSession,
          sender: 'admin',
          message: adminChatMessage.trim(),
          read: true
        }
      }));
      
      setAdminChatMessage("");
    } catch (error) {
      console.error('Error sending admin message:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Votre message n'a pas pu être envoyé. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Sélectionner une session de chat
  const handleSelectChatSession = (sessionId: string) => {
    setSelectedChatSession(sessionId);
    
    // Marquer les messages comme lus
    setChatSessions(prev => {
      return prev.map(session => {
        if (session.sessionId === sessionId) {
          return { ...session, unreadCount: 0 };
        }
        return session;
      });
    });
    
    // Informer le serveur que les messages ont été lus
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'mark_read',
        sessionId
      }));
    }
    
    setMode('chat');
  };
  
  // Blog post form state
  const [blogForm, setBlogForm] = useState<BlogPostForm>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    author: '',
    category: '',
    tags: '',
    isPublished: false,
    publishedAt: '',
  });
  
  // Product form state
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    image: '',
    price: '',
    categories: '',
    badgeText: '',
    badgeColor: '',
    featured: false
  });

  // Fetch data queries
  const { 
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError
  } = useQuery({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const response = await fetch('/api/contact');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.data as ContactMessage[];
    },
    enabled: activeTab === 'messages'
  });
  
  const { 
    data: blogPosts,
    isLoading: isLoadingBlogPosts,
    error: blogPostsError
  } = useQuery({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      const data = await response.json();
      return data.data as BlogPost[];
    },
    enabled: activeTab === 'blog'
  });
  
  const { 
    data: products,
    isLoading: isLoadingProducts,
    error: productsError
  } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.data as Product[];
    },
    enabled: activeTab === 'products'
  });
  
  const { 
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['/api/analytics/pageviews'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/pageviews');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data.data as PageView[];
    },
    enabled: activeTab === 'analytics'
  });

  // Mutations
  const createBlogPost = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/blog', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Succès",
        description: "L'article a été créé avec succès",
      });
      resetBlogForm();
      setMode('list');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'article",
        variant: "destructive",
      });
    }
  });
  
  const updateBlogPost = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest(`/api/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Succès",
        description: "L'article a été mis à jour avec succès",
      });
      resetBlogForm();
      setMode('list');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de l'article",
        variant: "destructive",
      });
    }
  });
  
  const deleteBlogPost = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/blog/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Succès",
        description: "L'article a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'article",
        variant: "destructive",
      });
    }
  });
  
  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "Le produit a été créé avec succès",
      });
      resetProductForm();
      setMode('list');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du produit",
        variant: "destructive",
      });
    }
  });
  
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "Le produit a été mis à jour avec succès",
      });
      resetProductForm();
      setMode('list');
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du produit",
        variant: "destructive",
      });
    }
  });
  
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "Le produit a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du produit",
        variant: "destructive",
      });
    }
  });

  // Form handlers
  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: '',
      author: '',
      category: '',
      tags: '',
      isPublished: false,
      publishedAt: '',
    });
    setEditingId(null);
  };
  
  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      price: '',
      categories: '',
      badgeText: '',
      badgeColor: '',
      featured: false
    });
    setEditingId(null);
  };
  
  const handleBlogTitleChange = (value: string) => {
    setBlogForm(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value)
    }));
  };
  
  const handleProductNameChange = (value: string) => {
    setProductForm(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };
  
  const handleEditBlogPost = (post: BlogPost) => {
    setBlogForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      image: post.image || '',
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      isPublished: post.isPublished,
      publishedAt: post.publishedAt || '',
    });
    setEditingId(post.id);
    setMode('edit');
  };
  
  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      image: product.image || '',
      price: product.price || '',
      categories: product.categories.join(', '),
      badgeText: product.badge?.text || '',
      badgeColor: product.badge?.color || '',
      featured: product.featured,
    });
    setEditingId(product.id);
    setMode('edit');
  };
  
  const handleSubmitBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title: blogForm.title,
      slug: blogForm.slug,
      content: blogForm.content,
      excerpt: blogForm.excerpt || null,
      image: blogForm.image || null,
      author: blogForm.author,
      category: blogForm.category,
      tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isPublished: blogForm.isPublished,
      publishedAt: blogForm.isPublished && blogForm.publishedAt ? blogForm.publishedAt : null,
    };
    
    if (mode === 'edit' && editingId) {
      updateBlogPost.mutate({ id: editingId, data: formData });
    } else {
      createBlogPost.mutate(formData);
    }
  };
  
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      name: productForm.name,
      slug: productForm.slug,
      description: productForm.description,
      image: productForm.image || null,
      price: productForm.price || null,
      categories: productForm.categories.split(',').map(cat => cat.trim()).filter(Boolean),
      badge: productForm.badgeText ? {
        text: productForm.badgeText,
        color: productForm.badgeColor || 'blue'
      } : null,
      featured: productForm.featured,
    };
    
    if (mode === 'edit' && editingId) {
      updateProduct.mutate({ id: editingId, data: formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setMode('list');
        resetBlogForm();
        resetProductForm();
      }}>
        <TabsList className="mb-8">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="chat">Chat en direct</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        {/* Messages tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages de contact</CardTitle>
              <CardDescription>Gérez les messages envoyés via le formulaire de contact</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="text-center py-6">Chargement des messages...</div>
              ) : messagesError ? (
                <div className="text-center py-6 text-red-500">Erreur lors du chargement des messages</div>
              ) : !messages?.length ? (
                <div className="text-center py-6">Aucun message à afficher</div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(message.createdAt)}
                          </TableCell>
                          <TableCell>
                            {message.name}
                            {message.company && <div className="text-xs text-muted-foreground">{message.company}</div>}
                          </TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell>
                            <a href={`mailto:${message.email}`} className="hover:underline">
                              {message.email}
                            </a>
                            {message.phone && (
                              <div className="text-xs text-muted-foreground">
                                {message.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate">{message.message}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Chat tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liste des sessions */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sessions de chat</CardTitle>
                <CardDescription>
                  {wsConnected ? (
                    "Connecté au service de chat en direct"
                  ) : (
                    <span className="text-destructive flex items-center gap-2">
                      <FontAwesomeIcon icon={faExclamationCircle} />
                      Déconnecté du service de chat
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chatSessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucune session de chat active
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2">
                      {chatSessions
                        .sort((a, b) => {
                          // Trier d'abord par nombre de messages non lus, puis par date d'activité
                          if (a.unreadCount !== b.unreadCount) {
                            return b.unreadCount - a.unreadCount;
                          }
                          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                        })
                        .map((session) => (
                          <div
                            key={session.sessionId}
                            className={`p-3 rounded-lg cursor-pointer ${
                              selectedChatSession === session.sessionId
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-muted"
                            } ${
                              session.unreadCount > 0 && "border-l-4 border-destructive"
                            }`}
                            onClick={() => handleSelectChatSession(session.sessionId)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} />
                                {session.customerInfo.name || "Client"}
                                {session.unreadCount > 0 && (
                                  <Badge variant="destructive" className="ml-2">
                                    {session.unreadCount} {session.unreadCount === 1 ? "nouveau" : "nouveaux"}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs opacity-80">
                                {formatDate(session.lastActivity)}
                              </div>
                            </div>
                            
                            <div className="mt-1 text-sm">
                              {session.customerInfo.company && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FontAwesomeIcon icon={faBuilding} className="opacity-70" size="xs" />
                                  {session.customerInfo.company}
                                </div>
                              )}
                              
                              {session.customerInfo.service && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FontAwesomeIcon icon={faComment} className="opacity-70" size="xs" />
                                  {session.customerInfo.service}
                                </div>
                              )}
                              
                              {session.customerInfo.phone && (
                                <div className="flex items-center gap-1 mt-1">
                                  <FontAwesomeIcon icon={faPhone} className="opacity-70" size="xs" />
                                  {session.customerInfo.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            
            {/* Conversation */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedChatSession ? (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCommentDots} />
                      Conversation avec{" "}
                      {chatSessions.find(s => s.sessionId === selectedChatSession)?.customerInfo.name || "Client"}
                    </div>
                  ) : (
                    "Sélectionnez une conversation"
                  )}
                </CardTitle>
                {selectedChatSession && (
                  <CardDescription>
                    Session ID: {selectedChatSession.substring(0, 8)}...
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!selectedChatSession ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                    <FontAwesomeIcon icon={faComment} size="3x" className="mb-4 opacity-30" />
                    <p>Sélectionnez une session de chat à gauche pour voir les messages</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {chatSessions
                          .find(s => s.sessionId === selectedChatSession)
                          ?.messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${
                                msg.sender === "admin" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  msg.sender === "admin"
                                    ? "bg-primary text-primary-foreground"
                                    : msg.sender === "bot"
                                    ? "bg-secondary text-secondary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className="text-sm font-medium mb-1">
                                  {msg.sender === "admin"
                                    ? "Admin"
                                    : msg.sender === "bot"
                                    ? "Bot"
                                    : "Client"}
                                </div>
                                <div className="break-words whitespace-pre-wrap">{msg.message}</div>
                                <div className="text-xs opacity-70 text-right mt-1">
                                  {formatDate(msg.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="mt-4">
                      <form onSubmit={handleSendAdminMessage} className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Tapez votre message..."
                          value={adminChatMessage}
                          onChange={(e) => setAdminChatMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={!wsConnected || !adminChatMessage.trim()}>
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                          Envoyer
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Blog tab */}
        <TabsContent value="blog">
          {mode === 'list' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Articles de blog</CardTitle>
                  <CardDescription>Gérez les articles du blog</CardDescription>
                </div>
                <Button onClick={() => {
                  resetBlogForm();
                  setMode('add');
                }}>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Ajouter un article
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingBlogPosts ? (
                  <div className="text-center py-6">Chargement des articles...</div>
                ) : blogPostsError ? (
                  <div className="text-center py-6 text-red-500">Erreur lors du chargement des articles</div>
                ) : !blogPosts?.length ? (
                  <div className="text-center py-6">Aucun article à afficher</div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Auteur</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{post.author}</TableCell>
                            <TableCell>{post.category}</TableCell>
                            <TableCell>
                              <BadgeCustom variant={post.isPublished ? "success" : "secondary"}>
                                {post.isPublished ? 'Publié' : 'Brouillon'}
                              </BadgeCustom>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(post.publishedAt || post.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditBlogPost(post)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
                                      deleteBlogPost.mutate(post.id);
                                    }
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-destructive" />
                                </Button>
                                
                                <a 
                                  href={`/blog/${post.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="icon">
                                    <FontAwesomeIcon icon={faEye} />
                                  </Button>
                                </a>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
          
          {(mode === 'add' || mode === 'edit') && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setMode('list');
                      resetBlogForm();
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <CardTitle>{mode === 'add' ? 'Ajouter un article' : 'Modifier l\'article'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBlogPost} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre</Label>
                        <Input 
                          id="title" 
                          value={blogForm.title} 
                          onChange={(e) => handleBlogTitleChange(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input 
                          id="slug" 
                          value={blogForm.slug} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="author">Auteur</Label>
                        <Input 
                          id="author" 
                          value={blogForm.author} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, author: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Input 
                          id="category" 
                          value={blogForm.category} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input 
                          id="tags" 
                          value={blogForm.tags} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="image">URL de l'image</Label>
                        <Input 
                          id="image" 
                          value={blogForm.image} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, image: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Switch 
                          id="isPublished" 
                          checked={blogForm.isPublished}
                          onCheckedChange={(checked) => setBlogForm(prev => ({ ...prev, isPublished: checked }))}
                        />
                        <Label htmlFor="isPublished">Publier l'article</Label>
                      </div>
                      
                      {blogForm.isPublished && (
                        <div>
                          <Label htmlFor="publishedAt">Date de publication</Label>
                          <Input 
                            id="publishedAt" 
                            type="datetime-local" 
                            value={blogForm.publishedAt} 
                            onChange={(e) => setBlogForm(prev => ({ ...prev, publishedAt: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="excerpt">Extrait</Label>
                        <Textarea 
                          id="excerpt" 
                          rows={3}
                          value={blogForm.excerpt} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                          placeholder="Un court résumé de l'article (optionnel)"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="content">Contenu</Label>
                        <Textarea 
                          id="content" 
                          rows={12}
                          value={blogForm.content} 
                          onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setMode('list');
                        resetBlogForm();
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Products tab */}
        <TabsContent value="products">
          {mode === 'list' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Produits</CardTitle>
                  <CardDescription>Gérez les produits du catalogue</CardDescription>
                </div>
                <Button onClick={() => {
                  resetProductForm();
                  setMode('add');
                }}>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Ajouter un produit
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-6">Chargement des produits...</div>
                ) : productsError ? (
                  <div className="text-center py-6 text-red-500">Erreur lors du chargement des produits</div>
                ) : !products?.length ? (
                  <div className="text-center py-6">Aucun produit à afficher</div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Catégories</TableHead>
                          <TableHead>Badge</TableHead>
                          <TableHead>Mis en avant</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.price || 'Non défini'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {product.categories.map((cat, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.badge ? (
                                <Badge 
                                  className={`
                                    ${product.badge.color === 'red' ? 'bg-red-500' : 
                                      product.badge.color === 'green' ? 'bg-green-500' : 
                                      product.badge.color === 'blue' ? 'bg-blue-500' : 
                                      'bg-yellow-500'
                                    } text-white
                                  `}
                                >
                                  {product.badge.text}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Aucun</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.featured ? (
                                <BadgeCustom variant="success">
                                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                  Oui
                                </BadgeCustom>
                              ) : (
                                <Badge variant="secondary">
                                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                  Non
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
                                      deleteProduct.mutate(product.id);
                                    }
                                  }}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="text-destructive" />
                                </Button>
                                
                                <a 
                                  href={`/products/${product.slug}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="icon">
                                    <FontAwesomeIcon icon={faEye} />
                                  </Button>
                                </a>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
          
          {(mode === 'add' || mode === 'edit') && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setMode('list');
                      resetProductForm();
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <CardTitle>{mode === 'add' ? 'Ajouter un produit' : 'Modifier le produit'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nom</Label>
                        <Input 
                          id="name" 
                          value={productForm.name} 
                          onChange={(e) => handleProductNameChange(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input 
                          id="slug" 
                          value={productForm.slug} 
                          onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="price">Prix</Label>
                        <Input 
                          id="price" 
                          value={productForm.price} 
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="ex: 1 299 €"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="categories">Catégories (séparées par des virgules)</Label>
                        <Input 
                          id="categories" 
                          value={productForm.categories} 
                          onChange={(e) => setProductForm(prev => ({ ...prev, categories: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="image">URL de l'image</Label>
                        <Input 
                          id="image" 
                          value={productForm.image} 
                          onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Badge (optionnel)</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            id="badgeText" 
                            value={productForm.badgeText} 
                            onChange={(e) => setProductForm(prev => ({ ...prev, badgeText: e.target.value }))}
                            placeholder="Texte du badge"
                          />
                          <select 
                            id="badgeColor"
                            value={productForm.badgeColor}
                            onChange={(e) => setProductForm(prev => ({ ...prev, badgeColor: e.target.value }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="blue">Bleu</option>
                            <option value="green">Vert</option>
                            <option value="red">Rouge</option>
                            <option value="yellow">Jaune</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Switch 
                          id="featured" 
                          checked={productForm.featured}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                        />
                        <Label htmlFor="featured">Mettre en avant</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          rows={12}
                          value={productForm.description} 
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setMode('list');
                        resetProductForm();
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Analytics tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques des pages</CardTitle>
              <CardDescription>Visualisez les visites de pages de votre site</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <div className="text-center py-6">Chargement des données analytiques...</div>
              ) : analyticsError ? (
                <div className="text-center py-6 text-red-500">Erreur lors du chargement des données analytiques</div>
              ) : !analytics?.length ? (
                <div className="text-center py-6">Aucune donnée analytique à afficher</div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date et Heure</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Référent</TableHead>
                        <TableHead>Navigateur</TableHead>
                        <TableHead>Pays</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.map((pageView) => (
                        <TableRow key={pageView.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(pageView.timestamp)}
                          </TableCell>
                          <TableCell>{pageView.path}</TableCell>
                          <TableCell>{pageView.referrer || 'Direct'}</TableCell>
                          <TableCell>{pageView.userAgent || 'Inconnu'}</TableCell>
                          <TableCell>
                            {pageView.countryCode ? (
                              <span>{pageView.countryCode}</span>
                            ) : (
                              <span className="text-muted-foreground">Inconnu</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}