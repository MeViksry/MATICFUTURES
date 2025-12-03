<!-- frontend/pages/dashboard/index.vue -->
<template>
  <div class="space-y-6 animate-in">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-500 mt-1">Welcome back, {{ authStore.user?.fullName }}</p>
      </div>
      
      <!-- Account Status -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Account Status:</span>
          <span :class="authStore.isActive ? 'status-active' : 'status-inactive'">
            {{ authStore.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Bot Status:</span>
          <span :class="botStore.isRunning ? 'status-active' : 'status-inactive'">
            {{ botStore.isRunning ? 'Running' : 'Stopped' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Warning if not active -->
    <div v-if="!authStore.isActive" class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-4">
      <svg class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <div>
        <h4 class="font-medium text-yellow-500">Account Not Activated</h4>
        <p class="text-sm text-gray-400 mt-1">
          Your account needs to be activated by admin before the bot can start trading. 
          Please contact support if you've completed payment.
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardStatCard
        title="Total Balance"
        :value="formatCurrency(portfolioStore.totalBalance)"
        icon="wallet"
        :trend="{ value: 12.5, isPositive: true }"
      />
      <DashboardStatCard
        title="Unrealized P&L"
        :value="formatCurrency(portfolioStore.unrealizedPnl)"
        :valueClass="portfolioStore.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'"
        icon="chart"
      />
      <DashboardStatCard
        title="Win Rate"
        :value="`${portfolioStore.winRate.toFixed(1)}%`"
        icon="trophy"
      />
      <DashboardStatCard
        title="Total Trades"
        :value="portfolioStore.metrics?.totalTrades.toString() || '0'"
        icon="activity"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Section -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">BTC/USDT Chart</h2>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold" :class="priceChangeClass">
                ${{ formatNumber(currentPrice) }}
              </span>
            </div>
          </div>
          <TradingChart :data="chartData" :height="400" />
        </div>
      </div>

      <!-- Portfolio Summary -->
      <div class="space-y-6">
        <!-- Portfolio Card -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Available</span>
              <span class="font-medium text-gray-900 dark:text-white">
                ${{ formatNumber(portfolioStore.portfolio?.availableBalance || 0) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Margin Used</span>
              <span class="font-medium text-gray-900 dark:text-white">
                ${{ formatNumber(portfolioStore.portfolio?.marginUsed || 0) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Equity</span>
              <span class="font-medium text-gray-900 dark:text-white">
                ${{ formatNumber(portfolioStore.equity) }}
              </span>
            </div>
            <hr class="border-gray-200 dark:border-dark-700" />
            <div class="flex justify-between">
              <span class="text-gray-500">Unrealized P&L</span>
              <span class="font-medium" :class="portfolioStore.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ portfolioStore.unrealizedPnl >= 0 ? '+' : '' }}${{ formatNumber(portfolioStore.unrealizedPnl) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button 
              @click="toggleBot"
              :disabled="!authStore.isActive"
              class="w-full py-3 rounded-xl font-medium transition-all"
              :class="[
                botStore.isRunning
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
                !authStore.isActive && 'opacity-50 cursor-not-allowed'
              ]"
            >
              {{ botStore.isRunning ? 'Stop Bot' : 'Start Bot' }}
            </button>
            <NuxtLink to="/dashboard/api-keys" class="block w-full py-3 rounded-xl font-medium text-center bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
              Manage API Keys
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Open Positions -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Open Positions</h2>
        <span class="text-sm text-gray-500">{{ portfolioStore.positions.length }} positions</span>
      </div>
      
      <div v-if="portfolioStore.positions.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-dark-700">
              <th class="pb-3 font-medium">Symbol</th>
              <th class="pb-3 font-medium">Side</th>
              <th class="pb-3 font-medium">Size</th>
              <th class="pb-3 font-medium">Entry Price</th>
              <th class="pb-3 font-medium">Mark Price</th>
              <th class="pb-3 font-medium">P&L</th>
              <th class="pb-3 font-medium">Leverage</th>
              <th class="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr 
              v-for="position in portfolioStore.positions" 
              :key="position.id"
              class="border-b border-gray-100 dark:border-dark-800"
            >
              <td class="py-4 font-medium text-gray-900 dark:text-white">{{ position.symbol }}</td>
              <td class="py-4">
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="position.side === 'long' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ position.side.toUpperCase() }}
                </span>
              </td>
              <td class="py-4 text-gray-900 dark:text-white">{{ position.size }}</td>
              <td class="py-4 text-gray-900 dark:text-white">${{ formatNumber(position.entryPrice) }}</td>
              <td class="py-4 text-gray-900 dark:text-white">${{ formatNumber(position.markPrice) }}</td>
              <td class="py-4" :class="position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ position.unrealizedPnl >= 0 ? '+' : '' }}${{ formatNumber(position.unrealizedPnl) }}
                <span class="text-xs ml-1">({{ position.unrealizedPnlPercent.toFixed(2) }}%)</span>
              </td>
              <td class="py-4 text-gray-900 dark:text-white">{{ position.leverage }}x</td>
              <td class="py-4">
                <button 
                  @click="closePosition(position.id)"
                  class="text-red-500 hover:text-red-400 text-sm font-medium"
                >
                  Close
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No Open Positions</h3>
        <p class="text-gray-500">Start trading to see your positions here</p>
      </div>
    </div>

    <!-- Recent Trades -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Trades</h2>
        <NuxtLink to="/dashboard/trading" class="text-primary-500 hover:text-primary-400 text-sm font-medium">
          View All
        </NuxtLink>
      </div>

      <div v-if="portfolioStore.history.length > 0" class="space-y-4">
        <div 
          v-for="trade in portfolioStore.history.slice(0, 5)" 
          :key="trade.id"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl"
        >
          <div class="flex items-center gap-4">
            <div 
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="trade.pnl >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'"
            >
              <svg 
                class="w-5 h-5" 
                :class="trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  :d="trade.pnl >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ trade.symbol }}</p>
              <p class="text-sm text-gray-500">
                {{ trade.side.toUpperCase() }} · {{ trade.leverage }}x · {{ formatDate(trade.closedAt) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p 
              class="font-medium"
              :class="trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ trade.pnl >= 0 ? '+' : '' }}${{ formatNumber(trade.pnl) }}
            </p>
            <p class="text-sm text-gray-500">{{ trade.pnlPercent.toFixed(2) }}%</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">No trading history yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const botStore = useBotStore()
const toast = useCustomToast()
const { connectBinance, connectOKX, connectBitget, price, chartData, disconnect } = useExchangeWebSocket()

const selectedExchange = ref('binance')
const currentPrice = ref(0)
const previousPrice = ref(0)

const priceChangeClass = computed(() => {
  if (currentPrice.value > previousPrice.value) return 'text-green-500'
  if (currentPrice.value < previousPrice.value) return 'text-red-500'
  return 'text-gray-900 dark:text-white'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toggleBot = async () => {
  try {
    await botStore.toggleBot(!botStore.isRunning)
    toast.success(
      botStore.isRunning ? 'Bot Started' : 'Bot Stopped',
      botStore.isRunning ? 'Your bot is now running' : 'Your bot has been stopped'
    )
  } catch (error: any) {
    toast.error('Error', error.message)
  }
}

const closePosition = async (positionId: string) => {
  // Implement close position logic
  toast.info('Closing position...', '')
}

// Watch price changes
watch(price, (newPrice) => {
  previousPrice.value = currentPrice.value
  currentPrice.value = newPrice
})

// Watch exchange selection
watch(selectedExchange, (exchange) => {
  disconnect()
  if (exchange === 'binance') {
    connectBinance('btcusdt')
  } else if (exchange === 'okx') {
    connectOKX('BTC-USDT-SWAP')
  } else if (exchange === 'bitget') {
    connectBitget('BTCUSDT_UMCBL')
  }
})

// Initialize
onMounted(async () => {
  await Promise.all([
    portfolioStore.fetchPortfolio(),
    portfolioStore.fetchHistory(),
    portfolioStore.fetchMetrics(),
    botStore.fetchSettings()
  ])

  connectBinance('btcusdt')
})

onUnmounted(() => {
  disconnect()
})
</script>