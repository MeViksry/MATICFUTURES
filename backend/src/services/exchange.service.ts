// backend/src/services/exchange.service.ts
import { prisma } from '../config/database'
import { encrypt, decrypt } from '../utils/encryption'
import { ExchangeFactory } from '../exchange/factory'
import { logger } from '../utils/logger'

export class ExchangeService {
  async getApiKeys(userId: string) {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        exchange: true,
        apiKey: true,
        isActive: true,
        isValid: true,
        lastValidated: true,
        createdAt: true
      }
    })

    // Mask API keys
    return apiKeys.map(key => ({
      ...key,
      apiKey: this.maskApiKey(decrypt(key.apiKey))
    }))
  }

  async addApiKey(userId: string, data: {
    exchange: string
    apiKey: string
    secretKey: string
    passphrase?: string
  }) {
    // Check if already exists for this exchange
    const existing = await prisma.apiKey.findFirst({
      where: {
        userId,
        exchange: data.exchange.toUpperCase() as any
      }
    })

    if (existing) {
      throw new Error(`API key for ${data.exchange} already exists`)
    }

    // Encrypt sensitive data
    const encryptedApiKey = encrypt(data.apiKey)
    const encryptedSecretKey = encrypt(data.secretKey)
    const encryptedPassphrase = data.passphrase ? encrypt(data.passphrase) : null

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        exchange: data.exchange.toUpperCase() as any,
        apiKey: encryptedApiKey,
        secretKey: encryptedSecretKey,
        passphrase: encryptedPassphrase
      }
    })

    // Validate the API key
    try {
      const isValid = await this.testApiKey(apiKey.id)
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: {
          isValid,
          lastValidated: new Date()
        }
      })
    } catch (error) {
      logger.error('API key validation failed:', error)
    }

    return {
      id: apiKey.id,
      exchange: apiKey.exchange,
      apiKey: this.maskApiKey(data.apiKey),
      isActive: apiKey.isActive,
      isValid: apiKey.isValid,
      createdAt: apiKey.createdAt
    }
  }

  async validateApiKey(userId: string, apiKeyId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    })

    if (!apiKey) {
      throw new Error('API key not found')
    }

    const isValid = await this.testApiKey(apiKeyId)

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        isValid,
        lastValidated: new Date()
      }
    })

    return { isValid }
  }

  async updateApiKey(userId: string, apiKeyId: string, data: { isActive?: boolean }) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    })

    if (!apiKey) {
      throw new Error('API key not found')
    }

    const updated = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data
    })

    return {
      id: updated.id,
      exchange: updated.exchange,
      apiKey: this.maskApiKey(decrypt(updated.apiKey)),
      isActive: updated.isActive,
      isValid: updated.isValid,
      lastValidated: updated.lastValidated,
      createdAt: updated.createdAt
    }
  }

  async deleteApiKey(userId: string, apiKeyId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    })

    if (!apiKey) {
      throw new Error('API key not found')
    }

    await prisma.apiKey.delete({
      where: { id: apiKeyId }
    })

    return true
  }

  async getBalance(userId: string) {
    const exchange = await this.getActiveExchange(userId)
    return exchange.getBalance()
  }

  async getPositions(userId: string) {
    const exchange = await this.getActiveExchange(userId)
    return exchange.getPositions()
  }

  async getOrders(userId: string) {
    const exchange = await this.getActiveExchange(userId)
    return exchange.getOpenOrders()
  }

  async createOrder(userId: string, data: {
    symbol: string
    side: 'buy' | 'sell'
    type: 'market' | 'limit'
    quantity: number
    price?: number
    leverage?: number
    stopLoss?: number
    takeProfit?: number
  }) {
    const exchange = await this.getActiveExchange(userId)

    // Set leverage if provided
    if (data.leverage) {
      await exchange.setLeverage(data.symbol, data.leverage)
    }

    // Create order
    const order = await exchange.createOrder(data)

    // Save to database
    await prisma.order.create({
      data: {
        userId,
        exchange: exchange.getName().toUpperCase() as any,
        exchangeOrderId: order.id,
        symbol: data.symbol,
        side: data.side.toUpperCase() as any,
        type: data.type.toUpperCase() as any,
        status: 'OPEN',
        price: data.price,
        quantity: data.quantity,
        leverage: data.leverage || 1,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit
      }
    })

    return order
  }

  async cancelOrder(userId: string, orderId: string) {
    const exchange = await this.getActiveExchange(userId)
    await exchange.cancelOrder(orderId)

    // Update database
    await prisma.order.updateMany({
      where: {
        userId,
        exchangeOrderId: orderId
      },
      data: {
        status: 'CANCELLED'
      }
    })

    return true
  }

  async closePosition(userId: string, data: { symbol: string; positionId?: string }) {
    const exchange = await this.getActiveExchange(userId)
    return exchange.closePosition(data.symbol)
  }

  private async getActiveExchange(userId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId,
        isActive: true,
        isValid: true
      }
    })

    if (!apiKey) {
      throw new Error('No valid API key found. Please add and validate an API key first.')
    }

    return ExchangeFactory.create(
      apiKey.exchange.toLowerCase() as 'binance' | 'okx' | 'bitget',
      {
        apiKey: decrypt(apiKey.apiKey),
        secretKey: decrypt(apiKey.secretKey),
        passphrase: apiKey.passphrase ? decrypt(apiKey.passphrase) : undefined
      }
    )
  }

  private async testApiKey(apiKeyId: string): Promise<boolean> {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId }
    })

    if (!apiKey) {
      return false
    }

    try {
      const exchange = ExchangeFactory.create(
        apiKey.exchange.toLowerCase() as 'binance' | 'okx' | 'bitget',
        {
          apiKey: decrypt(apiKey.apiKey),
          secretKey: decrypt(apiKey.secretKey),
          passphrase: apiKey.passphrase ? decrypt(apiKey.passphrase) : undefined
        }
      )

      await exchange.getBalance()
      logger.info(`API key validation successful for ${apiKey.exchange}`)
      return true
    } catch (error: any) {
      logger.error(`API key validation failed for ${apiKey.exchange}: ${error.message}`)
      return false
    }
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '****'
    return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
  }
}