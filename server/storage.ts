import { 
  users, contactMessages, blogPosts, products, pageViews, chatMessages,
  type User, type InsertUser, 
  type ContactMessage, type InsertContactMessage,
  type BlogPost, type InsertBlogPost,
  type Product, type InsertProduct,
  type PageView, type InsertPageView,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Blog Posts
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Analytics
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViews(): Promise<PageView[]>;
  
  // Chat
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  getUnreadChatMessageCount(): Promise<number>;
  markChatMessagesAsRead(sessionId: string): Promise<void>;
  getActiveChatSessions(): Promise<string[]>;
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Contact Messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
  }
  
  // Blog Posts
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }
  
  async getBlogPosts(publishedOnly: boolean = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(blogPosts.publishedAt);
    }
    return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const result = await db.update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }
  
  // Products
  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }
  
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }
  
  // Analytics
  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const result = await db.insert(pageViews).values(pageView).returning();
    return result[0];
  }
  
  async getPageViews(): Promise<PageView[]> {
    return await db.select().from(pageViews).orderBy(pageViews.timestamp);
  }
  
  // Chat
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }
  
  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }
  
  async getUnreadChatMessageCount(): Promise<number> {
    const result = await db.select({
      value: count()
    }).from(chatMessages)
      .where(
        and(
          eq(chatMessages.read, false),
          eq(chatMessages.sender, 'user')
        )
      );
    return result[0]?.value || 0;
  }
  
  async markChatMessagesAsRead(sessionId: string): Promise<void> {
    await db.update(chatMessages)
      .set({ read: true })
      .where(
        and(
          eq(chatMessages.sessionId, sessionId),
          eq(chatMessages.sender, 'user')
        )
      );
  }
  
  async getActiveChatSessions(): Promise<string[]> {
    // Obtenir tous les sessionId uniques de la table des messages
    const result = await db
      .selectDistinct({ sessionId: chatMessages.sessionId })
      .from(chatMessages)
      .orderBy(desc(chatMessages.timestamp));
    
    return result.map(row => row.sessionId);
  }
}

// Fallback MemStorage class for development and testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactMessagesList: ContactMessage[];
  private blogPostsList: BlogPost[];
  private productsList: Product[];
  private pageViewsList: PageView[];
  private chatMessagesList: ChatMessage[];
  
  currentId: number;
  currentContactId: number;
  currentBlogPostId: number;
  currentProductId: number;
  currentPageViewId: number;
  currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.contactMessagesList = [];
    this.blogPostsList = [];
    this.productsList = [];
    this.pageViewsList = [];
    this.chatMessagesList = [];
    
    this.currentId = 1;
    this.currentContactId = 1;
    this.currentBlogPostId = 1;
    this.currentProductId = 1;
    this.currentPageViewId = 1;
    this.currentChatMessageId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contact Messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentContactId++;
    const now = new Date();
    const contactMessage: ContactMessage = {
      id,
      name: message.name,
      company: message.company ?? null,
      email: message.email,
      phone: message.phone ?? null,
      subject: message.subject,
      message: message.message,
      createdAt: now
    };
    this.contactMessagesList.push(contactMessage);
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return [...this.contactMessagesList];
  }
  
  // Blog Posts
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const now = new Date();
    const blogPost: BlogPost = {
      id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt ?? null,
      image: post.image ?? null,
      author: post.author,
      category: post.category,
      tags: post.tags ?? [],
      isPublished: post.isPublished ?? false,
      publishedAt: post.publishedAt ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.blogPostsList.push(blogPost);
    return blogPost;
  }
  
  async getBlogPosts(publishedOnly: boolean = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      return this.blogPostsList.filter(post => post.isPublished);
    }
    return [...this.blogPostsList];
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return this.blogPostsList.find(post => post.slug === slug);
  }
  
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const index = this.blogPostsList.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    const updatedPost = {
      ...this.blogPostsList[index],
      ...post,
      updatedAt: now
    };
    
    this.blogPostsList[index] = updatedPost;
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    const initialLength = this.blogPostsList.length;
    this.blogPostsList = this.blogPostsList.filter(post => post.id !== id);
    return initialLength !== this.blogPostsList.length;
  }
  
  // Products
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const newProduct: Product = {
      id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      image: product.image ?? null,
      price: product.price ?? null,
      categories: product.categories ?? [],
      badge: product.badge ?? null,
      featured: product.featured ?? false,
      createdAt: now,
      updatedAt: now
    };
    this.productsList.push(newProduct);
    return newProduct;
  }
  
  async getProducts(): Promise<Product[]> {
    return [...this.productsList];
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.productsList.find(product => product.slug === slug);
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.productsList.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    const now = new Date();
    const updatedProduct = {
      ...this.productsList[index],
      ...product,
      updatedAt: now
    };
    
    this.productsList[index] = updatedProduct;
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const initialLength = this.productsList.length;
    this.productsList = this.productsList.filter(product => product.id !== id);
    return initialLength !== this.productsList.length;
  }
  
  // Analytics
  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const id = this.currentPageViewId++;
    const now = new Date();
    const newPageView: PageView = {
      id,
      path: pageView.path,
      referrer: pageView.referrer ?? null,
      userAgent: pageView.userAgent ?? null,
      ip: pageView.ip ?? null,
      countryCode: pageView.countryCode ?? null,
      timestamp: now
    };
    this.pageViewsList.push(newPageView);
    return newPageView;
  }
  
  async getPageViews(): Promise<PageView[]> {
    return [...this.pageViewsList];
  }
  
  // Chat
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const now = new Date();
    const chatMessage: ChatMessage = {
      id,
      sessionId: message.sessionId,
      sender: message.sender,
      message: message.message,
      timestamp: now,
      read: message.read ?? false,
      metadata: message.metadata ?? null
    };
    this.chatMessagesList.push(chatMessage);
    return chatMessage;
  }
  
  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessagesList.filter(msg => msg.sessionId === sessionId);
  }
  
  async getUnreadChatMessageCount(): Promise<number> {
    return this.chatMessagesList.filter(msg => !msg.read && msg.sender === 'user').length;
  }
  
  async markChatMessagesAsRead(sessionId: string): Promise<void> {
    this.chatMessagesList = this.chatMessagesList.map(msg => {
      if (msg.sessionId === sessionId && msg.sender === 'user') {
        return { ...msg, read: true };
      }
      return msg;
    });
  }
  
  async getActiveChatSessions(): Promise<string[]> {
    // Obtenir tous les sessionId uniques de la liste des messages
    const sessionIds = new Set<string>();
    for (const msg of this.chatMessagesList) {
      sessionIds.add(msg.sessionId);
    }
    return Array.from(sessionIds);
  }
}

// Use PostgreSQL storage
export const storage = new PostgresStorage();
