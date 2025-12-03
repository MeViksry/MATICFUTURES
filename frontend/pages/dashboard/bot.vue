<!-- frontend/pages/dashboard/bot.vue -->
<template>
  <div class="space-y-6 animate-in">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Bot Settings</h1>
        <p class="text-gray-500 mt-1">Configure your automated trading bot</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">Bot Status:</span>
        <button
          @click="toggleBot"
          :disabled="!authStore.isActive || isToggling"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="[
            botStore.isRunning ? 'bg-green-500' : 'bg-gray-400',
            (!authStore.isActive || isToggling) && 'opacity-50 cursor-not-allowed'
          ]"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="botStore.isRunning ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
        <span :class="botStore.isRunning ? 'text-green-500' : 'text-gray-500'">
          {{ botStore.isRunning ? 'Running' : 'Stopped' }}
        </span>
      </div>
    </div>

    <!-- Warning if not active -->
    <div v-if="!authStore.isActive" class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
      <p class="text-yellow-500">Your account must be activated by admin before you can enable the bot.</p>
    </div>

    <!-- Webhook Section -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">TradingView Webhook</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-2">Webhook URL</label>
          <div class="flex gap-2">
            <input
              :value="botStore.webhookUrl"
              readonly
              class="input-field flex-1 font-mono text-sm"
            />
            <button
              @click="copyWebhook"
              class="btn-secondary px-4"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button
              @click="regenerateWebhook"
              :disabled="isRegenerating"
              class="btn-secondary px-4"
            >
              <svg class="w-5 h-5" :class="{ 'animate-spin': isRegenerating }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-4 bg-gray-100 dark:bg-dark-700 rounded-xl">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">TradingView Alert Message Format</h4>
          <pre class="text-sm text-gray-600 dark:text-gray-400 overflow-x-auto">{{ webhookFormat }}</pre>
        </div>
      </div>
    </div>

    <!-- Settings Form -->
    <form @submit.prevent="saveSettings" class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Trading Settings</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Max Positions -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Open Positions
          </label>
          <input
            v-model.number="settings.maxPositions"
            type="number"
            min="1"
            max="20"
            class="input-field"
          />
        </div>

        <!-- Default Leverage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Leverage
          </label>
          <input
            v-model.number="settings.defaultLeverage"
            type="number"
            min="1"
            max="125"
            class="input-field"
          />
        </div>

        <!-- Max Leverage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Leverage
          </label>
          <input
            v-model.number="settings.maxLeverage"
            type="number"
            min="1"
            max="125"
            class="input-field"
          />
        </div>

        <!-- Risk Per Trade -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Per Trade (%)
          </label>
          <input
            v-model.number="settings.riskPerTrade"
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            class="input-field"
          />
        </div>

        <!-- Stop Loss -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Stop Loss (%)
          </label>
          <input
            v-model.number="settings.stopLossPercent"
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            class="input-field"
          />
        </div>

        <!-- Take Profit -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Take Profit (%)
          </label>
          <input
            v-model.number="settings.takeProfitPercent"
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            class="input-field"
          />
        </div>
      </div>

      <!-- Trailing Stop -->
      <div class="mt-6">
        <label class="flex items-center">
          <input
            v-model="settings.trailingStop"
            type="checkbox"
            class="w-4 h-4 rounded border-gray-600 bg-dark-700 text-primary-500"
          />
          <span class="ml-3 text-gray-700 dark:text-gray-300">Enable Trailing Stop</span>
        </label>
        
        <div v-if="settings.trailingStop" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trailing Stop (%)
          </label>
          <input
            v-model.number="settings.trailingStopPercent"
            type="number"
            min="0.1"
            max="50"
            step="0.1"
            class="input-field w-full md:w-1/2"
          />
        </div>
      </div>

      <!-- Allowed Symbols -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Allowed Symbols (leave empty for all)
        </label>
        <input
          v-model="allowedSymbolsInput"
          type="text"
          class="input-field"
          placeholder="BTCUSDT, ETHUSDT, SOLUSDT"
        />
        <p class="text-xs text-gray-500 mt-1">Comma-separated list of symbols</p>
      </div>

      <!-- Blacklisted Symbols -->
      <div class="mt-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Blacklisted Symbols
        </label>
        <input
          v-model="blacklistedSymbolsInput"
          type="text"
          class="input-field"
          placeholder="LUNAUSDT, USTUSDT"
        />
        <p class="text-xs text-gray-500 mt-1">Comma-separated list of symbols to ignore</p>
      </div>

      <!-- Save Button -->
      <div class="mt-8">
        <button
          type="submit"
          :disabled="isSaving"
          class="btn-primary"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>

    <!-- Webhook Logs -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Webhook Logs</h2>
      
      <div v-if="botStore.webhookLogs.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b border-gray-200 dark:border-dark-700">
              <th class="pb-3 font-medium">Time</th>
              <th class="pb-3 font-medium">Status</th>
              <th class="pb-3 font-medium">Action</th>
              <th class="pb-3 font-medium">Symbol</th>
              <th class="pb-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in botStore.webhookLogs.slice(0, 10)"
              :key="log.id"
              class="border-b border-gray-100 dark:border-dark-800"
            >
              <td class="py-3 text-gray-600 dark:text-gray-400">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="statusClasses[log.status]"
                >
                  {{ log.status }}
                </span>
              </td>
              <td class="py-3 text-gray-900 dark:text-white">
                {{ (log.payload as any)?.action || '-' }}
              </td>
              <td class="py-3 text-gray-900 dark:text-white">
                {{ (log.payload as any)?.symbol || '-' }}
              </td>
              <td class="py-3 text-gray-600 dark:text-gray-400">
                {{ log.errorMessage || 'Success' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-500">No webhook logs yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const botStore = useBotStore()
const toast = useCustomToast()

const isToggling = ref(false)
const isSaving = ref(false)
const isRegenerating = ref(false)

const settings = reactive({
  maxPositions: 5,
  defaultLeverage: 10,
  maxLeverage: 50,
  riskPerTrade: 2,
  stopLossPercent: 5,
  takeProfitPercent: 10,
  trailingStop: false,
  trailingStopPercent: 1
})

const allowedSymbolsInput = ref('')
const blacklistedSymbolsInput = ref('')

const webhookFormat = `{
  "action": "buy",
  "symbol": "BTCUSDT",
  "side": "long",
  "leverage": 10,
  "quantity": 0.01,
  "stopLoss": 45000,
  "takeProfit": 55000
}`

const statusClasses: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const toggleBot = async () => {
  if (!authStore.isActive) return
  
  isToggling.value = true
  try {
    await botStore.toggleBot(!botStore.isRunning)
    toast.success(
      botStore.isRunning ? 'Bot Started' : 'Bot Stopped',
      botStore.isRunning ? 'Your bot is now running' : 'Your bot has been stopped'
    )
  } catch (error: any) {
    toast.error('Error', error.message)
  } finally {
    isToggling.value = false
  }
}

const copyWebhook = async () => {
  try {
    await navigator.clipboard.writeText(botStore.webhookUrl)
    toast.success('Copied!', 'Webhook URL copied to clipboard')
  } catch (error) {
    toast.error('Error', 'Failed to copy')
  }
}

const regenerateWebhook = async () => {
  isRegenerating.value = true
  try {
    await botStore.regenerateWebhook()
    toast.success('Regenerated', 'New webhook URL generated')
  } catch (error: any) {
    toast.error('Error', error.message)
  } finally {
    isRegenerating.value = false
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    const allowedSymbols = allowedSymbolsInput.value
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0)

    const blacklistedSymbols = blacklistedSymbolsInput.value
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0)

    await botStore.updateSettings({
      ...settings,
      allowedSymbols,
      blacklistedSymbols
    })

    toast.success('Saved', 'Bot settings updated successfully')
  } catch (error: any) {
    toast.error('Error', error.message)
  } finally {
    isSaving.value = false
  }
}

// Load settings
onMounted(async () => {
  await Promise.all([
    botStore.fetchSettings(),
    botStore.fetchWebhook(),
    botStore.fetchWebhookLogs()
  ])

  if (botStore.settings) {
    Object.assign(settings, {
      maxPositions: botStore.settings.maxPositions,
      defaultLeverage: botStore.settings.defaultLeverage,
      maxLeverage: botStore.settings.maxLeverage,
      riskPerTrade: botStore.settings.riskPerTrade,
      stopLossPercent: botStore.settings.stopLossPercent,
      takeProfitPercent: botStore.settings.takeProfitPercent,
      trailingStop: botStore.settings.trailingStop,
      trailingStopPercent: botStore.settings.trailingStopPercent || 1
    })

    allowedSymbolsInput.value = botStore.settings.allowedSymbols?.join(', ') || ''
    blacklistedSymbolsInput.value = botStore.settings.blacklistedSymbols?.join(', ') || ''
  }
})
</script>