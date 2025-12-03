import { defineStore } from 'pinia'
import type { Portfolio, Position, TradeHistory, PerformanceMetrics } from '~/types'

interface PortfolioState {
  portfolio: Portfolio | null
  positions: Position[]
  history: TradeHistory[]
  metrics: PerformanceMetrics | null
  isLoading: boolean
}

export const usePortfolioStore = defineStore('portfolio', {
  state: (): PortfolioState => ({
    portfolio: null,
    positions: [],
    history: [],
    metrics: null,
    isLoading: false
  }),

  getters: {
    totalBalance: (state) => state.portfolio?.totalBalance ?? 0,
    unrealizedPnl: (state) => state.portfolio?.unrealizedPnl ?? 0,
    equity: (state) => state.portfolio?.equity ?? 0,
    openPositionsCount: (state) => state.positions.length,
    totalPnl: (state) => state.metrics?.totalPnl ?? 0,
    winRate: (state) => state.metrics?.winRate ?? 0
  },

  actions: {
    async fetchPortfolio() {
      const { get } = useApi()
      this.isLoading = true

      try {
        const response = await get<Portfolio>('/api/portfolio')
        if (response.success && response.data) {
          this.portfolio = response.data
          this.positions = response.data.positions || []
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHistory(params?: { page?: number; limit?: number }) {
      const { get } = useApi()

      try {
        const response = await get<TradeHistory[]>('/api/portfolio/history', params)
        if (response.success && response.data) {
          this.history = response.data
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      }
    },

    async fetchMetrics() {
      const { get } = useApi()

      try {
        const response = await get<PerformanceMetrics>('/api/portfolio/metrics')
        if (response.success && response.data) {
          this.metrics = response.data
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    },

    // TAMBAHKIN FUNCTION INI BRO
    async syncPortfolio() {
      const { post } = useApi()
      
      try {
        // Panggil API untuk sync dengan exchange
        const response = await post('/api/portfolio/sync')
        
        if (response.success) {
          // Setelah sync berhasil, fetch data terbaru
          await Promise.all([
            this.fetchPortfolio(),
            this.fetchHistory(),
            this.fetchMetrics()
          ])
        }
        
        return response
      } catch (error) {
        console.error('Failed to sync portfolio:', error)
        throw error
      }
    },

    updatePortfolio(data: Partial<Portfolio>) {
      if (this.portfolio) {
        this.portfolio = { ...this.portfolio, ...data }
      }
    },

    updatePosition(position: Position) {
      const index = this.positions.findIndex(p => p.id === position.id)
      if (index >= 0) {
        this.positions[index] = position
      } else {
        this.positions.push(position)
      }
    },

    removePosition(positionId: string) {
      this.positions = this.positions.filter(p => p.id !== positionId)
    }
  }
})