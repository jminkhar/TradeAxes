<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Types pour le système de chat
interface ChatMessage {
  id: number;
  sessionId: string;
  sender: 'user' | 'admin' | 'bot';
  message: string;
  timestamp: string;
  read: boolean;
}

interface CustomerInfo {
  name: string;
  company: string;
  service: string;
  phone: string;
}

interface ChatSession {
  sessionId: string;
  customerInfo: CustomerInfo;
  lastActivity: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const authStore = useAuthStore()
const router = useRouter()
const activeTab = ref('dashboard')
const wsConnection = ref<WebSocket | null>(null)
const wsConnected = ref(false)
const chatSessions = ref<ChatSession[]>([])
const selectedChatSession = ref<string | null>(null)
const adminChatMessage = ref('')

// Changement d'onglet
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  
  // Si on passe à l'onglet de chat, établir la connexion WebSocket
  if (tab === 'chat' && !wsConnection.value) {
    setupWebSocketConnection()
  }
}

// Établir la connexion WebSocket
const setupWebSocketConnection = () => {
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    return
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws`
  
  const socket = new WebSocket(wsUrl)
  wsConnection.value = socket
  
  socket.onopen = () => {
    console.log('Admin WebSocket connection established')
    wsConnected.value = true
    
    // Demander toutes les sessions actives
    socket.send(JSON.stringify({
      type: 'admin_get_sessions'
    }))
  }
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'chat_message') {
      // Ajouter le message à la session correspondante
      handleChatMessage(data.message)
    } else if (data.type === 'chat_sessions') {
      // Réception de toutes les sessions actives
      chatSessions.value = data.sessions
    } else if (data.type === 'admin_notification') {
      handleAdminNotification(data.notification)
    }
  }
  
  socket.onerror = (error) => {
    console.error('Admin WebSocket error:', error)
    wsConnected.value = false
  }
  
  socket.onclose = () => {
    console.log('Admin WebSocket connection closed')
    wsConnected.value = false
    wsConnection.value = null
  }
}

// Gestion des messages de chat
const handleChatMessage = (message: ChatMessage) => {
  // Trouver la session correspondante
  const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === message.sessionId)
  
  if (sessionIndex >= 0) {
    // Mise à jour d'une session existante
    const session = { ...chatSessions.value[sessionIndex] }
    
    // Ajouter le message
    session.messages.push(message)
    session.lastActivity = message.timestamp
    
    // Mettre à jour le compteur de messages non lus si ce n'est pas la session actuellement sélectionnée
    if (selectedChatSession.value !== message.sessionId && message.sender === 'user') {
      session.unreadCount = (session.unreadCount || 0) + 1
    }
    
    // Mettre à jour la session dans le tableau
    chatSessions.value.splice(sessionIndex, 1, session)
  } else if (message.sender === 'user') {
    // Nouvelle session
    chatSessions.value.push({
      sessionId: message.sessionId,
      customerInfo: {
        name: 'Client',
        company: '',
        service: '',
        phone: ''
      },
      lastActivity: message.timestamp,
      unreadCount: 1,
      messages: [message]
    })
  }
}

// Gestion des notifications admin
const handleAdminNotification = (notification: any) => {
  if (notification.type === 'live_chat_request') {
    // Un client demande un chat en direct
    const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === notification.sessionId)
    
    if (sessionIndex >= 0) {
      // Mise à jour d'une session existante
      const session = { ...chatSessions.value[sessionIndex] }
      
      // Mettre à jour les infos client
      session.customerInfo = notification.customerInfo
      session.lastActivity = notification.timestamp
      session.unreadCount = (session.unreadCount || 0) + 1
      
      // Mettre à jour la session dans le tableau
      chatSessions.value.splice(sessionIndex, 1, session)
    } else {
      // Nouvelle session
      chatSessions.value.push({
        sessionId: notification.sessionId,
        customerInfo: notification.customerInfo,
        lastActivity: notification.timestamp,
        unreadCount: 1,
        messages: []
      })
    }
  }
}

// Envoyer un message en tant qu'admin
const sendAdminMessage = () => {
  if (!adminChatMessage.value.trim() || !wsConnection.value || 
      wsConnection.value.readyState !== WebSocket.OPEN || !selectedChatSession.value) {
    return
  }
  
  try {
    wsConnection.value.send(JSON.stringify({
      type: 'chat_message',
      payload: {
        sessionId: selectedChatSession.value,
        sender: 'admin',
        message: adminChatMessage.value.trim(),
        read: true
      }
    }))
    
    adminChatMessage.value = ''
  } catch (error) {
    console.error('Error sending admin message:', error)
  }
}

// Sélectionner une session de chat
const selectChatSession = (sessionId: string) => {
  selectedChatSession.value = sessionId
  
  // Marquer les messages comme lus
  const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === sessionId)
  if (sessionIndex >= 0) {
    const session = { ...chatSessions.value[sessionIndex] }
    session.unreadCount = 0
    chatSessions.value.splice(sessionIndex, 1, session)
  }
  
  // Informer le serveur que les messages ont été lus
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    wsConnection.value.send(JSON.stringify({
      type: 'mark_read',
      sessionId
    }))
  }
}

// Formatter la date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Assurer que la connexion websocket est fermée lors du démontage
onUnmounted(() => {
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    wsConnection.value.close()
  }
})

// Réagir aux changements de l'onglet actif
watch(activeTab, (newTab) => {
  if (newTab === 'chat' && !wsConnection.value) {
    setupWebSocketConnection()
  }
})
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