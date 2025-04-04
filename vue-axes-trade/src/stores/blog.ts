import { defineStore } from 'pinia'
import axios from 'axios'

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  image: string | null
  author: string
  category: string
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [] as BlogPost[],
    isLoading: false,
    error: null as string | null,
    currentPost: null as BlogPost | null
  }),
  
  getters: {
    publishedPosts: (state) => state.posts.filter(post => post.isPublished),
    
    getPostBySlug: (state) => (slug: string) => {
      return state.posts.find(post => post.slug === slug)
    },
    
    getPostsByCategory: (state) => (category: string) => {
      return state.posts.filter(post => post.category === category)
    },
    
    getPostsByTag: (state) => (tag: string) => {
      return state.posts.filter(post => post.tags.includes(tag))
    }
  },
  
  actions: {
    async fetchPosts() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get('/api/blog')
        this.posts = response.data
      } catch (err) {
        this.error = 'Erreur lors du chargement des articles'
        console.error('Error fetching blog posts:', err)
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchPostBySlug(slug: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/blog/${slug}`)
        this.currentPost = response.data
        return response.data
      } catch (err) {
        this.error = 'Erreur lors du chargement de l\'article'
        console.error(`Error fetching blog post ${slug}:`, err)
        return null
      } finally {
        this.isLoading = false
      }
    }
  }
})
