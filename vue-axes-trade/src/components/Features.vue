<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPrint, faShieldHalved, faGears, faChartLine, faHeadset, faLeaf } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Ajouter les icônes à la bibliothèque
library.add(faPrint, faShieldHalved, faGears, faChartLine, faHeadset, faLeaf)

// Liste des fonctionnalités
const features = [
  {
    icon: 'print',
    title: 'Haute qualité d\'impression',
    description: 'Nos imprimantes offrent une qualité d\'impression exceptionnelle pour tous vos besoins professionnels.'
  },
  {
    icon: 'shield-halved',
    title: 'Garantie étendue',
    description: 'Tous nos produits sont couverts par une garantie de 3 ans, pour votre tranquillité d\'esprit.'
  },
  {
    icon: 'gears',
    title: 'Solutions personnalisées',
    description: 'Nous proposons des solutions sur mesure adaptées aux besoins spécifiques de votre entreprise.'
  },
  {
    icon: 'chart-line',
    title: 'Optimisation des coûts',
    description: 'Réduisez vos coûts d\'impression grâce à nos solutions économiques et écologiques.'
  },
  {
    icon: 'headset',
    title: 'Support technique dédié',
    description: 'Notre équipe de support est disponible pour vous assister et répondre à toutes vos questions.'
  },
  {
    icon: 'leaf',
    title: 'Eco-responsable',
    description: 'Nos produits sont conçus dans une démarche écologique, réduisant l\'impact environnemental.'
  }
]
</script>

<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold">Pourquoi choisir AxesTrade ?</h2>
        <p class="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Nous proposons des solutions d'impression professionnelles complètes, adaptées à vos besoins spécifiques.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index" 
          class="bg-gray-50 p-6 rounded-lg transition-transform hover:scale-105"
        >
          <div class="flex items-start">
            <div class="mr-4 bg-primary text-white p-3 rounded-lg">
              <FontAwesomeIcon :icon="feature.icon" class="text-xl" />
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>