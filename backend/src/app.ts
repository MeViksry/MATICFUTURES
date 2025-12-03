// backend/src/app.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { config } from './config/env'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import { rateLimiter } from './middlewares/rateLimiter'
import { initializeWebSocket } from './ws/socketServer'
import { initializeRedis } from './config/redis'
import { prisma } from './config/database'

// Routes
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import exchangeRoutes from './routes/exchange.routes'
import portfolioRoutes from './routes/portfolio.routes'
import webhookRoutes from './routes/webhook.routes'
import botRoutes from './routes/bot.routes'
import adminRoutes from './routes/admin.routes'

const app = express()
const httpServer = createServer(app)

// Middleware
app.use(helmet())
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))

// Rate Limiting
app.use('/api/', rateLimiter)

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/exchange', exchangeRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/webhook', webhookRoutes)
app.use('/api/bot', botRoutes)
app.use('/api/admin', adminRoutes)

// Error Handler
app.use(errorHandler)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Initialize Services
const startServer = async () => {
  try {
    // Connect to Database
    await prisma.$connect()
    logger.info('✅ Database connected')

    // Initialize Redis
    await initializeRedis()
    logger.info('✅ Redis connected')

    // Initialize WebSocket
    initializeWebSocket(httpServer)
    logger.info('✅ WebSocket initialized')

    // Start Server
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`)
      logger.info(`📝 Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()

export { app, httpServer }