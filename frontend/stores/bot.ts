import { defineStore } from 'pinia'
import type { BotSettings, WebhookConfig, WebhookLog } from '~/types'

interface BotState {
  settings: BotSettings | null
  webhook: WebhookConfig | null
  webhookLogs: WebhookLog[]
  isRunning: boolean
  isLoading: boolean
}

export const useBotStore = defineStore('bot', {
  state: (): BotState => ({
    settings: null,
    webhook: null,
    webhookLogs: [],
    isRunning: false,
    isLoading: false
  }),

  getters: {
    webhookUrl: (state) => state.webhook?.url ?? '',
    isEnabled: (state) => state.settings?.isEnabled ?? false
  },

  actions: {
    async fetchSettings() {
      const { get } = useApi()
      this.isLoading = true

      try {
        const response = await get<BotSettings>('/api/bot/settings')
        if (response.success && response.data) {
          this.settings = response.data
          this.isRunning = response.data.isEnabled
        }
      } catch (error) {
        console.error('Failed to fetch bot settings:', error)
      } finally {
        this.isLoading = false
      }
    },

    async updateSettings(settings: Partial<BotSettings>) {
      const { patch } = useApi()

      try {
        const response = await patch<BotSettings>('/api/bot/settings', settings)
        if (response.success && response.data) {
          this.settings = response.data
          this.isRunning = response.data.isEnabled
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async toggleBot(enabled: boolean) {
      const { post } = useApi()

      try {
        const response = await post<{ isEnabled: boolean }>('/api/bot/toggle', { enabled })
        if (response.success) {
          this.isRunning = enabled
          if (this.settings) {
            this.settings.isEnabled = enabled
          }
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async fetchWebhook() {
      const { get } = useApi()

      try {
        const response = await get<WebhookConfig>('/api/webhook/config')
        if (response.success && response.data) {
          this.webhook = response.data
        }
      } catch (error) {
        console.error('Failed to fetch webhook:', error)
      }
    },

    async generateWebhook() {
      const { post } = useApi()

      try {
        const response = await post<WebhookConfig>('/api/webhook/generate')
        if (response.success && response.data) {
          this.webhook = response.data
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async regenerateWebhook() {
      const { post } = useApi()

      try {
        const response = await post<WebhookConfig>('/api/webhook/regenerate')
        if (response.success && response.data) {
          this.webhook = response.data
        }
        return response
      } catch (error) {
        throw error
      }
    },

    async fetchWebhookLogs(params?: { page?: number; limit?: number }) {
      const { get } = useApi()

      try {
        const response = await get<WebhookLog[]>('/api/webhook/logs', params)
        if (response.success && response.data) {
          this.webhookLogs = response.data
        }
      } catch (error) {
        console.error('Failed to fetch webhook logs:', error)
      }
    }
  }
})