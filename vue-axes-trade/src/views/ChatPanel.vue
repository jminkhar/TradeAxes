<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-2xl font-bold mb-4">Chat en direct</h2>
    
    <div v-if="!wsConnected" class="text-center py-12">
      <div class="text-gray-500 mb-4">Connexion au service de chat en cours...</div>
      <button @click="setupWebSocketConnection" class="btn btn-primary">
        Reconnecter
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Liste des sessions -->
      <div class="border-r border-gray-200 pr-4">
        <h3 class="font-medium text-gray-900 mb-4">Conversations</h3>
        
        <div v-if="chatSessions.length === 0" class="text-gray-500 text-sm">
          Aucune conversation active pour le moment.
        </div>
        
        <div v-else class="space-y-2">
          <div 
            v-for="session in chatSessions" 
            :key="session.sessionId" 
            @click="selectChatSession(session.sessionId)" 
            class="p-3 rounded cursor-pointer"
            :class="selectedChatSession === session.sessionId ? 'bg-blue-50 border-blue-500'" 
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{{ session.customerInfo.name || 'Client'}}</div>
                <div class="text-sm text-gray-500">{{ session.customerInfo.company }}</div>
              </div>
              <div v-if="session.unreadCount" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {{ session.unreadCount }}
              </div>
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {{ formatDate(session.lastActivity) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Messages de la session sélectionnée -->
      <div class="col-span-2">
        <div v-if="!selectedChatSession" class="text-center py-12 text-gray-500">
          Sélectionnez une conversation pour afficher les messages.
        </div>
        
        <div v-else class="flex flex-col h-[60vh]">
          <!-- Infos client -->
          <div v-if="selectedSession" class="border-b border-gray-200 pb-3 mb-4">
            <h3 class="font-medium text-gray-900">{{ selectedSession.customerInfo.name || 'Client'}}</h3>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
              <div><span class="font-medium">Entreprise:</span> {{ selectedSession.customerInfo.company || 'Non spécifié'}}</div>
              <div><span class="font-medium">Service:</span> {{ selectedSession.customerInfo.service || 'Non spécifié'}}</div>
              <div><span class="font-medium">Téléphone:</span> {{ selectedSession.customerInfo.phone || 'Non spécifié'}}</div>
            </div>
          </div>
          
          <!-- Messages -->
          <div class="flex-grow overflow-y-auto px-2 space-y-4 mb-4">
            <template v-if="selectedSession && selectedSession.messages.length > 0">
              <div 
                v-for="message in selectedSession.messages" 
                :key="message.id" 
                class="max-w-[80%] p-3 rounded"
                :class="{
                  'bg-blue-50 ml-auto': message.sender === 'admin',
                  'bg-gray-100': message.sender === 'user',
                  'bg-yellow-50': message.sender === 'bot',
                }"
              >
                <div class="whitespace-pre-wrap">{{ message.message }}</div>
                <div class="text-xs text-right mt-1 text-gray-400">{{ formatDate(message.timestamp) }}</div>
              </div>
            </template>
            
            <div v-else class="text-center py-6 text-gray-500">
              Aucun message dans cette conversation.
            </div>
          </div>
          
          <!-- Formulaire d'envoi -->
          <div class="border-t border-gray-200 pt-4">
            <form @submit.prevent="sendAdminMessage" class="flex space-x-2">
              <input 
                v-model="adminChatMessage" 
                type="text" 
                class="form-input flex-grow" 
                placeholder="Écrivez votre message ici..."
              />
              <button type="submit" class="btn btn-primary">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
