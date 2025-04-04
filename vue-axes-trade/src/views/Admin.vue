<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import ChatPanel from "./ChatPanel.vue"
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
const wsConnection = ref<WebSocket | null>(null)
const wsConnected = ref(false)
const chatSessions = ref<ChatSession[]>([])
const selectedChatSession = ref<string | null>(null)
const activeTab = ref('dashboard')
const adminChatMessage = ref('')

// Variables du formulaire de connexion
const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Propriété calculée pour obtenir la session sélectionnée
const selectedSession = computed(() => {
  return chatSessions.value.find(session => session.sessionId === selectedChatSession.value)
})

// Fonction de connexion
const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs'
    return
  }
  
  const success = await authStore.login({
    username: username.value,
    password: password.value
  })
  
  if (!success) {
    errorMessage.value = authStore.error || 'Erreur de connexion'
  }
}

// Changer d'onglet
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  
  // Si on passe à l'onglet de chat, établir la connexion WebSocket
  if (tab === 'chat' && !wsConnection.value) {
    setupWebSocketConnection()
  }
}

// Gestion des messages de chat
const handleChatMessage = (message: ChatMessage) => {
  const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === message.sessionId)
  
  if (sessionIndex >= 0) {
    // Mise à jour d'une session existante
    const session = { ...chatSessions.value[sessionIndex] }
    
    // Ajouter le message à la session
    session.messages = [...(session.messages || []), message]
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

// Import du gestionnaire WebSocket
import { adminWebSocket } from '../utils/websocket'

// Établir la connexion WebSocket
const setupWebSocketConnection = () => {
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    return
  }
  
  // Utiliser le gestionnaire WebSocket centralisé
  try {
    // Connexion au WebSocket via notre gestionnaire
    adminWebSocket.connect()
    
    // Configuration des gestionnaires d'événements
    adminWebSocket.onConnect(() => {
      wsConnected.value = true
      wsConnection.value = { 
        readyState: WebSocket.OPEN, 
        send: (data) => adminWebSocket.send(JSON.parse(data)),
        close: () => adminWebSocket.disconnect()
      } as any
      
      // S'identifier comme admin
      adminWebSocket.send({
        type: 'identify_client',
        clientType: 'admin',
        adminToken: 'authenticated_admin'
      })
      
      // Demander les sessions actives
      setTimeout(() => {
        console.log('Admin requesting chat sessions...')
        adminWebSocket.send({
          type: 'admin_get_sessions'
        })
      }, 1000)
    })
    
    adminWebSocket.onMessage((data) => {
      console.log('Admin received WebSocket message:', data.type)
      
      if (data.type === 'chat_message') {
        // Ajouter le message à la session correspondante
        handleChatMessage(data.message)
      } else if (data.type === 'chat_sessions') {
        // Réception de toutes les sessions actives
        console.log('Received chat sessions:', data.sessions.length)
        chatSessions.value = data.sessions
      } else if (data.type === 'admin_notification') {
        handleAdminNotification(data.notification)
      }
    })
    
    adminWebSocket.onError((error) => {
      console.error('Admin WebSocket error:', error)
      wsConnected.value = false
    })
    
    adminWebSocket.onClose(() => {
      console.log('Admin WebSocket connection closed')
      wsConnected.value = false
      wsConnection.value = null
    })
    
  } catch (error) {
    console.error('WebSocket connection error:', error)
    wsConnected.value = false
  }
}

// Fonction pour demander manuellement les sessions
const requestSessions = () => {
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    console.log('Manually requesting chat sessions...')
    wsConnection.value.send(JSON.stringify({
      type: 'admin_get_sessions'
    }))
  } else {
    console.error('WebSocket not connected. Cannot request sessions.')
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
// Ajouter le handler pour gérer le message du chat
const handleSendMessage = (message: string, sessionId: string) => {
  if (!wsConnection.value || wsConnection.value.readyState !== WebSocket.OPEN) {
    return
  }
  
  try {
    wsConnection.value.send(JSON.stringify({
      type: "chat_message",
      payload: {
        sessionId: sessionId,
        sender: "admin",
        message: message,
        read: true
      }
    }))
  } catch (error) {
    console.error("Error sending admin message:", error)
  }
}
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
      
      <div v-if="!authStore.isAuthenticated" class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
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
      
      <div v-else>
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
            <button 
              @click="setActiveTab('chat')" 
              class="py-4 px-2 border-b-2 font-medium text-sm"
              :class="activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              Chat en direct
            </button>
          </nav>
        </div>
        
        <div v-if="activeTab === 'dashboard'" class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold mb-4">Tableau de bord</h2>
          <p class="text-gray-600">
            Bienvenue dans l'interface d'administration du site AxesTrade.
          </p>
        </div>
        <div v-if="activeTab === 'chat'">
          <div class="bg-white rounded-lg shadow p-6 mb-4">
            <div class="flex justify-between items-center">
              <h3 class="font-medium">État de la connexion: 
                <span :class="wsConnected ? 'text-green-600' : 'text-red-600'">
                  {{ wsConnected ? 'Connecté' : 'Déconnecté' }}
                </span>
              </h3>
              <div class="space-x-2">
                <button @click="setupWebSocketConnection" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                  Reconnecter
                </button>
                <button @click="requestSessions" class="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                  Actualiser les sessions
                </button>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-500">
              Sessions actives: {{ chatSessions.length }}
            </div>
          </div>
          
          <ChatPanel 
            :chatSessions="chatSessions" 
            :selectedChatSession="selectedChatSession" 
            :wsConnected="wsConnected"
            @update:selectedChatSession="selectChatSession"
            @send-message="handleSendMessage"
            @refresh-connection="setupWebSocketConnection"
          />
        </div>
        
        <!-- Autres sections ici... -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm;
}

.btn {
  @apply px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}
</style>
