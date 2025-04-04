<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import NavBar from '../components/NavBar.vue'

export default defineComponent({
  name: 'BlogPostDetailPage',
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
    const post = ref(null)
    const loading = ref(true)
    const error = ref(null)
    
    const loadBlogPost = async () => {
      loading.value = true
      error.value = null
      
      try {
        const slug = props.slug || route.params.slug
        const response = await axios.get(`/blog-posts/${slug}`)
        post.value = response.data
      } catch (err) {
        console.error('Error loading blog post:', err)
        error.value = 'Impossible de charger l\'article'
      } finally {
        loading.value = false
      }
    }
    
    const goBack = () => {
      router.back()
    }
    
    onMounted(() => {
      loadBlogPost()
    })
    
    return {
      post,
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
        Retour au blog
      </button>
      
      <div v-if="loading" class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin text-4xl text-primary mb-4" />
        <p class="text-lg text-gray-600">Chargement de l'article...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      
      <article v-else-if="post" class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
        
        <div class="flex items-center text-gray-500 mb-8">
          <span class="mr-4">Par {{ post.author }}</span>
          <span class="mr-4">•</span>
          <span>{{ new Date(post.publishedAt || post.createdAt).toLocaleDateString() }}</span>
        </div>
        
        <div v-if="post.image" class="mb-8">
          <img 
            :src="post.image" 
            :alt="post.title" 
            class="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        
        <div class="prose prose-lg max-w-none">
          <!-- Note: Dans une implémentation complète, nous utiliserions un parser markdown ici -->
          <p>{{ post.content }}</p>
        </div>
        
        <div v-if="post.tags && post.tags.length > 0" class="mt-8">
          <h2 class="text-xl font-semibold mb-2">Tags</h2>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in post.tags" :key="tag" 
              class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {{ tag }}
            </span>
          </div>
        </div>
      </article>
      
      <div v-else class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-4xl text-yellow-500 mb-4" />
        <p class="text-lg text-gray-600">Article non trouvé</p>
      </div>
    </main>
  </div>
</template>
