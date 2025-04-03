import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  contactMessageSchema, 
  insertBlogPostSchema, 
  insertProductSchema,
  insertPageViewSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = contactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // In a real production app, you might want to send an email here
      // For now, we'll just return the saved message
      
      res.status(201).json({ 
        success: true, 
        message: "Message sent successfully" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: "An error occurred while processing your request" 
        });
      }
    }
  });
  
  // Get all contact messages (admin endpoint)
  app.get('/api/contact', async (req, res) => {
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
  app.post('/api/blog', async (req, res) => {
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

  app.put('/api/blog/:id', async (req, res) => {
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

  app.delete('/api/blog/:id', async (req, res) => {
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
  app.post('/api/products', async (req, res) => {
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

  app.put('/api/products/:id', async (req, res) => {
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

  app.delete('/api/products/:id', async (req, res) => {
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

  app.get('/api/analytics/pageviews', async (req, res) => {
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
