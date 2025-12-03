<template>
  <div class="space-y-6 animate-in">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <p class="text-gray-500 mt-1">Manage your exchange API connections</p>
      </div>
      <button 
        @click="showAddModal = true" 
        class="flex items-center justify-center px-6 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-dark-700"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add API Key
      </button>
    </div>

    <!-- Security Notice -->
    <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
      <svg class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div>
        <h4 class="font-medium text-blue-500">Security Information</h4>
        <p class="text-sm text-gray-400 mt-1">
          Your API keys are encrypted with AES-256 and stored securely. 
          Only enable trading permissions, never enable withdrawal permissions.
        </p>
      </div>
    </div>

    <!-- API Keys List -->
    <div class="grid gap-6">
      <div v-if="exchangeStore.isLoading" class="card p-12 text-center">
        <svg class="animate-spin h-10 w-10 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-gray-500 mt-4">Loading API keys...</p>
      </div>

      <template v-else>
        <div v-for="apiKey in exchangeStore.apiKeys" :key="apiKey.id" class="card p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="getExchangeColor(apiKey.exchange)">
                <img :src="`public/images/${apiKey.exchange}.svg`" :alt="apiKey.exchange" class="w-8 h-8" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {{ apiKey.exchange }} Futures
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  API Key: {{ maskApiKey(apiKey.apiKey) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="apiKey.isValid ? 'status-active' : 'status-inactive'">
                {{ apiKey.isValid ? 'Valid' : 'Invalid' }}
              </span>
              <div class="relative" ref="menuRef">
                <button 
                  @click="toggleMenu(apiKey.id)"
                  class="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
                <Transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition duration-75 ease-in"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95"
                >
                  <div 
                    v-if="activeMenu === apiKey.id" 
                    class="absolute right-0 mt-2 w-48 card p-2 shadow-xl z-10"
                  >
                    <button
                      @click="validateApiKey(apiKey.id)"
                      class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Validate
                    </button>
                    <button
                      @click="toggleApiKeyStatus(apiKey)"
                      class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                      {{ apiKey.isActive ? 'Disable' : 'Enable' }}
                    </button>
                    <hr class="my-2 border-gray-200 dark:border-dark-700" />
                    <button
                      @click="confirmDelete(apiKey)"
                      class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Status</span>
              <p class="font-medium text-gray-900 dark:text-white mt-1">
                {{ apiKey.isActive ? 'Active' : 'Disabled' }}
              </p>
            </div>
            <div>
              <span class="text-gray-500">Last Validated</span>
              <p class="font-medium text-gray-900 dark:text-white mt-1">
                {{ apiKey.lastValidated ? formatDate(apiKey.lastValidated) : 'Never' }}
              </p>
            </div>
            <div>
              <span class="text-gray-500">Created</span>
              <p class="font-medium text-gray-900 dark:text-white mt-1">
                {{ formatDate(apiKey.createdAt) }}
              </p>
            </div>
            <div>
              <span class="text-gray-500">Exchange</span>
              <p class="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                {{ apiKey.exchange }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="exchangeStore.apiKeys.length === 0" class="card p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No API Keys</h3>
          <p class="text-gray-500 mb-4">Add your first API key to start trading</p>
          <button 
            @click="showAddModal = true" 
            class="flex items-center justify-center px-6 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-dark-700 mx-auto"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add API Key
          </button>
        </div>
      </template>
    </div>

    <!-- Add API Key Modal -->
    <Modal v-model="showAddModal" title="Add API Key">
      <form @submit.prevent="handleAddApiKey" class="space-y-6">
        <!-- Exchange Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">Select Exchange</label>
          <div class="grid grid-cols-3 gap-4">
            <label
              v-for="exchange in exchanges"
              :key="exchange.id"
              class="relative cursor-pointer"
            >
              <input
                type="radio"
                v-model="addForm.exchange"
                :value="exchange.id"
                class="sr-only"
              />
              <div
                class="p-4 rounded-xl border-2 text-center transition-all"
                :class="[
                  addForm.exchange === exchange.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500'
                ]"
              >
                <img :src="`public/images/${exchange.id}.svg`" :alt="exchange.name" class="w-10 h-10 mx-auto mb-2" />
                <span class="text-sm font-medium text-white">{{ exchange.name }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- API Key -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">API Key</label>
          <input
            v-model="addForm.apiKey"
            type="text"
            required
            class="input-field"
            placeholder="Enter your API key"
          />
        </div>

        <!-- Secret Key -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Secret Key</label>
          <input
            v-model="addForm.secretKey"
            type="password"
            required
            class="input-field"
            placeholder="Enter your secret key"
          />
        </div>

        <!-- Passphrase (OKX dan Bitget) -->
        <div v-if="addForm.exchange === 'okx' || addForm.exchange === 'bitget'">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Passphrase
            <span class="text-xs text-gray-500 ml-1">
              (required for {{ addForm.exchange.toUpperCase() }})
            </span>
          </label>
          <input
            v-model="addForm.passphrase"
            type="password"
            :required="addForm.exchange === 'okx' || addForm.exchange === 'bitget'"
            class="input-field"
            :placeholder="addForm.exchange === 'okx' ? 'Enter your OKX passphrase' : 'Enter your Bitget password'"
          />
        </div>

        <!-- Error -->
        <div v-if="addError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p class="text-red-400 text-sm">{{ addError }}</p>
        </div>

        <!-- Submit -->
        <div class="flex gap-4">
          <button type="button" @click="showAddModal = false" class="flex-1 btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="isAdding" class="flex-1 btn-primary">
            <svg v-if="isAdding" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isAdding ? 'Adding...' : 'Add API Key' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" title="Delete API Key">
      <div class="text-center">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Delete API Key?</h3>
        <p class="text-gray-400 mb-6">
          This will permanently delete your {{ selectedApiKey?.exchange }} API key. 
          This action cannot be undone.
        </p>
        <div class="flex gap-4">
          <button @click="showDeleteModal = false" class="flex-1 btn-secondary">
            Cancel
          </button>
          <button @click="handleDelete" :disabled="isDeleting" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { ApiKey } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const exchangeStore = useExchangeStore()
const toast = useCustomToast()

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const activeMenu = ref<string | null>(null)
const selectedApiKey = ref<ApiKey | null>(null)
const isAdding = ref(false)
const isDeleting = ref(false)
const addError = ref('')

const addForm = reactive({
  exchange: 'binance',
  apiKey: '',
  secretKey: '',
  passphrase: ''
})

const exchanges = [
  { id: 'binance', name: 'Binance' },
  { id: 'okx', name: 'OKX' },
  { id: 'bitget', name: 'Bitget' }
]

const getExchangeColor = (exchange: string) => {
  const colors: Record<string, string> = {
    binance: 'bg-yellow-500/10',
    okx: 'bg-black/10 dark:bg-white/10',
    bitget: 'bg-blue-500/10'
  }
  return colors[exchange] || 'bg-gray-100 dark:bg-dark-700'
}

const maskApiKey = (apiKey: string) => {
  if (apiKey.length <= 8) return '****'
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const validateApiKey = async (id: string) => {
  activeMenu.value = null
  try {
    await exchangeStore.validateApiKey(id)
    toast.success('Validation complete', 'API key has been validated')
  } catch (error: any) {
    toast.error('Validation failed', error.message)
  }
}

const toggleApiKeyStatus = async (apiKey: ApiKey) => {
  activeMenu.value = null
  try {
    await exchangeStore.toggleApiKey(apiKey.id, !apiKey.isActive)
    toast.success('Status updated', `API key has been ${apiKey.isActive ? 'disabled' : 'enabled'}`)
  } catch (error: any) {
    toast.error('Error', error.message)
  }
}

const confirmDelete = (apiKey: ApiKey) => {
  activeMenu.value = null
  selectedApiKey.value = apiKey
  showDeleteModal.value = true
}

const handleAddApiKey = async () => {
  isAdding.value = true
  addError.value = ''

  try {
    await exchangeStore.addApiKey({
      exchange: addForm.exchange,
      apiKey: addForm.apiKey,
      secretKey: addForm.secretKey,
      passphrase: (addForm.exchange === 'okx' || addForm.exchange === 'bitget') ? addForm.passphrase : undefined
    })
    
    showAddModal.value = false
    addForm.apiKey = ''
    addForm.secretKey = ''
    addForm.passphrase = ''
    toast.success('API Key added', 'Your API key has been added successfully')
  } catch (error: any) {
    addError.value = error.message || 'Failed to add API key'
  } finally {
    isAdding.value = false
  }
}

const handleDelete = async () => {
  if (!selectedApiKey.value) return
  
  isDeleting.value = true
  try {
    await exchangeStore.deleteApiKey(selectedApiKey.value.id)
    showDeleteModal.value = false
    toast.success('Deleted', 'API key has been deleted')
  } catch (error: any) {
    toast.error('Error', error.message)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  exchangeStore.fetchApiKeys()
})
</script>