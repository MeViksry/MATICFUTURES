<!-- frontend/pages/auth/forgot-password.vue -->
<template>
  <div>
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white">Forgot Password?</h2>
      <p class="text-gray-400 mt-2">No worries, we'll send you reset instructions.</p>
    </div>

    <form v-if="!sent" @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="input-field"
          placeholder="Enter your email"
        />
      </div>

      <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full btn-primary"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>

    <div v-else class="text-center">
      <div class="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Check your email</h3>
      <p class="text-gray-400 mb-6">We've sent a password reset link to {{ email }}</p>
      <button @click="sent = false" class="text-primary-500 hover:text-primary-400 font-medium">
        Didn't receive? Try again
      </button>
    </div>

    <NuxtLink to="/auth/login" class="flex items-center justify-center mt-8 text-gray-400 hover:text-white transition-colors">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back to login
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const sent = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await authStore.forgotPassword(email.value)
    sent.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset link'
  } finally {
    isLoading.value = false
  }
}
</script>