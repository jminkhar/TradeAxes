import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import Blog from '../views/Blog.vue'
import Admin from '../views/Admin.vue'
import Login from '../views/Login.vue'
import NotFound from '../views/NotFound.vue'
import { authGuard } from './auth-guard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/products',
      name: 'products',
      component: Products
    },
    {
      path: '/product/:slug',
      name: 'product-detail',
      component: () => import('../views/ProductDetail.vue')
    },
    {
      path: '/blog',
      name: 'blog',
      component: Blog
    },
    {
      path: '/blog/:slug',
      name: 'blog-post-detail',
      component: () => import('../views/BlogPostDetail.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ],
  // Comportement du défilement lors de la navigation
  scrollBehavior(to, from, savedPosition) {
    // Si l'utilisateur utilise le bouton retour/avant du navigateur
    if (savedPosition) {
      return savedPosition
    }
    
    // Si la route contient un hash (ancre)
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    
    // Sinon, remonter en haut de la page
    return { top: 0, behavior: 'smooth' }
  }
})

// Appliquer le garde d'authentification à chaque navigation
router.beforeEach(authGuard)

export default router