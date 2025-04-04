<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()

// Fonction pour suivre les visites de pages
onMounted(() => {
  // Tracking de page view pour l'analytics
  trackPageView(route.path)
})

// Enregistrer la vue de page dans l'analytics
const trackPageView = async (path: string) => {
  try {
    await fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <NavBar />
    <main class="flex-grow">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<style>
/* Les styles globaux sont gérés par Tailwind CSS et définis dans le fichier index.css */
</style>
