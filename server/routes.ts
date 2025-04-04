import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  contactMessageSchema, 
  insertBlogPostSchema, 
  insertProductSchema,
  insertPageViewSchema,
  insertChatMessageSchema,
  insertUserSchema,
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
// Suppression de la dépendance SendGrid, on utilisera une approche plus simple
import './types'; // Importer les types étendus pour express-session

const scryptAsync = promisify(scrypt);

// Middleware d'authentification pour protéger les routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

// Middleware pour vérifier si l'utilisateur est administrateur
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Fonction pour hacher les mots de passe
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Fonction pour comparer les mots de passe
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration de la session
  app.use(session({
    secret: process.env.SESSION_SECRET || "axes-trade-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semaine
    }
  } as session.SessionOptions));

  // prefix all routes with /api
  
  // Routes d'authentification
  app.post('/api/register', async (req, res) => {
    try {
      // Validation des données
      const userInput = insertUserSchema.parse(req.body);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(userInput.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Ce nom d'utilisateur est déjà utilisé"
        });
      }
      
      // Hacher le mot de passe
      const hashedPassword = await hashPassword(userInput.password);
      
      // Créer l'utilisateur
      const user = await storage.createUser({
        ...userInput,
        password: hashedPassword
      });
      
      // Établir la session
      req.session.userId = user.id;
      
      // Retourner l'utilisateur sans le mot de passe
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          message: "Erreur de validation",
          errors: error.errors
        });
      } else {
        console.error("Error during registration:", error);
        res.status(500).json({ 
          success: false,
          message: "Une erreur est survenue lors de l'inscription"
        });
      }
    }
  });
  
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Nom d'utilisateur et mot de passe requis"
        });
      }
      
      // Rechercher l'utilisateur
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "Identifiants incorrects"
        });
      }
      
      // Vérifier le mot de passe
      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ 
          success: false,
          message: "Identifiants incorrects"
        });
      }
      
      // Établir la session
      req.session.userId = user.id;
      
      // Retourner l'utilisateur sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({ 
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ 
        success: false,
        message: "Une erreur est survenue lors de la connexion"
      });
    }
  });
  
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          message: "Erreur lors de la déconnexion"
        });
      }
      
      res.status(200).json({ 
        success: true,
        message: "Déconnecté avec succès"
      });
    });
  });
  
  app.get('/api/user', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false,
        message: "Non authentifié"
      });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ 
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
      
      // Retourner l'utilisateur sans le mot de passe
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ 
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ 
        success: false,
        message: "Une erreur est survenue lors de la récupération des informations utilisateur"
      });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = contactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // Pour l'instant, on enregistre simplement le message dans la base de données
      // À l'avenir, on pourrait ajouter une notification WhatsApp ici
      // TODO: Implémenter l'intégration WhatsApp si nécessaire
      
      console.log('Nouveau message de contact reçu:', {
        nom: validatedData.name,
        email: validatedData.email,
        sujet: validatedData.subject
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Message envoyé avec succès" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          message: "Erreur de validation",
          errors: error.errors
        });
      } else {
        console.error('Erreur lors du traitement du formulaire de contact:', error);
        res.status(500).json({ 
          success: false,
          message: "Une erreur est survenue lors du traitement de votre demande" 
        });
      }
    }
  });
  
  // Get all contact messages (admin endpoint)
  app.get('/api/contact', requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.status(200).json({ 
        success: true, 
        data: messages 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "An error occurred while retrieving messages" 
      });
    }
  });

  // Blog routes
  app.post('/api/blog', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "An error occurred while creating blog post" });
      }
    }
  });

  app.get('/api/blog', async (req, res) => {
    try {
      const publishedOnly = req.query.published === 'true';
      const posts = await storage.getBlogPosts(publishedOnly);
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while retrieving blog posts" });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while retrieving blog post" });
    }
  });

  app.put('/api/blog/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      if (!post) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "An error occurred while updating blog post" });
      }
    }
  });

  app.delete('/api/blog/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      res.status(200).json({ success: true, message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while deleting blog post" });
    }
  });

  // Product routes
  app.post('/api/products', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "An error occurred while creating product" });
      }
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while retrieving products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while retrieving product" });
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "An error occurred while updating product" });
      }
    }
  });

  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while deleting product" });
    }
  });

  // Analytics routes
  app.post('/api/analytics/pageview', async (req, res) => {
    try {
      const validatedData = insertPageViewSchema.parse(req.body);
      await storage.createPageView(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ success: false, message: "An error occurred while recording page view" });
      }
    }
  });

  app.get('/api/analytics/pageviews', requireAdmin, async (req, res) => {
    try {
      const pageViews = await storage.getPageViews();
      res.status(200).json({ success: true, data: pageViews });
    } catch (error) {
      res.status(500).json({ success: false, message: "An error occurred while retrieving analytics" });
    }
  });

  // Create HTTP server and WebSocket server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for chat functionality
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const clients: WebSocket[] = [];
  
  wss.on('connection', (ws) => {
    clients.push(ws);
    
    // Send initial unread message count
    const sendUnreadCount = async () => {
      try {
        const count = await storage.getUnreadChatMessageCount();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'unread_count', count }));
        }
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    };
    sendUnreadCount();
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'chat_message') {
          // Validate and store chat message
          const validatedData = insertChatMessageSchema.parse(data.payload);
          const savedMessage = await storage.createChatMessage(validatedData);
          
          // Broadcast to all connected clients
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                message: savedMessage
              }));
            }
          });
          
          // Update unread count for all clients
          const newCount = await storage.getUnreadChatMessageCount();
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'unread_count',
                count: newCount
              }));
            }
          });
        } else if (data.type === 'mark_read') {
          // Mark messages as read
          await storage.markChatMessagesAsRead(data.sessionId);
          
          // Update unread count for all clients
          const newCount = await storage.getUnreadChatMessageCount();
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'unread_count',
                count: newCount
              }));
            }
          });
        } else if (data.type === 'get_session_messages') {
          // Get messages for a specific session
          const messages = await storage.getChatMessagesBySession(data.sessionId);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'session_messages',
              messages
            }));
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error processing message'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      const index = clients.indexOf(ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });

  return httpServer;
}
