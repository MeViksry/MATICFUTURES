<!-- frontend/components/DashboardStatCard.vue -->
<template>
  <div class="card p-6 card-hover">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold" :class="valueClass || 'text-gray-900 dark:text-white'">
          {{ value }}
        </p>
        <div v-if="trend" class="flex items-center mt-2">
          <svg
            class="w-4 h-4 mr-1"
            :class="trend.isPositive ? 'text-green-500' : 'text-red-500'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="trend.isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'"
            />
          </svg>
          <span
            class="text-sm font-medium"
            :class="trend.isPositive ? 'text-green-500' : 'text-red-500'"
          >
            {{ trend.value }}%
          </span>
          <span class="text-xs text-gray-500 ml-1">vs last period</span>
        </div>
      </div>
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="iconComponent" class="w-6 h-6" :class="iconColorClass" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string
  icon: 'wallet' | 'chart' | 'trophy' | 'activity'
  valueClass?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  const icons: Record<string, any> = {
    wallet: resolveComponent('IconWallet'),
    chart: resolveComponent('IconChart'),
    trophy: resolveComponent('IconTrophy'),
    activity: resolveComponent('IconActivity')
  }
  return icons[props.icon] || icons.chart
})

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    wallet: 'bg-blue-100 dark:bg-blue-900/30',
    chart: 'bg-green-100 dark:bg-green-900/30',
    trophy: 'bg-yellow-100 dark:bg-yellow-900/30',
    activity: 'bg-purple-100 dark:bg-purple-900/30'
  }
  return classes[props.icon] || classes.chart
})

const iconColorClass = computed(() => {
  const classes: Record<string, string> = {
    wallet: 'text-blue-600 dark:text-blue-400',
    chart: 'text-green-600 dark:text-green-400',
    trophy: 'text-yellow-600 dark:text-yellow-400',
    activity: 'text-purple-600 dark:text-purple-400'
  }
  return classes[props.icon] || classes.chart
})
</script>