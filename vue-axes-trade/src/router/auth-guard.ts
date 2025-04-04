import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  // Si l'utilisateur n'est pas encore vérifié, vérifier son statut d'authentification
  if (!authStore.isLoading && authStore.user === null) {
    await authStore.checkAuth()
  }
  
  // Si la route nécessite des droits admin et que l'utilisateur n'est pas admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  
  // Si la route nécessite l'authentification et que l'utilisateur n'est pas connecté
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  
  // Si l'utilisateur est déjà connecté et essaie d'accéder à la page de login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }
  
  next()
}
