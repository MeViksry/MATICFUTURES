// backend/src/workers/index.ts
import { webhookWorker } from './webhookWorker'
import { portfolioWorker } from './portfolioWorker'
import { metricsWorker } from './metricsWorker'
import { initializeRedis } from '../config/redis'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

const startWorkers = async () => {
  try {
    // Connect to database
    await prisma.$connect()
    logger.info('✅ Worker: Database connected')

    // Initialize Redis
    await initializeRedis()
    logger.info('✅ Worker: Redis connected')

    // Start workers
    webhookWorker.start()
    logger.info('✅ Webhook Worker started')

    portfolioWorker.start()
    logger.info('✅ Portfolio Worker started')

    metricsWorker.start()
    logger.info('✅ Metrics Worker started')

    logger.info('🚀 All workers running')
  } catch (error) {
    logger.error('Failed to start workers:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Stopping workers...')
  webhookWorker.stop()
  portfolioWorker.stop()
  metricsWorker.stop()
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Stopping workers...')
  webhookWorker.stop()
  portfolioWorker.stop()
  metricsWorker.stop()
  await prisma.$disconnect()
  process.exit(0)
})

startWorkers()