import type { ChartData } from '~/types'

export const useExchangeWebSocket = () => {
  const config = useRuntimeConfig()
  
  let binanceWs: WebSocket | null = null
  let okxWs: WebSocket | null = null
  let bitgetWs: WebSocket | null = null

  const price = ref<number>(0)
  const chartData = ref<ChartData[]>([])
  const isConnected = ref(false)

  const connectBinance = (symbol: string = 'btcusdt') => {
    const wsUrl = `${config.public.binanceWsUrl}/${symbol}@kline_1m`
    
    binanceWs = new WebSocket(wsUrl)

    binanceWs.onopen = () => {
      isConnected.value = true
      console.log('Binance WebSocket connected')
    }

    binanceWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.k) {
        const kline = data.k
        price.value = parseFloat(kline.c)
        
        const newCandle: ChartData = {
          time: kline.t / 1000,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v)
        }

        const existingIndex = chartData.value.findIndex(c => c.time === newCandle.time)
        if (existingIndex >= 0) {
          chartData.value[existingIndex] = newCandle
        } else {
          chartData.value.push(newCandle)
          if (chartData.value.length > 500) {
            chartData.value.shift()
          }
        }
      }
    }

    binanceWs.onerror = (error) => {
      console.error('Binance WebSocket error:', error)
    }

    binanceWs.onclose = () => {
      isConnected.value = false
      console.log('Binance WebSocket disconnected')
      // Auto reconnect after 3 seconds
      setTimeout(() => connectBinance(symbol), 3000)
    }
  }

  const connectOKX = (symbol: string = 'BTC-USDT-SWAP') => {
    okxWs = new WebSocket(config.public.okxWsUrl)

    okxWs.onopen = () => {
      isConnected.value = true
      okxWs?.send(JSON.stringify({
        op: 'subscribe',
        args: [{
          channel: 'candle1m',
          instId: symbol
        }]
      }))
    }

    okxWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.data && data.data.length > 0) {
        const candle = data.data[0]
        price.value = parseFloat(candle[4])
        
        const newCandle: ChartData = {
          time: parseInt(candle[0]) / 1000,
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }

        const existingIndex = chartData.value.findIndex(c => c.time === newCandle.time)
        if (existingIndex >= 0) {
          chartData.value[existingIndex] = newCandle
        } else {
          chartData.value.push(newCandle)
        }
      }
    }

    okxWs.onerror = (error) => {
      console.error('OKX WebSocket error:', error)
    }

    okxWs.onclose = () => {
      isConnected.value = false
      setTimeout(() => connectOKX(symbol), 3000)
    }
  }

  const connectBitget = (symbol: string = 'BTCUSDT_UMCBL') => {
    bitgetWs = new WebSocket(config.public.bitgetWsUrl)

    bitgetWs.onopen = () => {
      isConnected.value = true
      bitgetWs?.send(JSON.stringify({
        op: 'subscribe',
        args: [{
          instType: 'mc',
          channel: 'candle1m',
          instId: symbol
        }]
      }))
    }

    bitgetWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.data && data.data.length > 0) {
        const candle = data.data[0]
        price.value = parseFloat(candle[4])
      }
    }

    bitgetWs.onerror = (error) => {
      console.error('Bitget WebSocket error:', error)
    }

    bitgetWs.onclose = () => {
      isConnected.value = false
      setTimeout(() => connectBitget(symbol), 3000)
    }
  }

  const disconnect = () => {
    binanceWs?.close()
    okxWs?.close()
    bitgetWs?.close()
    isConnected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    price,
    chartData,
    isConnected,
    connectBinance,
    connectOKX,
    connectBitget,
    disconnect
  }
}