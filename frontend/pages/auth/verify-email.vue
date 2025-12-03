<!-- frontend/pages/auth/verify-email.vue -->
<template>
  <div class="text-center">
    <div class="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg class="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>

    <h2 class="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
    <p class="text-gray-400 mb-8">
      We've sent a verification code to your email. Please enter it below.
    </p>

    <form @submit.prevent="handleVerify" class="space-y-6">
      <!-- OTP Input -->
      <div class="flex justify-center gap-3">
        <input
          v-for="(_, index) in 6"
          :key="index"
          :ref="el => otpInputs[index] = el as HTMLInputElement"
          type="text"
          maxlength="1"
          class="w-12 h-14 text-center text-2xl font-bold input-field"
          @input="handleOtpInput(index, $event)"
          @keydown="handleOtpKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isLoading || otp.length !== 6"
        class="w-full btn-primary"
        :class="{ 'opacity-50 cursor-not-allowed': otp.length !== 6 }"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ isLoading ? 'Verifying...' : 'Verify Email' }}
      </button>

      <!-- Resend -->
      <p class="text-gray-400 text-sm">
        Didn't receive the code?
        <button
          type="button"
          @click="handleResend"
          :disabled="resendCooldown > 0"
          class="text-primary-500 hover:text-primary-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend' }}
        </button>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useCustomToast()

const otpInputs = ref<HTMLInputElement[]>([])
const otp = ref('')
const isLoading = ref(false)
const error = ref('')
const resendCooldown = ref(0)

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus()
  }

  updateOtp()
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpInputs.value[index]?.value && index > 0) {
    otpInputs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text').slice(0, 6)
  if (pastedData) {
    pastedData.split('').forEach((char, index) => {
      if (otpInputs.value[index]) {
        otpInputs.value[index].value = char
      }
    })
    updateOtp()
    otpInputs.value[Math.min(pastedData.length, 5)]?.focus()
  }
}

const updateOtp = () => {
  otp.value = otpInputs.value.map(input => input?.value || '').join('')
}

const handleVerify = async () => {
  if (otp.value.length !== 6) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.verifyEmail(otp.value)
    toast.success('Email verified!', 'Your account is now active')
    navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Verification failed'
  } finally {
    isLoading.value = false
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return

  try {
    // Call resend API
    toast.success('Code sent!', 'Check your email')
    resendCooldown.value = 60

    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  } catch (err: any) {
    toast.error('Failed to resend', err.message)
  }
}
</script>