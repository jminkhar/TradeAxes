<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Props
interface Props {
  featuredOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featuredOnly: false
})

// Types
interface Product {
  id: number
  name: string
  description: string
  image: string
  price: string
  badge?: {
    text: string
    color: string
  }
  categories: string[]
}

// État
const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Charger les produits au montage du composant
onMounted(async () => {
  await fetchProducts()
})

// Récupérer les produits depuis l'API
const fetchProducts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const url = props.featuredOnly 
      ? '/api/products?featured=true'
      : '/api/products'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits')
    }
    
    const data = await response.json()
    products.value = data
  } catch (err) {
    error.value = (err as Error).message
    console.error('Erreur:', err)
    
    // Produits de démonstration en attendant l'API
    products.value = [
      {
        id: 1,
        name: 'Imprimante LaserJet Pro',
        description: 'Imprimante laser professionnelle haute performance pour les entreprises.',
        image: '',
        price: '599 €',
        badge: {
          text: 'Populaire',
          color: 'bg-green-500'
        },
        categories: ['printers']
      },
      {
        id: 2,
        name: 'Scanner DocumentPro',
        description: 'Scanner professionnel haute résolution pour tous vos documents.',
        image: '',
        price: '349 €',
        categories: ['scanners']
      },
      {
        id: 3,
        name: 'MultiFunction Office 5000',
        description: 'Solution tout-en-un pour l\'impression, la numérisation et la copie.',
        image: '',
        price: '899 €',
        badge: {
          text: 'Nouveau',
          color: 'bg-blue-500'
        },
        categories: ['mfp']
      }
    ]
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold">Nos Produits</h2>
        <p class="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Découvrez notre gamme d'imprimantes et de solutions d'impression professionnelles.
        </p>
      </div>
      
      <!-- Chargement -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      
      <!-- Erreur -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>{{ error }}</p>
      </div>
      
      <!-- Liste de produits -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="card group"
        >
          <!-- Badge -->
          <div 
            v-if="product.badge" 
            class="absolute top-4 right-4 py-1 px-3 rounded-full text-xs font-bold text-white"
            :class="product.badge.color"
          >
            {{ product.badge.text }}
          </div>
          
          <!-- Image -->
          <div class="aspect-video bg-gray-200 relative">
            <div v-if="!product.image" class="absolute inset-0 flex items-center justify-center text-gray-500">
              Image du produit
            </div>
            <img 
              v-else 
              :src="product.image" 
              :alt="product.name" 
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Contenu -->
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <div class="text-xl font-bold text-primary">{{ product.price }}</div>
              <router-link :to="`/product/${product.id}`" class="btn btn-outline">
                Voir détails
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bouton "Voir tous les produits" -->
      <div v-if="featuredOnly" class="text-center mt-8">
        <router-link to="/products" class="btn btn-primary">
          Voir tous nos produits
        </router-link>
      </div>
    </div>
  </section>
</template>