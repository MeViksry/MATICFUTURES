<!-- frontend/components/TradingChart.vue -->
<template>
  <div ref="chartContainer" class="w-full" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import type { ChartData } from '~/types'

interface Props {
  data: ChartData[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 400
})

const chartContainer = ref<HTMLDivElement | null>(null)
let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
let volumeSeries: ISeriesApi<'Histogram'> | null = null

const colorMode = useColorMode()

const chartOptions = computed(() => ({
  layout: {
    background: {
      type: ColorType.Solid,
      color: colorMode.value === 'dark' ? '#0f172a' : '#ffffff'
    },
    textColor: colorMode.value === 'dark' ? '#94a3b8' : '#64748b'
  },
  grid: {
    vertLines: {
      color: colorMode.value === 'dark' ? '#1e293b' : '#f1f5f9'
    },
    horzLines: {
      color: colorMode.value === 'dark' ? '#1e293b' : '#f1f5f9'
    }
  },
  crosshair: {
    mode: 1
  },
  rightPriceScale: {
    borderColor: colorMode.value === 'dark' ? '#1e293b' : '#e2e8f0'
  },
  timeScale: {
    borderColor: colorMode.value === 'dark' ? '#1e293b' : '#e2e8f0',
    timeVisible: true,
    secondsVisible: false
  }
}))

const initChart = () => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    ...chartOptions.value,
    width: chartContainer.value.clientWidth,
    height: props.height
  })

  candleSeries = chart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderDownColor: '#ef4444',
    borderUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    wickUpColor: '#22c55e'
  })

  volumeSeries = chart.addHistogramSeries({
    color: '#6366f1',
    priceFormat: {
      type: 'volume'
    },
    priceScaleId: '',
    scaleMargins: {
      top: 0.8,
      bottom: 0
    }
  })

  // Handle resize
  const resizeObserver = new ResizeObserver((entries) => {
    if (chart && entries[0]) {
      chart.applyOptions({
        width: entries[0].contentRect.width
      })
    }
  })

  resizeObserver.observe(chartContainer.value)
}

const updateData = () => {
  if (!candleSeries || !volumeSeries || props.data.length === 0) return

  const candleData = props.data.map(d => ({
    time: d.time as any,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  }))

  const volumeData = props.data.map(d => ({
    time: d.time as any,
    value: d.volume,
    color: d.close >= d.open ? '#22c55e50' : '#ef444450'
  }))

  candleSeries.setData(candleData)
  volumeSeries.setData(volumeData)
}

// Watch for data changes
watch(() => props.data, () => {
  updateData()
}, { deep: true })

// Watch for theme changes
watch(colorMode, () => {
  if (chart) {
    chart.applyOptions(chartOptions.value)
  }
})

onMounted(() => {
  initChart()
  updateData()
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
  }
})
</script>