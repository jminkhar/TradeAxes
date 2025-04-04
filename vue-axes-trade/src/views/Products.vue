<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ProductList from '@/components/ProductList.vue'

const route = useRoute()
const categoryFilter = computed(() => route.query.category?.toString() || '')
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold mb-8">Nos Produits</h1>
      
      <!-- Catégories -->
      <div class="mb-8">
        <h2 class="text-xl mb-4">Catégories</h2>
        <div class="flex flex-wrap gap-2">
          <router-link 
            to="/products" 
            class="px-4 py-2 rounded-full border" 
            :class="categoryFilter === '' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
          >
            Tous
          </router-link>
          <router-link 
            to="/products?category=printers" 
            class="px-4 py-2 rounded-full border" 
            :class="categoryFilter === 'printers' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
          >
            Imprimantes
          </router-link>
          <router-link 
            to="/products?category=scanners" 
            class="px-4 py-2 rounded-full border" 
            :class="categoryFilter === 'scanners' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
          >
            Scanners
          </router-link>
          <router-link 
            to="/products?category=mfp" 
            class="px-4 py-2 rounded-full border" 
            :class="categoryFilter === 'mfp' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
          >
            Multifonctions
          </router-link>
          <router-link 
            to="/products?category=accessories" 
            class="px-4 py-2 rounded-full border" 
            :class="categoryFilter === 'accessories' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'"
          >
            Accessoires
          </router-link>
        </div>
      </div>
      
      <!-- Liste des produits -->
      <ProductList :categoryFilter="categoryFilter" />
    </div>
  </div>
</template>