export default defineNuxtConfig({
  devtools: {
    enabled: true
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    icons: ['heroicons', 'simple-icons']
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark'
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001',

      binanceWsUrl: 'wss://fstream.binance.com/ws',
      okxWsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
      bitgetWsUrl: 'wss://ws.bitget.com/mix/v1/stream'
    }
  },

  app: {
    head: {
      title: 'MaticTrade - Copy Trading',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description', content: 'MaticTrade is an automated copy trading platform that uses algorithmic strategies to trade for you in real time—no manual trading or copying human traders required.'
        }
      ]
    }
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  pinia: {
    storesDirs: ['./stores/**']
  },

  typescript: {
    strict: true
  },

  nitro: {
    preset: 'node-server'
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  compatibilityDate: '2025-01-01'
})