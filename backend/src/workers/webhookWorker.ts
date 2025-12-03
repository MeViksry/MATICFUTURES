// backend/src/workers/webhookWorker.ts
import { getRedis } from '../config/redis'
import { prisma } from '../config/database'
import { ExchangeFactory } from '../exchange/factory'
import { decrypt } from '../utils/encryption'
import { logger } from '../utils/logger'
import { emitToUser } from '../ws/socketServer'

interface WebhookJob {
  logId: string
  userId: string
  payload: {
    action: 'buy' | 'sell' | 'close'
    symbol: string
    side?: 'long' | 'short'
    quantity?: number
    leverage?: number
    stopLoss?: number
    takeProfit?: number
    price?: number
    orderType?: 'market' | 'limit'
  }
  timestamp: number
}

class WebhookWorker {
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null

  start() {
    this.isRunning = true
    this.process()
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearTimeout(this.intervalId)
    }
  }

  private async process() {
    while (this.isRunning) {
      try {
        const redis = getRedis()
        const jobData = await redis.brpop('webhook:queue', 1) // 1 second timeout

        if (jobData) {
          const job: WebhookJob = JSON.parse(jobData[1])
          await this.executeJob(job)
        }
      } catch (error) {
        logger.error('Webhook worker error:', error)
        await this.sleep(1000)
      }
    }
  }

  private async executeJob(job: WebhookJob) {
    const startTime = Date.now()
    logger.info(`Processing webhook job ${job.logId}`)

    try {
      // Update log status to processing
      await prisma.webhookLog.update({
        where: { id: job.logId },
        data: { status: 'PROCESSING' }
      })

      // Get user's bot settings
      const botSettings = await prisma.botSettings.findUnique({
        where: { userId: job.userId }
      })

      if (!botSettings?.isEnabled) {
        throw new Error('Bot is disabled')
      }

      // Get user's API key
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          userId: job.userId,
          isActive: true,
          isValid: true
        }
      })

      if (!apiKey) {
        throw new Error('No valid API key found')
      }

      // Create exchange instance
      const exchange = ExchangeFactory.create(
        apiKey.exchange.toLowerCase() as 'binance' | 'okx' | 'bitget',
        {
          apiKey: decrypt(apiKey.apiKey),
          secretKey: decrypt(apiKey.secretKey),
          passphrase: apiKey.passphrase ? decrypt(apiKey.passphrase) : undefined
        }
      )

      let result: any

      // Execute based on action
      switch (job.payload.action) {
        case 'buy':
        case 'sell':
          result = await this.executeOrder(exchange, job, botSettings)
          break
        case 'close':
          result = await exchange.closePosition(job.payload.symbol)
          break
        default:
          throw new Error(`Unknown action: ${job.payload.action}`)
      }

      // Update log as success
      await prisma.webhookLog.update({
        where: { id: job.logId },
        data: {
          status: 'SUCCESS',
          response: result as any,
          processedAt: new Date()
        }
      })

      // Notify user via WebSocket
      emitToUser(job.userId, 'trade:executed', {
        action: job.payload.action,
        symbol: job.payload.symbol,
        result
      })

      const executionTime = Date.now() - startTime
      logger.info(`Webhook job ${job.logId} completed in ${executionTime}ms`)

    } catch (error: any) {
      logger.error(`Webhook job ${job.logId} failed:`, error)

      // Update log as failed
      await prisma.webhookLog.update({
        where: { id: job.logId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          processedAt: new Date()
        }
      })

      // Notify user of error
      emitToUser(job.userId, 'trade:error', {
        action: job.payload.action,
        symbol: job.payload.symbol,
        error: error.message
      })

      // Check if should retry
      await this.handleRetry(job, error)
    }
  }

  private async executeOrder(exchange: any, job: WebhookJob, botSettings: any) {
    const { payload } = job

    // Validate against bot settings
    if (botSettings.blacklistedSymbols?.includes(payload.symbol)) {
      throw new Error(`Symbol ${payload.symbol} is blacklisted`)
    }

    if (botSettings.allowedSymbols?.length > 0 && 
        !botSettings.allowedSymbols.includes(payload.symbol)) {
      throw new Error(`Symbol ${payload.symbol} is not in allowed list`)
    }

    // Check max positions
    const openPositions = await prisma.position.count({
      where: {
        userId: job.userId,
        isOpen: true
      }
    })

    if (openPositions >= botSettings.maxPositions) {
      throw new Error(`Max positions (${botSettings.maxPositions}) reached`)
    }

    // Determine leverage
    let leverage = payload.leverage || botSettings.defaultLeverage
    if (leverage > botSettings.maxLeverage) {
      leverage = botSettings.maxLeverage
    }

    // Set leverage
    await exchange.setLeverage(payload.symbol, leverage)

    // Calculate quantity if not provided
    let quantity = payload.quantity
    if (!quantity) {
      const balance = await exchange.getBalance()
      const riskAmount = balance.availableBalance * (botSettings.riskPerTrade / 100)
      // This is simplified - real implementation would need current price
      quantity = riskAmount / leverage
    }

    // Determine stop loss and take profit
    const stopLoss = payload.stopLoss || null
    const takeProfit = payload.takeProfit || null

    // Create the order
    const order = await exchange.createOrder({
      symbol: payload.symbol,
      side: payload.action,
      type: payload.orderType || 'market',
      quantity,
      price: payload.price,
      leverage,
      stopLoss,
      takeProfit
    })

    // Save order to database
    await prisma.order.create({
      data: {
        userId: job.userId,
        exchange: exchange.getName().toUpperCase() as any,
        exchangeOrderId: order.id,
        symbol: payload.symbol,
        side: payload.action.toUpperCase() as any,
        type: (payload.orderType || 'market').toUpperCase() as any,
        status: 'FILLED',
        price: order.price,
        quantity: order.quantity,
        filledQuantity: order.filledQuantity,
        leverage,
        stopLoss,
        takeProfit,
        executedAt: new Date()
      }
    })

    return order
  }

  private async handleRetry(job: WebhookJob, error: Error) {
    const redis = getRedis()
    const retryKey = `webhook:retry:${job.logId}`
    const retryCount = await redis.incr(retryKey)
    await redis.expire(retryKey, 3600) // 1 hour TTL

    if (retryCount <= 3) {
      // Add back to queue with delay
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
      await this.sleep(delay)
      await redis.lpush('webhook:queue', JSON.stringify(job))
      logger.info(`Webhook job ${job.logId} requeued for retry ${retryCount}`)
    } else {
      logger.error(`Webhook job ${job.logId} max retries exceeded`)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const webhookWorker = new WebhookWorker()