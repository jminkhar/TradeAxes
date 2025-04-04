<script setup lang="ts">
import { ref, computed } from 'vue'
import BlogPostList from '@/components/BlogPostList.vue'
</script>

<template>
  <div class="py-12">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl md:text-4xl font-bold mb-8">Blog & Actualités</h1>
      
      <!-- Liste des articles de blog -->
      <BlogPostList :publishedOnly="true" />
    </div>
  </div>
</template>