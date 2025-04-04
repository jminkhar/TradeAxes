import { defineStore } from 'pinia'
import axios from 'axios'

// Define types
interface User {
  id: number;
  username: string;
  role: string;
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
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
}

// Define store
export const useMainStore = defineStore('main', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    products: [] as Product[],
    blogPosts: [] as BlogPost[],
    contactMessages: [] as ContactMessage[],
    pageViews: [] as PageView[],
    chatMessages: [] as ChatMessage[]
  }),
  
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    featuredProducts: (state) => state.products.filter(product => product.featured),
    publishedBlogPosts: (state) => state.blogPosts.filter(post => post.isPublished)
  },
  
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await axios.post('/auth/login', { username, password })
        this.user = response.data
        this.isAuthenticated = true
        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
    },
    
    async fetchProducts() {
      try {
        const response = await axios.get('/products')
        this.products = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching products:', error)
        return []
      }
    },
    
    async fetchBlogPosts(publishedOnly = true) {
      try {
        const response = await axios.get(`/blog-posts?publishedOnly=${publishedOnly}`)
        this.blogPosts = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }
    },
    
    async fetchContactMessages() {
      try {
        const response = await axios.get('/contact-messages')
        this.contactMessages = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching contact messages:', error)
        return []
      }
    },
    
    async fetchPageViews() {
      try {
        const response = await axios.get('/analytics/page-views')
        this.pageViews = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching page views:', error)
        return []
      }
    },
    
    async fetchChatMessages(sessionId: string) {
      try {
        const response = await axios.get(`/chat/messages/${sessionId}`)
        const messages = response.data
        this.chatMessages = messages
        return messages
      } catch (error) {
        console.error('Error fetching chat messages:', error)
        return []
      }
    },
    
    async sendContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>) {
      try {
        const response = await axios.post('/contact-messages', message)
        return response.data
      } catch (error) {
        console.error('Error sending contact message:', error)
        throw error
      }
    },
    
    async sendChatMessage(message: { sessionId: string, message: string }) {
      try {
        const response = await axios.post('/chat/messages', message)
        return response.data
      } catch (error) {
        console.error('Error sending chat message:', error)
        throw error
      }
    }
  }
})
