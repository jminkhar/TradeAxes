import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import axios from 'axios'

import './index.css'
import App from './App.vue'

// Import router
import router from './router'

// Configure FontAwesome
library.add(fas, fab)

// Configure Axios
axios.defaults.baseURL = '/api'

// Create Vuex store
const store = createStore({
  state() {
    return {
      user: null,
      isAuthenticated: false,
      products: [],
      blogPosts: [],
      contactMessages: [],
      pageViews: [],
      chatMessages: []
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    setProducts(state, products) {
      state.products = products
    },
    setBlogPosts(state, posts) {
      state.blogPosts = posts
    },
    setContactMessages(state, messages) {
      state.contactMessages = messages
    },
    setPageViews(state, views) {
      state.pageViews = views
    },
    setChatMessages(state, messages) {
      state.chatMessages = messages
    }
  },
  actions: {
    async fetchProducts({ commit }) {
      try {
        const response = await axios.get('/products')
        commit('setProducts', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching products:', error)
        return []
      }
    },
    async fetchBlogPosts({ commit }, publishedOnly = true) {
      try {
        const response = await axios.get(`/blog-posts?publishedOnly=${publishedOnly}`)
        commit('setBlogPosts', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }
    },
    async fetchContactMessages({ commit }) {
      try {
        const response = await axios.get('/contact-messages')
        commit('setContactMessages', response.data)
        return response.data
      } catch (error) {
        console.error('Error fetching contact messages:', error)
        return []
      }
    }
  },
  getters: {
    isAdmin(state) {
      return state.user?.role === 'admin'
    },
    featuredProducts(state) {
      return state.products.filter(product => product.featured)
    },
    publishedBlogPosts(state) {
      return state.blogPosts.filter(post => post.isPublished)
    }
  }
})

// Router is imported from './router'

// Create and mount app
const app = createApp(App)

// Register global components
app.component('font-awesome-icon', FontAwesomeIcon)

// Use plugins
app.use(store)
app.use(router)

app.mount('#app')
