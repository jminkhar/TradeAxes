import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
  id: number
  username: string
  isAdmin: boolean
}

interface LoginCredentials {
  username: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.isAdmin || false
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await axios.post('/api/login', credentials)
        this.user = response.data
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Erreur de connexion'
        console.error('Login error:', err)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async logout() {
      this.isLoading = true
      
      try {
        await axios.post('/api/logout')
        this.user = null
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        this.isLoading = false
      }
    },
    
    async checkAuth() {
      this.isLoading = true
      
      try {
        const response = await axios.get('/api/user')
        this.user = response.data
      } catch (err) {
        this.user = null
      } finally {
        this.isLoading = false
      }
    }
  }
})
