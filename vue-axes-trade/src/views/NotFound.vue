<script setup lang="ts">
// Page 404 - Aucune logique spécifique n'est nécessaire
</script>

<template>
  <div class="py-20 px-4 flex flex-col items-center justify-center min-h-[70vh]">
    <div class="text-9xl font-bold text-primary mb-4">404</div>
    <h1 class="text-4xl font-bold mb-6">Page introuvable</h1>
    <p class="text-lg text-gray-600 mb-8 text-center max-w-lg">
      La page que vous recherchez n'existe pas ou a été déplacée.
    </p>
    <router-link to="/" class="btn btn-primary">
      Retour à l'accueil
    </router-link>
  </div>
</template>