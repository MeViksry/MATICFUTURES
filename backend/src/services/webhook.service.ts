// backend/src/services/webhook.service.ts
import { prisma } from '../config/database'
import { getRedis } from '../config/redis'
import { generateToken } from '../utils/encryption'
import { logger } from '../utils/logger'
import { config } from '../config/env'

interface WebhookPayload {
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

export class WebhookService {
  async processWebhook(userId: string, token: string, payload: WebhookPayload) {
    // Validate webhook
    const webhook = await prisma.webhookConfig.findFirst({
      where: {
        userId,
        token,
        isActive: true
      }
    })

    if (!webhook) {
      throw new Error('Invalid webhook')
    }

    // Check if user is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        botSettings: true
      }
    })

    if (!user || !user.isActive) {
      throw new Error('User account not active')
    }

    if (!user.botSettings?.isEnabled) {
      throw new Error('Bot is disabled')
    }

    // Create webhook log
    const log = await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        userId,
        payload: payload as any,
        status: 'PENDING'
      }
    })

    // Update webhook stats
    await prisma.webhookConfig.update({
      where: { id: webhook.id },
      data: {
        lastTriggered: new Date(),
        totalTriggers: { increment: 1 }
      }
    })

    // Add to Redis queue for processing
    const redis = getRedis()
    await redis.lpush('webhook:queue', JSON.stringify({
      logId: log.id,
      userId,
      payload,
      timestamp: Date.now()
    }))

    logger.info(`Webhook queued for user ${userId}`, { logId: log.id })

    return { logId: log.id }
  }

  async getConfig(userId: string) {
    let webhook = await prisma.webhookConfig.findUnique({
      where: { userId }
    })

    if (!webhook) {
      webhook = await this.generateWebhook(userId)
    }

    return {
      id: webhook.id,
      token: webhook.token,
      url: `${config.frontendUrl.replace('3000', '3001')}/api/webhook/${userId}/${webhook.token}`,
      isActive: webhook.isActive,
      lastTriggered: webhook.lastTriggered,
      totalTriggers: webhook.totalTriggers,
      createdAt: webhook.createdAt
    }
  }

  async generateWebhook(userId: string) {
    const existingWebhook = await prisma.webhookConfig.findUnique({
      where: { userId }
    })

    if (existingWebhook) {
      return existingWebhook
    }

    const token = generateToken(32)

    const webhook = await prisma.webhookConfig.create({
      data: {
        userId,
        token
      }
    })

    return webhook
  }

  async regenerateWebhook(userId: string) {
    const token = generateToken(32)

    const webhook = await prisma.webhookConfig.upsert({
      where: { userId },
      update: { token },
      create: {
        userId,
        token
      }
    })

    return {
      id: webhook.id,
      token: webhook.token,
      url: `${config.frontendUrl.replace('3000', '3001')}/api/webhook/${userId}/${webhook.token}`,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt
    }
  }

  async getLogs(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.webhookLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.webhookLog.count({ where: { userId } })
    ])

    return { logs, total }
  }

  async toggleWebhook(userId: string, isActive: boolean) {
    const webhook = await prisma.webhookConfig.update({
      where: { userId },
      data: { isActive }
    })

    return webhook
  }
}