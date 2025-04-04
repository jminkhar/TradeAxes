<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Ajouter les icônes à la bibliothèque
library.add(faBars, faXmark)

const route = useRoute()
const isMenuOpen = ref(false)

// Liste des liens de navigation
const navLinks = [
  { name: 'Accueil', path: '/' },
  { name: 'Produits', path: '/products' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/#contact' }
]

// Déterminer si un lien est actif
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo et nom de la marque -->
        <router-link to="/" class="flex items-center space-x-2">
          <div class="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <!-- Remplacer par logo réel -->
            <span class="text-lg font-bold">AT</span>
          </div>
          <div class="brand-name text-xl font-bold">
            <span class="axes">Axes</span><span class="trade">Trade</span>
          </div>
        </router-link>

        <!-- Navigation principale - visible sur écrans moyens et larges -->
        <nav class="hidden md:flex space-x-6">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path" 
            class="text-gray-700 hover:text-primary font-medium"
            :class="{ 'text-primary font-semibold': isActive(link.path) }"
          >
            {{ link.name }}
          </router-link>
        </nav>

        <!-- Bouton de menu mobile -->
        <button 
          class="md:hidden text-gray-700 hover:text-primary"
          @click="toggleMenu"
          aria-label="Menu principal"
        >
          <FontAwesomeIcon :icon="isMenuOpen ? 'xmark' : 'bars'" class="text-2xl" />
        </button>
      </div>

      <!-- Menu mobile - visible uniquement sur petit écran quand ouvert -->
      <div 
        v-if="isMenuOpen" 
        class="md:hidden mt-4 pb-2"
      >
        <div class="flex flex-col space-y-3">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path" 
            class="text-gray-700 hover:text-primary py-2 border-b border-gray-100"
            :class="{ 'text-primary font-semibold': isActive(link.path) }"
            @click="closeMenu"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>