<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isMenuOpen = ref(false)
const isScrolled = ref(false)

const isActive = (path: string) => route.path === path

// Vérifier si l'utilisateur fait défiler la page
const checkScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  checkScroll() // Vérifier l'état initial
  
  // Vérifier le statut d'authentification
  authStore.checkAuth()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  isMenuOpen.value = false
}
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" 
    :class="isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center text-2xl font-bold">
          <span class="text-axes">Axes</span><span class="text-trade">Trade</span>
        </router-link>
        
        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/" 
            class="nav-link" 
            :class="{ 'active': isActive('/') }"
          >
            Accueil
          </router-link>
          <router-link 
            to="/products" 
            class="nav-link" 
            :class="{ 'active': isActive('/products') }"
          >
            Produits
          </router-link>
          <router-link 
            to="/blog" 
            class="nav-link" 
            :class="{ 'active': isActive('/blog') }"
          >
            Blog
          </router-link>
          
          <!-- Lien conditionnel en fonction de l'état d'authentification -->
          <template v-if="authStore.isAuthenticated">
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="nav-link" 
              :class="{ 'active': isActive('/admin') }"
            >
              Administration
            </router-link>
            <button 
              @click="handleLogout" 
              class="btn-secondary"
            >
              Déconnexion
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              class="btn-primary"
            >
              Connexion
            </router-link>
          </template>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMenu" 
          class="md:hidden text-gray-800 focus:outline-none"
          aria-label="Menu"
        >
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div 
      v-if="isMenuOpen" 
      class="md:hidden bg-white absolute top-full left-0 w-full shadow-md py-4 px-4 transition-all duration-300"
    >
      <nav class="flex flex-col space-y-4">
        <router-link 
          to="/" 
          @click="isMenuOpen = false" 
          class="mobile-nav-link"
          :class="{ 'active': isActive('/') }"
        >
          Accueil
        </router-link>
        <router-link 
          to="/products" 
          @click="isMenuOpen = false" 
          class="mobile-nav-link"
          :class="{ 'active': isActive('/products') }"
        >
          Produits
        </router-link>
        <router-link 
          to="/blog" 
          @click="isMenuOpen = false" 
          class="mobile-nav-link"
          :class="{ 'active': isActive('/blog') }"
        >
          Blog
        </router-link>
        
        <!-- Lien conditionnel en fonction de l'état d'authentification -->
        <template v-if="authStore.isAuthenticated">
          <router-link 
            v-if="authStore.isAdmin" 
            to="/admin" 
            @click="isMenuOpen = false" 
            class="mobile-nav-link"
            :class="{ 'active': isActive('/admin') }"
          >
            Administration
          </router-link>
          <button 
            @click="handleLogout" 
            class="text-left mobile-nav-link text-red-600"
          >
            Déconnexion
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            @click="isMenuOpen = false" 
            class="mobile-nav-link text-primary font-medium"
          >
            Connexion
          </router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  @apply font-medium transition-colors duration-200;
  @apply hover:text-primary;
}

.nav-link.active {
  @apply text-primary;
}

.mobile-nav-link {
  @apply block py-2 px-4 transition-colors duration-200;
  @apply hover:bg-gray-100 rounded-md;
}

.mobile-nav-link.active {
  @apply bg-gray-100 text-primary;
}

.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-md transition-colors;
  @apply hover:bg-primary-dark;
}

.btn-secondary {
  @apply px-4 py-2 border border-primary text-primary rounded-md transition-colors;
  @apply hover:bg-primary hover:text-white;
}

.text-axes {
  @apply text-axes-red;
}

.text-trade {
  @apply text-trade-blue;
}
</style>
