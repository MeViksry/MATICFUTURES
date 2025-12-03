// backend/src/workers/portfolioWorker.ts
import { getRedis } from '../config/redis'
import { prisma } from '../config/database'
import { ExchangeFactory } from '../exchange/factory'
import { decrypt } from '../utils/encryption'
import { logger } from '../utils/logger'
import { emitToUser } from '../ws/socketServer'

class PortfolioWorker {
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null

  start() {
    this.isRunning = true
    this.process()
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  private async process() {
    // Run every 30 seconds
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return

      try {
        await this.syncActiveUsers()
      } catch (error) {
        logger.error('Portfolio worker error:', error)
      }
    }, 30000)

    // Also run immediately
    await this.syncActiveUsers()
  }

  private async syncActiveUsers() {
    const redis = getRedis()
    const activeUsers = await redis.smembers('bot:active_users')

    for (const userId of activeUsers) {
      try {
        await this.syncUserPortfolio(userId)
      } catch (error) {
        logger.error(`Failed to sync portfolio for user ${userId}:`, error)
      }
    }
  }

  private async syncUserPortfolio(userId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId,
        isActive: true,
        isValid: true
      }
    })

    if (!apiKey) return

    const exchange = ExchangeFactory.create(
      apiKey.exchange.toLowerCase() as 'binance' | 'okx' | 'bitget',
      {
        apiKey: decrypt(apiKey.apiKey),
        secretKey: decrypt(apiKey.secretKey),
        passphrase: apiKey.passphrase ? decrypt(apiKey.passphrase) : undefined
      }
    )

    // Get balance
    const balance = await exchange.getBalance()

    // Get positions
    const positions = await exchange.getPositions()

    // Update portfolio
    await prisma.portfolio.upsert({
      where: { userId },
      update: {
        totalBalance: balance.totalBalance,
        availableBalance: balance.availableBalance,
        unrealizedPnl: balance.unrealizedPnl || 0,
        equity: balance.equity || balance.totalBalance,
        marginUsed: balance.marginUsed || 0,
        marginAvailable: balance.marginAvailable || balance.availableBalance,
        lastUpdated: new Date()
      },
      create: {
        userId,
        totalBalance: balance.totalBalance,
        availableBalance: balance.availableBalance,
        unrealizedPnl: balance.unrealizedPnl || 0,
        equity: balance.equity || balance.totalBalance
      }
    })

    // Update positions
    const currentPositionSymbols: string[] = []

    for (const position of positions) {
      currentPositionSymbols.push(position.symbol)
      
      await prisma.position.upsert({
        where: {
          id: `${userId}-${position.symbol}-${position.side}`
        },
        update: {
          markPrice: position.markPrice,
          unrealizedPnl: position.unrealizedPnl,
          unrealizedPnlPercent: position.unrealizedPnlPercent,
          liquidationPrice: position.liquidationPrice,
          margin: position.margin,
          size: position.size
        },
        create: {
          id: `${userId}-${position.symbol}-${position.side}`,
          userId,
          exchange: apiKey.exchange,
          symbol: position.symbol,
          side: position.side.toUpperCase() as any,
          size: position.size,
          entryPrice: position.entryPrice,
          markPrice: position.markPrice,
          leverage: position.leverage,
          unrealizedPnl: position.unrealizedPnl,
          unrealizedPnlPercent: position.unrealizedPnlPercent,
          liquidationPrice: position.liquidationPrice,
          margin: position.margin
        }
      })
    }

    // Close positions that no longer exist
    const closedPositions = await prisma.position.findMany({
      where: {
        userId,
        isOpen: true,
        symbol: { notIn: currentPositionSymbols }
      }
    })

    for (const closedPosition of closedPositions) {
      // Record in trade history
      await prisma.tradeHistory.create({
        data: {
          userId,
          exchange: closedPosition.exchange,
          symbol: closedPosition.symbol,
          side: closedPosition.side as any,
          entryPrice: closedPosition.entryPrice,
          exitPrice: closedPosition.markPrice,
          quantity: closedPosition.size,
          leverage: closedPosition.leverage,
          pnl: closedPosition.unrealizedPnl,
          pnlPercent: closedPosition.unrealizedPnlPercent,
          duration: Math.floor((Date.now() - closedPosition.openedAt.getTime()) / 1000),
          openedAt: closedPosition.openedAt,
          closedAt: new Date()
        }
      })

      // Update position as closed
      await prisma.position.update({
        where: { id: closedPosition.id },
        data: {
          isOpen: false,
          closedAt: new Date()
        }
      })
    }

    // Emit update to user
    emitToUser(userId, 'portfolio:update', {
      balance,
      positions
    })
  }
}

export const portfolioWorker = new PortfolioWorker()