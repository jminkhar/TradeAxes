import { createApp } from 'vue'
import { createPinia } from 'pinia'
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

// Create Pinia store
const pinia = createPinia()

// Create and mount app
const app = createApp(App)

// Register global components
app.component('font-awesome-icon', FontAwesomeIcon)

// Use plugins
app.use(pinia)
app.use(router)

app.mount('#app')
