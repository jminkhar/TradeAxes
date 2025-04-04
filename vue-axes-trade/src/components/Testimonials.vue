<script setup lang="ts">
// Testimonials.vue
import { ref } from 'vue'

// Define testimonial data type
type Testimonial = {
  id: number;
  text: string;
  author: string;
  position: string;
  rating: number;
};

// Sample testimonials data
const testimonials = ref<Testimonial[]>([
  {
    id: 1,
    text: "Axes Trade a transformé notre système d'impression professionnel. Leur service client est exceptionnel et les imprimantes achetées sont d'une fiabilité remarquable.",
    author: "Marie Dupont",
    position: "Directrice des opérations, Design Studio",
    rating: 5
  },
  {
    id: 2,
    text: "En tant que bureau d'architecture, nous avions besoin d'imprimantes grand format très précises. Axes Trade nous a fourni exactement ce qu'il nous fallait avec un support technique continu.",
    author: "Jean Martin",
    position: "Architecte principal, ArchiFuture",
    rating: 5
  },
  {
    id: 3,
    text: "Nous utilisons les solutions d'impression d'Axes Trade depuis plus de 3 ans maintenant. Leur équipe est réactive et leurs produits sont parfaitement adaptés à nos besoins.",
    author: "Sophie Leblanc",
    position: "Responsable IT, Entreprise Média",
    rating: 4
  }
]);

// Generate star rating display
const getRatingStars = (rating: number) => {
  return Array(5)
    .fill(0)
    .map((_, i) => i < rating);
};
</script>

<template>
  <section id="testimonials" class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Ce que nos clients disent</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez pourquoi les entreprises de toutes tailles font confiance à Axes Trade pour leurs solutions d'impression.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="testimonial in testimonials" :key="testimonial.id" 
             class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div class="flex mb-4">
            <div v-for="(isFilled, index) in getRatingStars(testimonial.rating)" :key="index">
              <font-awesome-icon 
                :icon="['fas', 'star']" 
                class="text-yellow-400 mr-1" 
                v-if="isFilled" 
              />
              <font-awesome-icon 
                :icon="['fas', 'star']" 
                class="text-gray-300 mr-1" 
                v-else 
              />
            </div>
          </div>
          
          <p class="text-gray-700 italic mb-4">"{{ testimonial.text }}"</p>
          
          <div class="mt-auto">
            <p class="font-bold">{{ testimonial.author }}</p>
            <p class="text-gray-600 text-sm">{{ testimonial.position }}</p>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
          Voir tous les témoignages
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styling can be added here if needed */
</style>
