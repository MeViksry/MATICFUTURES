<!-- frontend/pages/dashboard/trading.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Trading Dashboard</h1>
        <p class="text-gray-600 dark:text-gray-400">Monitor and execute trades across exchanges</p>
      </div>

      <!-- API Key Status Alert -->
      <div v-if="!exchangeStore.hasValidApiKey" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p class="text-red-500 font-medium">No Valid API Key Found</p>
            <p class="text-red-400 text-sm mt-1">
              Please add and validate an API key in the 
              <NuxtLink to="/dashboard/api-keys" class="underline hover:no-underline">API Keys</NuxtLink> 
              section to start trading.
            </p>
          </div>
        </div>
      </div>

      <!-- Bot Status & Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <!-- Bot Status Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Trading Bot</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ botStatus.isRunning ? 'Running' : 'Stopped' }}
              </p>
            </div>
            <button
              @click="toggleBot"
              :disabled="!exchangeStore.hasValidApiKey || botStore.isLoading"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                botStatus.isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white',
                (!exchangeStore.hasValidApiKey || botStore.isLoading) && 'opacity-50 cursor-not-allowed'
              ]"
            >
              {{ botStore.isLoading ? '...' : botStatus.isRunning ? 'Stop Bot' : 'Start Bot' }}
            </button>
          </div>
          <div class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">API Key:</span>
              <span :class="exchangeStore.hasValidApiKey ? 'text-green-500' : 'text-red-500'">
                {{ exchangeStore.hasValidApiKey ? 'Valid' : 'Invalid' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Active Exchange:</span>
              <span class="text-gray-900 dark:text-white capitalize">
                {{ activeExchange || 'None' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Open Positions:</span>
              <span class="text-gray-900 dark:text-white">{{ botStatus.openPositions }}</span>
            </div>
          </div>
        </div>

        <!-- Balance Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Balance</h3>
          <div v-if="balance && exchangeStore.hasValidApiKey" class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total:</span>
              <span class="text-green-500 font-medium">${{ balance.totalBalance?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Available:</span>
              <span class="text-blue-500 font-medium">${{ balance.availableBalance?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Unrealized P&L:</span>
              <span :class="(balance.unrealizedPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'">
                ${{ (balance.unrealizedPnl || 0).toFixed(2) }}
              </span>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400 text-sm">
            {{ exchangeStore.hasValidApiKey ? 'Loading...' : 'Add API key to view balance' }}
          </div>
        </div>

        <!-- Price Ticker -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Current Price</h3>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            ${{ wsData.price.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            BTC/USDT
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink 
              to="/dashboard/api-keys"
              class="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              Manage API Keys
            </NuxtLink>
            <button
              @click="refreshAllData"
              :disabled="isRefreshing"
              class="w-full flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Chart & Trading Panel -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Trading Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">BTC/USDT Chart</h3>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-600 dark:text-gray-400">Connection:</span>
                <span :class="wsData.isConnected ? 'text-green-500' : 'text-red-500'">
                  {{ wsData.isConnected ? 'Live' : 'Disconnected' }}
                </span>
              </div>
            </div>
            <div class="p-4">
              <TradingChart 
                :data="wsData.chartData" 
                :height="400"
              />
            </div>
          </div>

          <!-- Trading Panel -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow" :class="{ 'opacity-50': !exchangeStore.hasValidApiKey }">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Trade</h3>
            </div>
            <div class="p-4">
              <form @submit.prevent="createOrder" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Side
                    </label>
                    <select 
                      v-model="orderForm.side"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="buy">Buy/Long</option>
                      <option value="sell">Sell/Short</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select 
                      v-model="orderForm.type"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      v-model.number="orderForm.quantity"
                      type="number"
                      step="0.001"
                      min="0.001"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="0.001"
                    />
                  </div>
                  <div v-if="orderForm.type === 'limit'">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <input
                      v-model.number="orderForm.price"
                      type="number"
                      step="0.01"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="Enter price"
                    />
                  </div>
                  <div v-else>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Leverage
                    </label>
                    <input
                      v-model.number="orderForm.leverage"
                      type="number"
                      min="1"
                      max="100"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stop Loss
                    </label>
                    <input
                      v-model.number="orderForm.stopLoss"
                      type="number"
                      step="0.01"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Take Profit
                    </label>
                    <input
                      v-model.number="orderForm.takeProfit"
                      type="number"
                      step="0.01"
                      :disabled="!exchangeStore.hasValidApiKey"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="!canPlaceOrder || isPlacingOrder || !exchangeStore.hasValidApiKey"
                  :class="[
                    'w-full py-3 px-4 rounded-lg font-semibold transition-colors',
                    orderForm.side === 'buy' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white',
                    (!canPlaceOrder || isPlacingOrder || !exchangeStore.hasValidApiKey) && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  {{ isPlacingOrder ? 'Placing Order...' : `Place ${orderForm.side.toUpperCase()} Order` }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Positions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Open Positions</h3>
              <span class="text-sm text-gray-500">{{ positions.length }}</span>
            </div>
            <div class="p-4">
              <div v-if="positions.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
                No open positions
              </div>
              <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                <div 
                  v-for="position in positions" 
                  :key="position.id"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">{{ position.symbol }}</span>
                    <span :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      position.side === 'long' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    ]">
                      {{ position.side }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Size:</span>
                      <span class="text-gray-900 dark:text-white ml-1">{{ position.size }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Entry:</span>
                      <span class="text-gray-900 dark:text-white ml-1">${{ position.entryPrice?.toFixed(2) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">P&L:</span>
                      <span :class="[
                        'ml-1 font-medium',
                        (position.unrealizedPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                      ]">
                        ${{ (position.unrealizedPnl || 0).toFixed(2) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Leverage:</span>
                      <span class="text-gray-900 dark:text-white ml-1">{{ position.leverage }}x</span>
                    </div>
                  </div>
                  <button
                    @click="closePosition(position.symbol)"
                    :disabled="!exchangeStore.hasValidApiKey"
                    class="w-full mt-2 py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Close Position
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Open Orders -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Open Orders</h3>
              <span class="text-sm text-gray-500">{{ orders.length }}</span>
            </div>
            <div class="p-4">
              <div v-if="orders.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
                No open orders
              </div>
              <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                <div 
                  v-for="order in orders" 
                  :key="order.id"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">{{ order.symbol }}</span>
                    <span :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      order.side === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    ]">
                      {{ order.side }} {{ order.type }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Qty:</span>
                      <span class="text-gray-900 dark:text-white ml-1">{{ order.quantity }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Price:</span>
                      <span class="text-gray-900 dark:text-white ml-1" v-if="order.price">
                        ${{ order.price.toFixed(2) }}
                      </span>
                      <span v-else class="text-gray-400">Market</span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Filled:</span>
                      <span class="text-gray-900 dark:text-white ml-1">{{ order.filledQuantity || 0 }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">Leverage:</span>
                      <span class="text-gray-900 dark:text-white ml-1">{{ order.leverage }}x</span>
                    </div>
                  </div>
                  <button
                    @click="cancelOrder(order.id)"
                    :disabled="!exchangeStore.hasValidApiKey"
                    class="w-full mt-2 py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Position, Order } from '~/types'

// Stores
const exchangeStore = useExchangeStore()
const botStore = useBotStore()

// Composables
const { post, get } = useApi()
const { price, chartData, isConnected, connectBinance, disconnect } = useExchangeWebSocket()

// Reactive data
const balance = ref<any>(null)
const positions = ref<Position[]>([])
const orders = ref<Order[]>([])
const botStatus = ref({
  isRunning: false,
  hasValidApiKey: false,
  openPositions: 0
})
const isPlacingOrder = ref(false)
const isRefreshing = ref(false)

// Order form
const orderForm = reactive({
  symbol: 'BTCUSDT',
  side: 'buy' as 'buy' | 'sell',
  type: 'market' as 'market' | 'limit',
  quantity: 0.001,
  price: undefined as number | undefined,
  leverage: 10,
  stopLoss: undefined as number | undefined,
  takeProfit: undefined as number | undefined
})

// Computed
const canPlaceOrder = computed(() => {
  return orderForm.quantity > 0 && 
         exchangeStore.hasValidApiKey &&
         (!orderForm.price || orderForm.price > 0)
})

const activeExchange = computed(() => {
  const activeKey = exchangeStore.activeApiKey
  return activeKey ? activeKey.exchange : null
})

const wsData = computed(() => ({
  price: price.value || 0,
  chartData: chartData.value,
  isConnected: isConnected.value
}))

// Methods
const fetchTradingData = async () => {
  if (!exchangeStore.hasValidApiKey) return

  try {
    const [balanceRes, positionsRes, ordersRes, statusRes] = await Promise.all([
      get('/api/exchange/balance'),
      get('/api/exchange/positions'),
      get('/api/exchange/orders'),
      get('/api/bot/status')
    ])

    if (balanceRes.success) balance.value = balanceRes.data
    if (positionsRes.success) positions.value = positionsRes.data || []
    if (ordersRes.success) orders.value = ordersRes.data || []
    if (statusRes.success) botStatus.value = statusRes.data
  } catch (error) {
    console.error('Failed to fetch trading data:', error)
  }
}

const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      exchangeStore.fetchApiKeys(),
      fetchTradingData()
    ])
    useToast().success('Data refreshed successfully')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    isRefreshing.value = false
  }
}

const createOrder = async () => {
  if (!canPlaceOrder.value) return

  isPlacingOrder.value = true
  try {
    const response = await post('/api/exchange/order', orderForm)
    if (response.success) {
      useToast().success('Order placed successfully')
      // Reset form
      Object.assign(orderForm, {
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        quantity: 0.001,
        price: undefined,
        leverage: 10,
        stopLoss: undefined,
        takeProfit: undefined
      })
      // Refresh data
      await fetchTradingData()
    } else {
      useToast().error(response.message || 'Failed to place order')
    }
  } catch (error: any) {
    useToast().error(error.message || 'Failed to place order')
  } finally {
    isPlacingOrder.value = false
  }
}

const cancelOrder = async (orderId: string) => {
  try {
    const response = await post(`/api/exchange/order/${orderId}/cancel`)
    if (response.success) {
      useToast().success('Order cancelled successfully')
      await fetchTradingData()
    } else {
      useToast().error(response.message || 'Failed to cancel order')
    }
  } catch (error: any) {
    useToast().error(error.message || 'Failed to cancel order')
  }
}

const closePosition = async (symbol: string) => {
  try {
    const response = await post('/api/exchange/close-position', { symbol })
    if (response.success) {
      useToast().success('Position closed successfully')
      await fetchTradingData()
    } else {
      useToast().error(response.message || 'Failed to close position')
    }
  } catch (error: any) {
    useToast().error(error.message || 'Failed to close position')
  }
}

const toggleBot = async () => {
  try {
    const enabled = !botStatus.value.isRunning
    const response = await botStore.toggleBot(enabled)
    if (response.success) {
      useToast().success(`Bot ${enabled ? 'started' : 'stopped'} successfully`)
      await fetchTradingData()
    } else {
      useToast().error(response.message || `Failed to ${enabled ? 'start' : 'stop'} bot`)
    }
  } catch (error: any) {
    useToast().error(error.message || 'Failed to toggle bot')
  }
}

// Lifecycle
onMounted(async () => {
  await exchangeStore.fetchApiKeys()
  await fetchTradingData()
  
  // Connect to WebSocket
  connectBinance('btcusdt')
})

onUnmounted(() => {
  disconnect()
})

// Watch for API key changes
watch(() => exchangeStore.hasValidApiKey, (hasValid) => {
  if (hasValid) {
    fetchTradingData()
  } else {
    // Clear data when no valid API key
    balance.value = null
    positions.value = []
    orders.value = []
  }
})

// Auto-refresh data every 30 seconds when has valid API key
const { pause, resume } = useIntervalFn(() => {
  if (exchangeStore.hasValidApiKey) {
    fetchTradingData()
  }
}, 30000)

// Pause when tab is not visible
const visibility = useDocumentVisibility()
watch(visibility, (visible) => {
  if (visible === 'visible' && exchangeStore.hasValidApiKey) {
    resume()
    fetchTradingData()
  } else {
    pause()
  }
})
</script>