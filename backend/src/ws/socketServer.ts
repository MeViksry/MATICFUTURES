// backend/src/ws/socketServer.ts
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { verifyAccessToken } from '../utils/jwt'
import { logger } from '../utils/logger'
import { config } from '../config/env'

let io: Server | null = null
const userSockets: Map<string, Set<string>> = new Map()

export const initializeWebSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const payload = verifyAccessToken(token)
      socket.data.user = payload
      next()
    } catch (error) {
      return next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.userId
    
    logger.info(`WebSocket connected: ${socket.id} (User: ${userId})`)

    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId)!.add(socket.id)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Handle subscription to specific channels
    socket.on('subscribe', (channel: string) => {
      socket.join(channel)
      logger.debug(`Socket ${socket.id} subscribed to ${channel}`)
    })

    socket.on('unsubscribe', (channel: string) => {
      socket.leave(channel)
      logger.debug(`Socket ${socket.id} unsubscribed from ${channel}`)
    })

    // Handle ping for keep-alive
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket disconnected: ${socket.id} (Reason: ${reason})`)
      
      // Remove socket from user's socket set
      const sockets = userSockets.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userId)
        }
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`WebSocket error for ${socket.id}:`, error)
    })
  })

  logger.info('WebSocket server initialized')
}

// Emit to specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data)
  }
}

// Emit to all connected clients
export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data)
  }
}

// Emit to specific room/channel
export const emitToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data)
  }
}

// Check if user is connected
export const isUserConnected = (userId: string): boolean => {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0
}

// Get connected users count
export const getConnectedUsersCount = (): number => {
  return userSockets.size
}

// Get all connected socket IDs for a user
export const getUserSockets = (userId: string): string[] => {
  const sockets = userSockets.get(userId)
  return sockets ? Array.from(sockets) : []
}

export const getIO = (): Server | null => io