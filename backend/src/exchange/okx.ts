import ccxt from 'ccxt'
import { BaseExchange, ExchangeCredentials, Balance, Position, Order, OrderParams } from './base'
import { logger } from '../utils/logger'

export class OKXExchange extends BaseExchange {
  private client: InstanceType<typeof ccxt.okx>

  constructor(credentials: ExchangeCredentials) {
    super(credentials)
    this.client = new ccxt.okx({
      apiKey: credentials.apiKey,
      secret: credentials.secretKey,
      password: credentials.passphrase,
      enableRateLimit: true,
      options: {
        defaultType: 'swap'
      }
    })
  }

  getName(): string {
    return 'okx'
  }

  async getBalance(): Promise<Balance> {
    try {
      const balance = await this.client.fetchBalance({ type: 'swap' })
      const info = balance.info as any
      const data = info?.data?.[0] || {}

      return {
        totalBalance: parseFloat(data.totalEq || '0'),
        availableBalance: parseFloat(data.availBal || '0'),
        unrealizedPnl: parseFloat(data.upl || '0'),
        equity: parseFloat(data.eq || '0'),
        marginUsed: parseFloat(data.imr || '0'),
        marginAvailable: parseFloat(data.availBal || '0')
      }
    } catch (error: any) {
      logger.error('OKX getBalance error:', error.message)
      throw new Error('Failed to get balance: ' + error.message)
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      const positions = await this.client.fetchPositions()

      return positions
        .filter((p: any) => parseFloat(p.contracts) !== 0)
        .map((p: any) => ({
          id: p.id || p.symbol + '-' + p.side,
          symbol: p.symbol,
          side: p.side === 'long' ? 'long' as const : 'short' as const,
          size: Math.abs(parseFloat(p.contracts || '0')),
          entryPrice: parseFloat(p.entryPrice || '0'),
          markPrice: parseFloat(p.markPrice || '0'),
          leverage: parseInt(p.leverage || '1'),
          unrealizedPnl: parseFloat(p.unrealizedPnl || '0'),
          unrealizedPnlPercent: parseFloat(p.percentage || '0'),
          liquidationPrice: parseFloat(p.liquidationPrice || '0'),
          margin: parseFloat(p.initialMargin || '0')
        }))
    } catch (error: any) {
      logger.error('OKX getPositions error:', error.message)
      throw new Error('Failed to get positions: ' + error.message)
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      const orders = await this.client.fetchOpenOrders(symbol)

      return orders.map((o: any) => ({
        id: String(o.id || ''),
        symbol: String(o.symbol || ''),
        side: o.side === 'buy' ? 'buy' as const : 'sell' as const,
        type: String(o.type || 'market'),
        status: String(o.status || 'open'),
        price: o.price ?? null,
        quantity: Number(o.amount || 0),
        filledQuantity: Number(o.filled || 0),
        createdAt: new Date(o.timestamp || Date.now())
      }))
    } catch (error: any) {
      logger.error('OKX getOpenOrders error:', error.message)
      throw new Error('Failed to get orders: ' + error.message)
    }
  }

  async createOrder(params: OrderParams): Promise<Order> {
    try {
      const order: any = await this.client.createOrder(
        params.symbol,
        params.type,
        params.side,
        params.quantity,
        params.price,
        { tdMode: 'cross' }
      )

      return {
        id: String(order.id || ''),
        symbol: String(order.symbol || ''),
        side: order.side === 'buy' ? 'buy' as const : 'sell' as const,
        type: String(order.type || 'market'),
        status: String(order.status || 'open'),
        price: order.price ?? null,
        quantity: Number(order.amount || 0),
        filledQuantity: Number(order.filled || 0),
        createdAt: new Date(order.timestamp || Date.now())
      }
    } catch (error: any) {
      logger.error('OKX createOrder error:', error.message)
      throw new Error('Failed to create order: ' + error.message)
    }
  }

  async cancelOrder(orderId: string, symbol?: string): Promise<boolean> {
    try {
      await this.client.cancelOrder(orderId, symbol)
      return true
    } catch (error: any) {
      logger.error('OKX cancelOrder error:', error.message)
      throw new Error('Failed to cancel order: ' + error.message)
    }
  }

  async closePosition(symbol: string): Promise<Order> {
    try {
      const positions = await this.getPositions()
      const position = positions.find(p => p.symbol === symbol || p.symbol.includes(symbol))

      if (!position) {
        throw new Error('Position not found')
      }

      const side = position.side === 'long' ? 'sell' : 'buy'

      const order: any = await this.client.createOrder(
        symbol,
        'market',
        side,
        position.size,
        undefined,
        { reduceOnly: true }
      )

      return {
        id: String(order.id || ''),
        symbol: String(order.symbol || ''),
        side: order.side === 'buy' ? 'buy' as const : 'sell' as const,
        type: String(order.type || 'market'),
        status: String(order.status || 'open'),
        price: order.price ?? null,
        quantity: Number(order.amount || 0),
        filledQuantity: Number(order.filled || 0),
        createdAt: new Date(order.timestamp || Date.now())
      }
    } catch (error: any) {
      logger.error('OKX closePosition error:', error.message)
      throw new Error('Failed to close position: ' + error.message)
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<boolean> {
    try {
      await this.client.setLeverage(leverage, symbol, { mgnMode: 'cross' })
      return true
    } catch (error: any) {
      logger.error('OKX setLeverage error:', error.message)
      throw new Error('Failed to set leverage: ' + error.message)
    }
  }
}