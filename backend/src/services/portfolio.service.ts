// backend/src/services/portfolio.service.ts
import { prisma } from '../config/database'
import { ExchangeFactory } from '../exchange/factory'
import { decrypt } from '../utils/encryption'
import { logger } from '../utils/logger'

export class PortfolioService {
  async getPortfolio(userId: string) {
    // Get portfolio from database
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId }
    })

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId }
      })
    }

    // Get open positions
    const positions = await prisma.position.findMany({
      where: {
        userId,
        isOpen: true
      }
    })

    return {
      ...portfolio,
      positions
    }
  }

  async getTradeHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit

    const [trades, total] = await Promise.all([
      prisma.tradeHistory.findMany({
        where: { userId },
        orderBy: { closedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.tradeHistory.count({ where: { userId } })
    ])

    return { trades, total }
  }

  async getMetrics(userId: string) {
    let metrics = await prisma.performanceMetrics.findUnique({
      where: { userId }
    })

    if (!metrics) {
      metrics = await this.calculateMetrics(userId)
    }

    return metrics
  }

  async syncPortfolio(userId: string) {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        userId,
        isActive: true,
        isValid: true
      }
    })

    if (!apiKey) {
      throw new Error('No valid API key found')
    }

    const exchange = ExchangeFactory.create(
      apiKey.exchange.toLowerCase() as 'binance' | 'okx' | 'bitget',
      {
        apiKey: decrypt(apiKey.apiKey),
        secretKey: decrypt(apiKey.secretKey),
        passphrase: apiKey.passphrase ? decrypt(apiKey.passphrase) : undefined
      }
    )

    // Get balance from exchange
    const balance = await exchange.getBalance()

    // Get positions from exchange
    const positions = await exchange.getPositions()

    // Update portfolio
    const portfolio = await prisma.portfolio.upsert({
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

    // Sync positions
    for (const position of positions) {
      await prisma.position.upsert({
        where: {
          id: position.id || `${userId}-${position.symbol}-${position.side}`
        },
        update: {
          markPrice: position.markPrice,
          unrealizedPnl: position.unrealizedPnl,
          unrealizedPnlPercent: position.unrealizedPnlPercent,
          liquidationPrice: position.liquidationPrice,
          margin: position.margin
        },
        create: {
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

    // Mark closed positions
    const openSymbols = positions.map(p => p.symbol)
    await prisma.position.updateMany({
      where: {
        userId,
        isOpen: true,
        symbol: { notIn: openSymbols }
      },
      data: {
        isOpen: false,
        closedAt: new Date()
      }
    })

    return {
      ...portfolio,
      positions
    }
  }

  async calculateMetrics(userId: string) {
    const trades = await prisma.tradeHistory.findMany({
      where: { userId }
    })

    if (trades.length === 0) {
      return prisma.performanceMetrics.upsert({
        where: { userId },
        update: { lastCalculated: new Date() },
        create: { userId }
      })
    }

    const profitableTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = profitableTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    const winRate = (profitableTrades.length / trades.length) * 100
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins
    const averageWin = profitableTrades.length > 0 
      ? totalWins / profitableTrades.length 
      : 0
    const averageLoss = losingTrades.length > 0 
      ? totalLosses / losingTrades.length 
      : 0

    const largestWin = profitableTrades.length > 0 
      ? Math.max(...profitableTrades.map(t => t.pnl)) 
      : 0
    const largestLoss = losingTrades.length > 0 
      ? Math.min(...losingTrades.map(t => t.pnl)) 
      : 0

    // Calculate drawdown
    let maxDrawdown = 0
    let peak = 0
    let runningPnl = 0

    for (const trade of trades.sort((a, b) => 
      new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
    )) {
      runningPnl += trade.pnl
      if (runningPnl > peak) {
        peak = runningPnl
      }
      const drawdown = peak - runningPnl
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    const metrics = await prisma.performanceMetrics.upsert({
      where: { userId },
      update: {
        totalPnl,
        totalTrades: trades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        maxDrawdown,
        averageWin,
        averageLoss,
        largestWin,
        largestLoss,
        lastCalculated: new Date()
      },
      create: {
        userId,
        totalPnl,
        totalTrades: trades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        maxDrawdown,
        averageWin,
        averageLoss,
        largestWin,
        largestLoss
      }
    })

    return metrics
  }
}