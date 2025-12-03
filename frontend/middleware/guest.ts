import { useAuthStore } from '~/stores/auth'
import { navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  if (process.client) {
    authStore.loadFromStorage()
  }

  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})