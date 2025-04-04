<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import NavBar from '../components/NavBar.vue'

export default defineComponent({
  name: 'ProductDetailPage',
  components: {
    NavBar
  },
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const product = ref(null)
    const loading = ref(true)
    const error = ref(null)
    
    const loadProduct = async () => {
      loading.value = true
      error.value = null
      
      try {
        const slug = props.slug || route.params.slug
        const response = await axios.get(`/products/${slug}`)
        product.value = response.data
      } catch (err) {
        console.error('Error loading product:', err)
        error.value = 'Impossible de charger les détails du produit'
      } finally {
        loading.value = false
      }
    }
    
    const goBack = () => {
      router.back()
    }
    
    onMounted(() => {
      loadProduct()
    })
    
    return {
      product,
      loading,
      error,
      goBack
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-800">
    <NavBar />
    
    <main class="container mx-auto px-4 py-12">
      <button @click="goBack" class="flex items-center text-primary hover:text-primary-dark mb-8 transition-colors">
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
        Retour
      </button>
      
      <div v-if="loading" class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin text-4xl text-primary mb-4" />
        <p class="text-lg text-gray-600">Chargement du produit...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      
      <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="relative">
          <img 
            :src="product.image || 'https://via.placeholder.com/600x400?text=Image+non+disponible'" 
            :alt="product.name" 
            class="w-full rounded-lg shadow-md"
          />
          <div v-if="product.badge" 
            class="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
            {{ product.badge.text }}
          </div>
        </div>
        
        <div>
          <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
          
          <div v-if="product.price" class="text-2xl font-bold text-primary mb-6">
            {{ product.price }}
          </div>
          
          <div class="mb-6">
            <h2 class="text-xl font-semibold mb-2">Description</h2>
            <p class="text-gray-700">{{ product.description }}</p>
          </div>
          
          <div v-if="product.categories && product.categories.length > 0" class="mb-6">
            <h2 class="text-xl font-semibold mb-2">Catégories</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="category in product.categories" :key="category" 
                class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {{ category }}
              </span>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              class="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Demander un devis
            </button>
            <button 
              class="border border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Contacter un conseiller
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-4xl text-yellow-500 mb-4" />
        <p class="text-lg text-gray-600">Produit non trouvé</p>
      </div>
    </main>
  </div>
</template>
