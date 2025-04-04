import { defineStore } from 'pinia'
import axios from 'axios'

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  price: string | null
  categories: string[]
  badge: {
    text: string
    color: string
  } | null
  featured: boolean
  createdAt: string
  updatedAt: string
}

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    isLoading: false,
    error: null as string | null,
    currentProduct: null as Product | null
  }),
  
  getters: {
    featuredProducts: (state) => state.products.filter(product => product.featured),
    
    getProductBySlug: (state) => (slug: string) => {
      return state.products.find(product => product.slug === slug)
    },
    
    getProductsByCategory: (state) => (category: string) => {
      return state.products.filter(product => 
        product.categories.includes(category)
      )
    }
  },
  
  actions: {
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get('/api/products')
        this.products = response.data
      } catch (err) {
        this.error = 'Erreur lors du chargement des produits'
        console.error('Error fetching products:', err)
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchProductBySlug(slug: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.get(`/api/products/${slug}`)
        this.currentProduct = response.data
        return response.data
      } catch (err) {
        this.error = 'Erreur lors du chargement du produit'
        console.error(`Error fetching product ${slug}:`, err)
        return null
      } finally {
        this.isLoading = false
      }
    }
  }
})
