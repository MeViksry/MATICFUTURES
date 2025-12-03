import { defineStore } from 'pinia'
import type { ApiKey } from '~/types'

interface ExchangeState {
  apiKeys: ApiKey[]
  selectedExchange: 'binance' | 'okx' | 'bitget' | null
  isLoading: boolean
}

export const useExchangeStore = defineStore('exchange', {
  state: (): ExchangeState => ({
    apiKeys: [],
    selectedExchange: null,
    isLoading: false
  }),

  getters: {
    activeApiKey: (state) => {
      return state.apiKeys.find(k => k.isActive && k.isValid)
    },
    hasValidApiKey: (state) => {
      return state.apiKeys.some(k => k.isActive && k.isValid)
    },
    getApiKeyByExchange: (state) => (exchange: string) => {
      return state.apiKeys.find(k => k.exchange === exchange)
    }
  },

  actions: {
    async fetchApiKeys() {
      const { get } = useApi()
      this.isLoading = true

      try {
        const response = await get<ApiKey[]>('/api/exchange/api-keys')
        if (response.success && response.data) {
          this.apiKeys = response.data
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addApiKey(data: {
      exchange: string
      apiKey: string
      secretKey: string
      passphrase?: string
    }) {
      const { post } = useApi()

      try {
        const response = await post<ApiKey>('/api/exchange/api-keys', data)
        if (response.success && response.data) {
          this.apiKeys.push(response.data)
          return response
        }
        throw new Error(response.message)
      } catch (error) {
        throw error
      }
    },

    async validateApiKey(apiKeyId: string) {
      const { post } = useApi()

      try {
        const response = await post<{ isValid: boolean }>(`/api/exchange/api-keys/${apiKeyId}/validate`)
        if (response.success) {
          const index = this.apiKeys.findIndex(k => k.id === apiKeyId)
          if (index >= 0) {
            this.apiKeys[index].isValid = response.data?.isValid ?? false
            this.apiKeys[index].lastValidated = new Date().toISOString()
          }
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async deleteApiKey(apiKeyId: string) {
      const { del } = useApi()

      try {
        const response = await del(`/api/exchange/api-keys/${apiKeyId}`)
        if (response.success) {
          this.apiKeys = this.apiKeys.filter(k => k.id !== apiKeyId)
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async toggleApiKey(apiKeyId: string, isActive: boolean) {
      const { patch } = useApi()

      try {
        const response = await patch<ApiKey>(`/api/exchange/api-keys/${apiKeyId}`, { isActive })
        if (response.success && response.data) {
          const index = this.apiKeys.findIndex(k => k.id === apiKeyId)
          if (index >= 0) {
            this.apiKeys[index] = response.data
          }
        }
        return response
      } catch (error) {
        throw error
      }
    },

    setSelectedExchange(exchange: 'binance' | 'okx' | 'bitget') {
      this.selectedExchange = exchange
    }
  }
})