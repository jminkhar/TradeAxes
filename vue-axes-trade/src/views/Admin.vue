<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('dashboard')
const isAuthenticated = ref(false)
const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Changement d'onglet
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// Vérification de l'authentification
onMounted(() => {
  checkAuthentication()
})

const checkAuthentication = async () => {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include'
    })
    
    if (response.ok) {
      isAuthenticated.value = true
    }
  } catch (error) {
    console.error('Authentication check failed:', error)
  }
}

// Connexion admin
const login = async () => {
  try {
    errorMessage.value = ''
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      }),
      credentials: 'include'
    })
    
    if (response.ok) {
      isAuthenticated.value = true
      username.value = ''
      password.value = ''
    } else {
      const data = await response.json()
      errorMessage.value = data.message || 'Identifiants incorrects'
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = 'Erreur de connexion'
  }
}
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold mb-8">Administration</h1>
      
      <!-- Formulaire de connexion -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6">Connexion</h2>
        
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label for="username" class="form-label">Nom d'utilisateur</label>
            <input 
              id="username" 
              v-model="username" 
              type="text" 
              class="form-input" 
              required
            />
          </div>
          
          <div>
            <label for="password" class="form-label">Mot de passe</label>
            <input 
              id="password" 
              v-model="password" 
              type="password" 
              class="form-input" 
              required
            />
          </div>
          
          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary w-full">
            Se connecter
          </button>
        </form>
      </div>
      
      <!-- Interface d'administration -->
      <div v-else>
        <!-- Onglets -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="flex space-x-8">
            <button 
              @click="setActiveTab('dashboard')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Tableau de bord
            </button>
            <button 
              @click="setActiveTab('products')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Produits
            </button>
            <button 
              @click="setActiveTab('blog')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'blog' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Blog
            </button>
            <button 
              @click="setActiveTab('messages')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Messages
            </button>
            <button 
              @click="setActiveTab('analytics')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Analytics
            </button>
          </nav>
        </div>
        
        <!-- Contenu des onglets -->
        <div v-if="activeTab === 'dashboard'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Tableau de bord</h2>
          <p class="text-gray-600">
            Bienvenue dans l'interface d'administration du site AxesTrade.
          </p>
          <!-- À compléter avec des statistiques et des widgets -->
        </div>
        
        <div v-if="activeTab === 'products'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Gestion des produits</h2>
          <!-- À compléter avec le formulaire de gestion des produits -->
        </div>
        
        <div v-if="activeTab === 'blog'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Gestion du blog</h2>
          <!-- À compléter avec le formulaire de gestion des articles -->
        </div>
        
        <div v-if="activeTab === 'messages'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Messages de contact</h2>
          <!-- À compléter avec la liste des messages -->
        </div>
        
        <div v-if="activeTab === 'analytics'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Statistiques du site</h2>
          <!-- À compléter avec des graphiques et des statistiques -->
        </div>
      </div>
    </div>
  </div>
</template>