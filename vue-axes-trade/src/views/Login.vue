<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const credentials = reactive({
  username: '',
  password: ''
})

const submitError = ref('')
const isSubmitting = ref(false)

// Si l'utilisateur est redirigé depuis une page protégée
const redirect = route.query.redirect as string | undefined

onMounted(async () => {
  // Vérifier si l'utilisateur est déjà connecté
  await authStore.checkAuth()
  if (authStore.isAuthenticated) {
    router.push(redirect || '/')
  }
})

const handleSubmit = async () => {
  if (!credentials.username || !credentials.password) {
    submitError.value = 'Veuillez remplir tous les champs.'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const success = await authStore.login(credentials)
    if (success) {
      router.push(redirect || '/')
    } else {
      submitError.value = authStore.error || 'Identifiants incorrects'
    }
  } catch (error) {
    submitError.value = 'Une erreur est survenue lors de la connexion'
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2 flex items-center justify-center">
          <span class="text-axes">Axes</span><span class="text-trade">Trade</span>
          <span class="ml-2 text-gray-700">Admin</span>
        </h1>
        <p class="text-gray-600">Connectez-vous pour accéder à l'administration</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            Nom d'utilisateur
          </label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div v-if="submitError" class="text-red-500 text-sm">
          {{ submitError }}
        </div>
        
        <button
          type="submit"
          class="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <router-link to="/" class="text-primary hover:underline text-sm">
          Retourner à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>
