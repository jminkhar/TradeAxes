import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
}).extend({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contact message schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const contactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères")
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof contactMessageSchema>;

// Blog posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  image: text("image"),
  author: text("author").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets")
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  price: text("price"),
  categories: text("categories").array(),
  badge: jsonb("badge"),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets")
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Analytics schema
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ip: text("ip"),
  countryCode: text("country_code"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  timestamp: true,
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;

// Chat Messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  sender: text("sender").notNull(), // 'user', 'admin', or 'bot'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
  metadata: jsonb("metadata") // Pour stocker des infos supplémentaires comme customerInfo
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
