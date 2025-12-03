// backend/src/workers/metricsWorker.ts
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

class MetricsWorker {
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
    // Run every minute
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return

      try {
        await this.calculateAllMetrics()
      } catch (error) {
        logger.error('Metrics worker error:', error)
      }
    }, 60000) // 1 minute

    // Also run immediately
    await this.calculateAllMetrics()
  }

  private async calculateAllMetrics() {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true }
    })

    for (const user of users) {
      try {
        await this.calculateUserMetrics(user.id)
      } catch (error) {
        logger.error(`Failed to calculate metrics for user ${user.id}:`, error)
      }
    }

    logger.debug(`Metrics calculated for ${users.length} users`)
  }

  private async calculateUserMetrics(userId: string) {
    const trades = await prisma.tradeHistory.findMany({
      where: { userId }
    })

    if (trades.length === 0) return

    const profitableTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = profitableTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    const winRate = trades.length > 0 ? (profitableTrades.length / trades.length) * 100 : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? totalWins : 0
    
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
    let maxDrawdownPercent = 0
    let peak = 0
    let runningPnl = 0

    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
    )

    for (const trade of sortedTrades) {
      runningPnl += trade.pnl
      if (runningPnl > peak) {
        peak = runningPnl
      }
      const drawdown = peak - runningPnl
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0
      }
    }

    // Calculate total PnL percent (based on initial balance assumption)
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId }
    })
    const totalPnlPercent = portfolio && portfolio.totalBalance > 0
      ? (totalPnl / portfolio.totalBalance) * 100
      : 0

    // Update metrics
    await prisma.performanceMetrics.upsert({
      where: { userId },
      update: {
        totalPnl,
        totalPnlPercent,
        totalTrades: trades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        maxDrawdown,
        maxDrawdownPercent,
        averageWin,
        averageLoss,
        largestWin,
        largestLoss,
        lastCalculated: new Date()
      },
      create: {
        userId,
        totalPnl,
        totalPnlPercent,
        totalTrades: trades.length,
        profitableTrades: profitableTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        maxDrawdown,
        maxDrawdownPercent,
        averageWin,
        averageLoss,
        largestWin,
        largestLoss
      }
    })
  }
}

export const metricsWorker = new MetricsWorker()