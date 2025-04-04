<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faTwitter, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Ajouter les icônes à la bibliothèque
library.add(faFacebook, faTwitter, faLinkedin, faInstagram)

// Année courante pour le copyright
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-800 text-white pt-12 pb-6">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo et description -->
        <div class="md:col-span-1">
          <div class="brand-name text-xl font-bold mb-4">
            <span class="axes">Axes</span><span class="trade">Trade</span>
          </div>
          <p class="text-gray-300 mb-4">
            Spécialiste en solutions d'impression professionnelles et matériel bureautique de qualité.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-300 hover:text-white">
              <FontAwesomeIcon :icon="['fab', 'facebook']" class="text-xl" />
            </a>
            <a href="#" class="text-gray-300 hover:text-white">
              <FontAwesomeIcon :icon="['fab', 'twitter']" class="text-xl" />
            </a>
            <a href="#" class="text-gray-300 hover:text-white">
              <FontAwesomeIcon :icon="['fab', 'linkedin']" class="text-xl" />
            </a>
            <a href="#" class="text-gray-300 hover:text-white">
              <FontAwesomeIcon :icon="['fab', 'instagram']" class="text-xl" />
            </a>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="md:col-span-1">
          <h3 class="text-lg font-bold mb-4 text-white">Liens rapides</h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-gray-300 hover:text-white">Accueil</router-link></li>
            <li><router-link to="/products" class="text-gray-300 hover:text-white">Produits</router-link></li>
            <li><router-link to="/blog" class="text-gray-300 hover:text-white">Blog</router-link></li>
            <li><router-link to="/#contact" class="text-gray-300 hover:text-white">Contact</router-link></li>
          </ul>
        </div>

        <!-- Produits -->
        <div class="md:col-span-1">
          <h3 class="text-lg font-bold mb-4 text-white">Produits</h3>
          <ul class="space-y-2">
            <li><router-link to="/products?category=printers" class="text-gray-300 hover:text-white">Imprimantes</router-link></li>
            <li><router-link to="/products?category=scanners" class="text-gray-300 hover:text-white">Scanners</router-link></li>
            <li><router-link to="/products?category=mfp" class="text-gray-300 hover:text-white">Multifonctions</router-link></li>
            <li><router-link to="/products?category=accessories" class="text-gray-300 hover:text-white">Accessoires</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="md:col-span-1">
          <h3 class="text-lg font-bold mb-4 text-white">Contact</h3>
          <address class="not-italic text-gray-300">
            <p class="mb-2">123 Avenue des Imprimantes</p>
            <p class="mb-2">75000 Paris, France</p>
            <p class="mb-2">Téléphone: +33 1 23 45 67 89</p>
            <p class="mb-2">Email: contact@axestrade.com</p>
          </address>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
        <p>&copy; {{ currentYear }} AxesTrade. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>