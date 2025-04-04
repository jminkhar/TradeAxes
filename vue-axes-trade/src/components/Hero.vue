<script setup lang="ts">
// Aucune logique spécifique n'est nécessaire pour le composant Hero
</script>

<template>
  <section class="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-gray-50 to-gray-100">
    <div class="container mx-auto px-4">
      <div class="flex flex-col lg:flex-row items-center">
        <div class="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Solutions d'impression professionnelles
          </h1>
          <p class="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
            <span class="brand-name"><span class="text-axes font-bold">Axes</span><span class="text-trade font-bold">Trade</span></span> vous propose une gamme complète d'imprimantes et de solutions d'impression pour répondre à tous vos besoins professionnels.
          </p>
          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <router-link to="/products" class="btn btn-primary">
              Découvrir nos produits
            </router-link>
            <router-link to="/#contact" class="btn btn-outline">
              Nous contacter
            </router-link>
          </div>
        </div>
        <div class="lg:w-1/2">
          <div class="relative">
            <!-- Placeholder pour image d'imprimante -->
            <div class="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <div class="text-gray-500 text-xl">Image d'imprimante professionnelle</div>
            </div>
            <!-- Badges flottants -->
            <div class="absolute -top-4 -right-4 bg-secondary text-white px-4 py-2 rounded-full font-bold">
              Nouveauté
            </div>
            <div class="absolute bottom-4 -left-4 bg-primary text-white p-3 rounded-lg shadow-lg">
              <div class="text-sm">Garantie</div>
              <div class="text-xl font-bold">3 ans</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>