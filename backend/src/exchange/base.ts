export interface ExchangeCredentials {
  apiKey: string
  secretKey: string
  passphrase?: string
}

export interface Balance {
  totalBalance: number
  availableBalance: number
  unrealizedPnl?: number
  equity?: number
  marginUsed?: number
  marginAvailable?: number
}

export interface Position {
  id?: string
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  markPrice: number
  leverage: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  liquidationPrice?: number
  margin: number
}

export interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: string
  status: string
  price?: number | null
  quantity: number
  filledQuantity: number
  createdAt: Date
}

export interface OrderParams {
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  quantity: number
  price?: number
  leverage?: number
  stopLoss?: number
  takeProfit?: number
  reduceOnly?: boolean
}

export abstract class BaseExchange {
  protected credentials: ExchangeCredentials

  constructor(credentials: ExchangeCredentials) {
    this.credentials = credentials
  }

  abstract getName(): string
  abstract getBalance(): Promise<Balance>
  abstract getPositions(): Promise<Position[]>
  abstract getOpenOrders(symbol?: string): Promise<Order[]>
  abstract createOrder(params: OrderParams): Promise<Order>
  abstract cancelOrder(orderId: string, symbol?: string): Promise<boolean>
  abstract closePosition(symbol: string): Promise<Order>
  abstract setLeverage(symbol: string, leverage: number): Promise<boolean>
}