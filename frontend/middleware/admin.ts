import { navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (process.client) {
    authStore.loadFromStorage()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN') {
    return navigateTo('/dashboard')
  }
})