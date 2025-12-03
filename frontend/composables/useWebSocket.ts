import { io, Socket } from 'socket.io-client'
import type { WebSocketMessage } from '~/types'
import { useAuthStore } from "~/stores/auth";

export const useWebSocket = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  let socket: Socket | null = null
  const isConnected = ref(false)
  const lastMessage = ref<WebSocketMessage | null>(null)

  const connect = () => {
    if (socket?.connected) return

    socket = io(config.public.wsUrl, {
      auth: {
        token: authStore.token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      isConnected.value = true
      console.log('WebSocket connected')
    })

    socket.on('disconnect', () => {
      isConnected.value = false
      console.log('WebSocket disconnected')
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const unsubscribe = (event: string) => {
    if (socket) {
      socket.off(event)
    }
  }

  const emit = (event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    emit
  }
}