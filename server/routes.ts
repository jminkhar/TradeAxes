import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactMessageSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}
