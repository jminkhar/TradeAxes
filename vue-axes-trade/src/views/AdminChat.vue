<template>
  <div class="admin-chat mt-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Liste des sessions -->
      <div class="bg-white rounded-lg shadow-md md:col-span-1">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium">Sessions de chat</h3>
          <p class="text-sm text-gray-500">
            {{ wsConnected ? 'Connecté au service de chat en direct' : 'Déconnecté du service de chat' }}
          </p>
        </div>
        <div class="p-4">
          <div v-if="chatSessions.length === 0" class="text-center py-6 text-gray-500">
            Aucune session de chat active
          </div>
          <div v-else class="space-y-2 max-h-[500px] overflow-y-auto">
            <div 
              v-for="session in sortedChatSessions" 
              :key="session.sessionId"
              class="p-3 rounded-lg cursor-pointer"
              :class="{
                'bg-primary text-white': selectedChatSession === session.sessionId,
                'bg-gray-100 hover:bg-gray-200': selectedChatSession !== session.sessionId,
                'border-l-4 border-red-500': session.unreadCount > 0
              }"
              @click="selectChatSession(session.sessionId)"
            >
              <div class="flex justify-between items-start">
                <div class="font-medium flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  {{ session.customerInfo.name || 'Client' }}
                  <span v-if="session.unreadCount > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {{ session.unreadCount }}
                  </span>
                </div>
                <div class="text-xs opacity-80">
                  {{ formatDate(session.lastActivity) }}
                </div>
              </div>
              
              <div class="mt-1 text-sm">
                <div v-if="session.customerInfo.company" class="flex items-center mt-1">
                  <svg class="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  {{ session.customerInfo.company }}
                </div>
                
                <div v-if="session.customerInfo.service" class="flex items-center mt-1">
                  <svg class="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  {{ session.customerInfo.service }}
                </div>
                
                <div v-if="session.customerInfo.phone" class="flex items-center mt-1">
                  <svg class="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  {{ session.customerInfo.phone }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Conversation -->
      <div class="bg-white rounded-lg shadow-md md:col-span-2">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium">
            <span v-if="selectedChatSession">
              <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Conversation avec {{ currentSessionCustomerName }}
            </span>
            <span v-else>Sélectionnez une conversation</span>
          </h3>
          <p v-if="selectedChatSession" class="text-sm text-gray-500">
            Session ID: {{ selectedChatSession.substring(0, 8) }}...
          </p>
        </div>
        <div class="p-4">
          <div v-if="!selectedChatSession" class="flex flex-col items-center justify-center h-[500px] text-gray-400">
            <svg class="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p>Sélectionnez une session de chat à gauche pour voir les messages</p>
          </div>
          <template v-else>
            <div class="h-[500px] overflow-y-auto p-2 mb-4 space-y-4">
              <div 
                v-for="(msg, idx) in currentSessionMessages" 
                :key="idx"
                class="flex"
                :class="{ 'justify-end': msg.sender === 'admin', 'justify-start': msg.sender !== 'admin' }"
              >
                <div 
                  class="max-w-[80%] p-3 rounded-lg"
                  :class="{
                    'bg-primary text-white': msg.sender === 'admin',
                    'bg-gray-100': msg.sender === 'user',
                    'bg-gray-200': msg.sender === 'bot'
                  }"
                >
                  <div class="text-sm font-medium mb-1">
                    {{ msg.sender === 'admin' ? 'Admin' : msg.sender === 'bot' ? 'Bot' : 'Client' }}
                  </div>
                  <div class="break-words whitespace-pre-wrap">{{ msg.message }}</div>
                  <div class="text-xs opacity-70 text-right mt-1">
                    {{ formatDate(msg.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            
            <form @submit.prevent="sendAdminMessage" class="flex gap-2">
              <input 
                type="text" 
                v-model="adminChatMessage"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tapez votre message..."
              />
              <button 
                type="submit" 
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                :disabled="!wsConnected || !adminChatMessage.trim()"
              >
                <svg class="w-5 h-5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                Envoyer
              </button>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { adminWebSocket } from '../utils/websocket'
import websocketConfig from '../config/websocket'

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

// État du composant
const wsConnection = ref<WebSocket | null>(null)
const wsConnected = ref(false)
const chatSessions = ref<ChatSession[]>([])
const selectedChatSession = ref<string | null>(null)
const adminChatMessage = ref('')

// Computed
const sortedChatSessions = computed(() => {
  return [...chatSessions.value].sort((a, b) => {
    // Trier d'abord par nombre de messages non lus, puis par date d'activité
    if (a.unreadCount !== b.unreadCount) {
      return b.unreadCount - a.unreadCount
    }
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  })
})

const currentSessionMessages = computed(() => {
  if (!selectedChatSession.value) return []
  const session = chatSessions.value.find(s => s.sessionId === selectedChatSession.value)
  return session?.messages || []
})

const currentSessionCustomerName = computed(() => {
  if (!selectedChatSession.value) return ''
  const session = chatSessions.value.find(s => s.sessionId === selectedChatSession.value)
  return session?.customerInfo.name || 'Client'
})

// Méthodes
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
      
      // Demander les sessions actives
      adminWebSocket.send({
        type: 'admin_get_sessions'
      })
    })
    
    adminWebSocket.onMessage((data) => {
      if (data.type === 'chat_message') {
        // Ajouter le message à la session correspondante
        handleChatMessage(data.message)
      } else if (data.type === 'chat_sessions') {
        // Réception de toutes les sessions actives
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

const handleChatMessage = (message: ChatMessage) => {
  // Trouver la session correspondante
  const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === message.sessionId)
  
  if (sessionIndex >= 0) {
    // Mise à jour d'une session existante
    const updatedSessions = [...chatSessions.value]
    const session = {...updatedSessions[sessionIndex]}
    
    // Ajouter le message
    session.messages.push(message)
    session.lastActivity = message.timestamp
    
    // Mettre à jour le compteur de messages non lus si ce n'est pas la session actuellement sélectionnée
    if (selectedChatSession.value !== message.sessionId && message.sender === 'user') {
      session.unreadCount = (session.unreadCount || 0) + 1
    }
    
    // Mettre à jour la session dans le tableau
    updatedSessions[sessionIndex] = session
    chatSessions.value = updatedSessions
  } else if (message.sender === 'user') {
    // Nouvelle session
    chatSessions.value = [...chatSessions.value, {
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
    }]
  }
}

const handleAdminNotification = (notification: any) => {
  if (notification.type === 'live_chat_request') {
    // Un client demande un chat en direct
    const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === notification.sessionId)
    
    if (sessionIndex >= 0) {
      // Mise à jour d'une session existante
      const updatedSessions = [...chatSessions.value]
      const session = {...updatedSessions[sessionIndex]}
      
      // Mettre à jour les infos client
      session.customerInfo = notification.customerInfo
      session.lastActivity = notification.timestamp
      session.unreadCount = (session.unreadCount || 0) + 1
      
      // Mettre à jour la session dans le tableau
      updatedSessions[sessionIndex] = session
      chatSessions.value = updatedSessions
    } else {
      // Nouvelle session
      chatSessions.value = [...chatSessions.value, {
        sessionId: notification.sessionId,
        customerInfo: notification.customerInfo,
        lastActivity: notification.timestamp,
        unreadCount: 1,
        messages: []
      }]
    }
  }
}

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

const selectChatSession = (sessionId: string) => {
  selectedChatSession.value = sessionId
  
  // Marquer les messages comme lus
  const sessionIndex = chatSessions.value.findIndex(s => s.sessionId === sessionId)
  if (sessionIndex >= 0) {
    const updatedSessions = [...chatSessions.value]
    const session = {...updatedSessions[sessionIndex]}
    session.unreadCount = 0
    updatedSessions[sessionIndex] = session
    chatSessions.value = updatedSessions
  }
  
  // Informer le serveur que les messages ont été lus
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    wsConnection.value.send(JSON.stringify({
      type: 'mark_read',
      sessionId
    }))
  }
}

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

// Hooks de cycle de vie
onMounted(() => {
  setupWebSocketConnection()
})

onUnmounted(() => {
  if (wsConnection.value && wsConnection.value.readyState === WebSocket.OPEN) {
    wsConnection.value.close()
  }
})
</script>
