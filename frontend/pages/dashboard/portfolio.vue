<template>
  <div class="space-y-6 animate-in">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-50">Portfolio</h1>
        <p class="text-gray-500 mt-1">Your trading performance and positions</p>
      </div>
      <button 
        @click="syncPortfolio" 
        :disabled="isSyncing" 
        class="flex items-center justify-center px-6 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
      >
        <svg
          class="w-5 h-5 mr-2"
          :class="{ 'animate-spin': isSyncing }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        {{ isSyncing ? 'Syncing...' : 'Sync Portfolio' }}
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card p-4">
        <p class="text-sm text-gray-500">Total Balance</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          ${{ formatNumber(portfolioStore.totalBalance) }}
        </p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-500">Equity</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          ${{ formatNumber(portfolioStore.equity) }}
        </p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-500">Unrealized P&L</p>
        <p
          class="text-2xl font-bold"
          :class="portfolioStore.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'"
        >
          {{ portfolioStore.unrealizedPnl >= 0 ? '+' : '' }}${{ formatNumber(portfolioStore.unrealizedPnl) }}
        </p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-500">Win Rate</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ portfolioStore.winRate.toFixed(1) }}%
        </p>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div>
          <p class="text-sm text-gray-500">Total P&L</p>
          <p
            class="text-lg font-semibold"
            :class="(portfolioStore.metrics?.totalPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'"
          >
            ${{ formatNumber(portfolioStore.metrics?.totalPnl || 0) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Trades</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ portfolioStore.metrics?.totalTrades || 0 }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Profitable Trades</p>
          <p class="text-lg font-semibold text-green-500">
            {{ portfolioStore.metrics?.profitableTrades || 0 }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Profit Factor</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ (portfolioStore.metrics?.profitFactor || 0).toFixed(2) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Max Drawdown</p>
          <p class="text-lg font-semibold text-red-500">
            ${{ formatNumber(portfolioStore.metrics?.maxDrawdown || 0) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Avg Win</p>
          <p class="text-lg font-semibold text-green-500">
            ${{ formatNumber(portfolioStore.metrics?.averageWin || 0) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Open Positions -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Open Positions ({{ portfolioStore.positions.length }})
      </h2>
      
      <div v-if="portfolioStore.positions.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-dark-700">
              <th class="pb-3 font-medium">Symbol</th>
              <th class="pb-3 font-medium">Side</th>
              <th class="pb-3 font-medium">Size</th>
              <th class="pb-3 font-medium">Entry</th>
              <th class="pb-3 font-medium">Mark</th>
              <th class="pb-3 font-medium">P&L</th>
              <th class="pb-3 font-medium">Liq. Price</th>
              <th class="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="position in portfolioStore.positions"
              :key="position.id"
              class="border-b border-gray-100 dark:border-dark-800"
            >
              <td class="py-4 font-medium text-gray-900 dark:text-white">
                {{ position.symbol }}
              </td>
              <td class="py-4">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="position.side === 'long' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ position.side.toUpperCase() }} {{ position.leverage }}x
                </span>
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                {{ position.size }}
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                ${{ formatNumber(position.entryPrice) }}
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                ${{ formatNumber(position.markPrice) }}
              </td>
              <td class="py-4" :class="position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ position.unrealizedPnl >= 0 ? '+' : '' }}${{ formatNumber(position.unrealizedPnl) }}
                <span class="text-xs"> ({{ position.unrealizedPnlPercent.toFixed(2) }}%)</span>
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                ${{ formatNumber(position.liquidationPrice || 0) }}
              </td>
              <td class="py-4">
                <button
                  @click="closePosition(position)"
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
        <p class="text-gray-500">No open positions</p>
      </div>
    </div>

    <!-- Trade History -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trade History</h2>
      
      <div v-if="portfolioStore.history.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-dark-700">
              <th class="pb-3 font-medium">Date</th>
              <th class="pb-3 font-medium">Symbol</th>
              <th class="pb-3 font-medium">Side</th>
              <th class="pb-3 font-medium">Entry</th>
              <th class="pb-3 font-medium">Exit</th>
              <th class="pb-3 font-medium">P&L</th>
              <th class="pb-3 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trade in portfolioStore.history"
              :key="trade.id"
              class="border-b border-gray-100 dark:border-dark-800"
            >
              <td class="py-4 text-gray-600 dark:text-gray-400">
                {{ formatDate(trade.closedAt) }}
              </td>
              <td class="py-4 font-medium text-gray-900 dark:text-white">
                {{ trade.symbol }}
              </td>
              <td class="py-4">
                <span
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="trade.side === 'long'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                >
                  {{ trade.side.toUpperCase() }} {{ trade.leverage }}x
                </span>
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                ${{ formatNumber(trade.entryPrice) }}
              </td>
              <td class="py-4 text-gray-900 dark:text-white">
                ${{ formatNumber(trade.exitPrice) }}
              </td>
              <td class="py-4" :class="trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ trade.pnl >= 0 ? '+' : '' }}${{ formatNumber(trade.pnl) }}
                <span class="text-xs"> ({{ trade.pnlPercent.toFixed(2) }}%)</span>
              </td>
              <td class="py-4 text-gray-600 dark:text-gray-400">
                {{ formatDuration(trade.duration) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-12">
        <p class="text-gray-500">No trade history yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Position } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const portfolioStore = usePortfolioStore()
const toast = useCustomToast()

const isSyncing = ref(false)

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

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

const syncPortfolio = async () => {
  isSyncing.value = true
  try {
    await portfolioStore.syncPortfolio()
    toast.success('Synced', 'Portfolio data updated')
  } catch (error: any) {
    toast.error('Error', error.message)
  } finally {
    isSyncing.value = false
  }
}

const closePosition = async (position: Position) => {
  if (!confirm(`Are you sure you want to close ${position.symbol} position?`)) return

  try {
    const { post } = useApi()
    await post('/api/exchange/close-position', {
      symbol: position.symbol,
      positionId: position.id
    })
    toast.success('Position Closed', `${position.symbol} position has been closed`)
    await portfolioStore.fetchPortfolio()
  } catch (error: any) {
    toast.error('Error', error.message)
  }
}

// Load data
onMounted(async () => {
  await Promise.all([
    portfolioStore.fetchPortfolio(),
    portfolioStore.fetchHistory(),
    portfolioStore.fetchMetrics()
  ])
})
</script>