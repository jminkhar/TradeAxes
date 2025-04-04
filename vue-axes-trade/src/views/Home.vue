<script setup lang="ts">
import Hero from '@/components/Hero.vue'
import Features from '@/components/Features.vue'
import Products from '@/components/Products.vue'
import Testimonials from '@/components/Testimonials.vue'
import Contact from '@/components/Contact.vue'
</script>

<template>
  <div>
    <Hero />
    <Features />
    <Products :featuredOnly="true" />
    <Testimonials />
    <Contact />
  </div>
</template>