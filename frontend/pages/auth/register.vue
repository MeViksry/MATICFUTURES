<!-- frontend/pages/auth/register.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
    <p class="text-gray-400 text-center mb-8">Start your trading journey today</p>

    <!-- Progress Steps -->
    <div class="flex items-center justify-center mb-8">
      <div v-for="(stepItem, index) in steps" :key="index" class="flex items-center">
        <div 
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
          :class="[
            step > index + 1 ? 'bg-primary-500 text-white' :
            step === index + 1 ? 'bg-primary-500 text-white' :
            'bg-dark-700 text-gray-500'
          ]"
        >
          <svg v-if="step > index + 1" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="w-12 h-0.5 mx-2" :class="step > index + 1 ? 'bg-primary-500' : 'bg-dark-700'"></div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Step 1: Account Info -->
      <div v-show="step === 1" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            v-model="form.fullName"
            type="text"
            required
            class="input-field"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="input-field"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              class="input-field pr-12"
              placeholder="Create a password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
            </button>
          </div>
          <!-- Password Strength -->
          <div class="mt-2">
            <div class="flex gap-1">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full" :class="getPasswordStrengthColor(i)"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ passwordStrengthText }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="input-field"
            placeholder="Confirm your password"
          />
          <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-red-400 text-xs mt-1">
            Passwords do not match
          </p>
        </div>
      </div>

      <!-- Step 2: Personal Info -->
      <div v-show="step === 2" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
          <input
            v-model="form.phone"
            type="tel"
            required
            class="input-field"
            placeholder="+62 812 3456 7890"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Address</label>
          <textarea
            v-model="form.address"
            rows="3"
            class="input-field resize-none"
            placeholder="Enter your address"
          ></textarea>
        </div>
      </div>

      <!-- Step 3: Plan Selection -->
      <div v-show="step === 3" class="space-y-4">
        <div class="grid grid-cols-1 gap-4">
          <label
            v-for="plan in plans"
            :key="plan.id"
            class="relative cursor-pointer"
          >
            <input
              type="radio"
              v-model="form.plan"
              :value="plan.id"
              class="sr-only"
            />
            <div
              class="p-4 rounded-xl border-2 transition-all"
              :class="[
                form.plan === plan.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-dark-600 hover:border-dark-500'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-white">{{ plan.name }}</h4>
                  <p class="text-sm text-gray-400">{{ plan.description }}</p>
                </div>
                <div class="text-right">
                  <span class="text-2xl font-bold text-white">${{ plan.price }}</span>
                  <span class="text-gray-400">/{{ plan.period }}</span>
                </div>
              </div>
              <div v-if="plan.id === 'yearly'" class="mt-2">
                <span class="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                  Save 28%
                </span>
              </div>
            </div>
          </label>
        </div>

        <!-- Terms -->
        <label class="flex items-start mt-6">
          <input type="checkbox" v-model="form.acceptTerms" required class="w-4 h-4 mt-1 rounded border-gray-600 bg-dark-700 text-primary-500">
          <span class="ml-3 text-sm text-gray-400">
            I agree to the 
            <a href="#" class="text-primary-500 hover:underline">Terms of Service</a> 
            and 
            <a href="#" class="text-primary-500 hover:underline">Privacy Policy</a>
          </span>
        </label>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex gap-4">
        <button
          v-if="step > 1"
          type="button"
          @click="step--"
          class="flex-1 btn-secondary"
        >
          Back
        </button>
        <button
          v-if="step < 3"
          type="button"
          @click="nextStep"
          :disabled="!canProceed"
          class="flex-1 btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !canProceed }"
        >
          Continue
        </button>
        <button
          v-if="step === 3"
          type="submit"
          :disabled="isLoading || !form.acceptTerms"
          class="flex-1 btn-primary flex items-center justify-center"
          :class="{ 'opacity-50 cursor-not-allowed': !form.acceptTerms }"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
        </button>
      </div>
    </form>

    <!-- Login Link -->
    <p class="mt-8 text-center text-gray-400">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-primary-500 hover:text-primary-400 font-medium">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const authStore = useAuthStore()
const toast = useCustomToast()

const step = ref(1)
const steps = ['Account', 'Personal', 'Plan']
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  plan: (route.query.plan as string) || 'monthly',
  acceptTerms: false
})

const plans = [
  { id: 'monthly', name: 'Pro Monthly', description: 'Full access, billed monthly', price: 29, period: 'month' },
  { id: 'yearly', name: 'Pro Yearly', description: 'Full access, billed yearly', price: 249, period: 'year' }
]

const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  return form.password ? texts[passwordStrength.value] : 'Enter a password'
})

const getPasswordStrengthColor = (index: number) => {
  if (!form.password) return 'bg-dark-700'
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-primary-500']
  return index <= passwordStrength.value ? colors[passwordStrength.value - 1] || 'bg-dark-700' : 'bg-dark-700'
}

const canProceed = computed(() => {
  if (step.value === 1) {
    return form.fullName && form.email && form.password && form.confirmPassword && form.password === form.confirmPassword && passwordStrength.value >= 2
  }
  if (step.value === 2) {
    return form.phone
  }
  return true
})

const nextStep = () => {
  if (canProceed.value && step.value < 3) {
    step.value++
  }
}

const handleSubmit = async () => {
  if (!form.acceptTerms) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      address: form.address,
      plan: form.plan as 'monthly' | 'yearly'
    })

    toast.success('Account created!', 'Please check your email to verify your account')
    navigateTo('/auth/verify-email')
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>