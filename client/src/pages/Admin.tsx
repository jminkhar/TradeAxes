import { useState } from "react";
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
  faArrowLeft 
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
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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