<script setup lang="ts">
import { reactive, ref } from 'vue'
import axios from 'axios'

interface ContactForm {
  name: string
  company: string
  email: string
  phone: string
  subject: string
  message: string
}

const form = reactive<ContactForm>({
  name: '',
  company: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')
const submitError = ref('')

const resetForm = () => {
  form.name = ''
  form.company = ''
  form.email = ''
  form.phone = ''
  form.subject = ''
  form.message = ''
}

const submitForm = async () => {
  isSubmitting.value = true
  submitStatus.value = 'idle'
  submitError.value = ''
  
  try {
    await axios.post('/api/contact', form)
    submitStatus.value = 'success'
    resetForm()
  } catch (error: any) {
    submitStatus.value = 'error'
    submitError.value = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
    
    // Remettre le formulaire à l'état initial après 5 secondes
    if (submitStatus.value === 'success') {
      setTimeout(() => {
        submitStatus.value = 'idle'
      }, 5000)
    }
  }
}
</script>

<template>
  <section id="contact" class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Contactez-nous</h2>
        <p class="text-gray-600 mb-6">
          Vous avez des questions sur nos produits ou services ? N'hésitez pas à nous contacter.
          Notre équipe sera ravie de vous aider !
        </p>
      </div>
      
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <!-- Message de succès -->
        <div v-if="submitStatus === 'success'" class="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          <p class="font-medium">Votre message a été envoyé avec succès !</p>
          <p>Nous vous contacterons dans les plus brefs délais.</p>
        </div>
        
        <!-- Formulaire -->
        <form v-show="submitStatus !== 'success'" @submit.prevent="submitForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
                Entreprise
              </label>
              <input
                id="company"
                v-model="form.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
              Sujet <span class="text-red-500">*</span>
            </label>
            <input
              id="subject"
              v-model="form.subject"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
              Message <span class="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <!-- Message d'erreur -->
          <div v-if="submitStatus === 'error'" class="p-4 bg-red-100 text-red-700 rounded-md">
            <p>{{ submitError }}</p>
          </div>
          
          <div class="flex justify-center">
            <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Envoi en cours...</span>
              <span v-else>Envoyer le message</span>
            </button>
          </div>
        </form>
      </div>
      
      <!-- Informations de contact -->
      <div class="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <h3 class="font-bold mb-2">Adresse</h3>
          <p class="text-gray-600">123 Rue du Commerce, 75000 Paris, France</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">
            <i class="fas fa-phone"></i>
          </div>
          <h3 class="font-bold mb-2">Téléphone</h3>
          <p class="text-gray-600">+33 1 23 45 67 89</p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <div class="text-primary text-3xl mb-4">
            <i class="fas fa-envelope"></i>
          </div>
          <h3 class="font-bold mb-2">Email</h3>
          <p class="text-gray-600">contact@axestrade.com</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.btn-primary {
  @apply px-6 py-3 bg-primary text-white rounded-md transition-colors font-medium;
  @apply hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed;
}
</style>
