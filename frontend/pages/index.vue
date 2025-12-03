<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      </div>

      <!-- Navbar -->
      <nav class="relative z-50 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <IconChart class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold text-white">BITICI BOT</span>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink to="/auth/login" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Login
            </NuxtLink>
            <NuxtLink to="/auth/register" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all">
              Get Started
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div class="text-center">
          <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6">
            Automate Your
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600"> Futures Trading</span>
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Copy trading signals from TradingView directly to your exchange. 
            Support Binance, OKX, and Bitget Futures with real-time execution.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink to="/auth/register" class="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 flex items-center">
              Start Trading Now
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </NuxtLink>
            <a href="#features" class="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all border border-gray-600">
              Learn More
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div v-for="stat in stats" :key="stat.label" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">{{ stat.value }}</div>
            <div class="text-gray-400 mt-1">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Everything you need for automated futures trading in one platform.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-green-500/50 transition-all">
            <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6">
              <component :is="feature.icon" class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">{{ feature.title }}</h3>
            <p class="text-gray-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-24 px-6 bg-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">Pricing</h2>
          <p class="text-gray-400">Choose the plan that fits your trading needs.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div 
            v-for="plan in plans" 
            :key="plan.name" 
            class="bg-white/5 backdrop-blur-xl border rounded-2xl p-8"
            :class="plan.popular ? 'border-green-500' : 'border-white/10'"
          >
            <div v-if="plan.popular" class="text-green-500 text-sm font-medium mb-4">Most Popular</div>
            <h3 class="text-2xl font-bold text-white">{{ plan.name }}</h3>
            <div class="mt-4 mb-6">
              <span class="text-4xl font-bold text-white">${{ plan.price }}</span>
              <span class="text-gray-400">/{{ plan.period }}</span>
            </div>
            <ul class="space-y-3 mb-8">
              <li v-for="planFeature in plan.features" :key="planFeature" class="flex items-center text-gray-300">
                <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ planFeature }}
              </li>
            </ul>
            <NuxtLink 
              :to="`/auth/register?plan=${plan.id}`" 
              class="block w-full py-3 text-center font-semibold rounded-xl transition-all"
              :class="plan.popular ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
  <div class="max-w-7xl mx-auto px-6">
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <IconChart class="w-6 h-6 text-white" />
            </div>
          <span class="text-xl font-bold text-white">BITICI BOT</span>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">
          Automate your futures trading with institutional-grade speed. Support Binance, OKX, & Bitget.
        </p>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-4">Platform</h3>
        <ul class="space-y-3 text-sm text-gray-400">
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Features</NuxtLink></li>
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Pricing</NuxtLink></li>
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Supported Exchanges</NuxtLink></li>
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Roadmap</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-4">Support</h3>
        <ul class="space-y-3 text-sm text-gray-400">
          <li><a href="#" class="hover:text-green-400 transition">Documentation</a></li>
          <li><a href="#" class="hover:text-green-400 transition">API Status</a></li>
          <li><a href="#" class="hover:text-green-400 transition">Contact Us</a></li>
          <li><a href="#" class="hover:text-green-400 transition">Community</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-white font-semibold mb-4">Legal</h3>
        <ul class="space-y-3 text-sm text-gray-400">
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Privacy Policy</NuxtLink></li>
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Terms of Service</NuxtLink></li>
          <li><NuxtLink to="#" class="hover:text-green-400 transition">Risk Disclosure</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="text-gray-500 text-sm">
        © {{ new Date().getFullYear() }} Bitici Bot. All rights reserved.
      </p>
      
      <div class="flex gap-6">
        <a href="#" class="text-gray-400 hover:text-white transition">
          <span class="sr-only">Twitter</span>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition">
          <span class="sr-only">GitHub</span>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
        </a>
      </div>
    </div>
  </div>
</footer>

  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  description: 'Copy trading signals from TradingView directly to your exchange. Support Binance, OKX, and Bitget Futures with real-time execution.',
  ogTitle: 'Bitici Bot - Futures Trading',
  ogDescription: 'Copy trading signals from TradingView directly to your exchange. Support Binance, OKX, and Bitget Futures with real-time execution.',
  ogImage: '[og:image]',
  ogUrl: '[og:url]',
  twitterTitle: 'Bitici Bot - Futures Trading',
  twitterDescription: 'Copy trading signals from TradingView directly to your exchange. Support Binance, OKX, and Bitget Futures with real-time execution.',
  twitterImage: '[twitter:image]',
  twitterCard: 'summary'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }
  ]
})

// Import icons
import IconChart from '~/components/icons/IconChart.vue'
import IconExchange from '~/components/icons/IconExchange.vue'
import IconBolt from '~/components/icons/IconBolt.vue'
import IconShield from '~/components/icons/IconShield.vue'
import IconAnalytics from '~/components/icons/IconAnalytics.vue'
import IconLock from '~/components/icons/IconLock.vue'

definePageMeta({
  layout: false
})

const stats = [
  { value: '$10M+', label: 'Trading Volume' },
  { value: '5,000+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '<50ms', label: 'Execution Time' }
]

const features = [
  {
    title: 'TradingView Integration',
    description: 'Receive signals directly from TradingView alerts via webhook and execute trades automatically.',
    icon: IconChart
  },
  {
    title: 'Multi-Exchange Support',
    description: 'Trade on Binance, OKX, and Bitget Futures with a single platform.',
    icon: IconExchange
  },
  {
    title: 'Real-time Execution',
    description: 'Lightning-fast order execution with less than 50ms latency.',
    icon: IconBolt
  },
  {
    title: 'Risk Management',
    description: 'Built-in stop loss, take profit, and position sizing controls.',
    icon: IconShield
  },
  {
    title: 'Performance Analytics',
    description: 'Track your P&L, win rate, and other key metrics in real-time.',
    icon: IconAnalytics
  },
  {
    title: 'Secure API Storage',
    description: 'Your API keys are encrypted with AES-256 and never exposed.',
    icon: IconLock
  }
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    popular: false,
    features: [
      '1 Exchange Connection',
      '10 Trades/Day',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 29,
    period: 'month',
    popular: true,
    features: [
      '3 Exchange Connections',
      'Unlimited Trades',
      'Advanced Analytics',
      'Priority Support',
      'Custom Webhooks'
    ]
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 249,
    period: 'year',
    popular: false,
    features: [
      'Everything in Pro',
      '2 Months Free',
      'VIP Support',
      'Early Access Features',
      'Custom Integrations'
    ]
  }
]
</script>