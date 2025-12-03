export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  address: string
  isActive: boolean
  isEmailVerified: boolean
  subscription: Subscription
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  plan: 'free' | 'monthly' | 'yearly'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
}

export interface ApiKey {
  id: string
  userId: string
  exchange: 'binance' | 'okx' | 'bitget'
  apiKey: string
  isActive: boolean
  isValid: boolean
  lastValidated: string
  createdAt: string
}

export interface Position {
  id: string
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  markPrice: number
  leverage: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  liquidationPrice: number
  margin: number
  exchange: string
  createdAt: string
}

export interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop'
  status: 'open' | 'filled' | 'cancelled' | 'failed'
  price: number
  quantity: number
  filledQuantity: number
  leverage: number
  pnl?: number
  pnlPercent?: number
  exchange: string
  createdAt: string
  closedAt?: string
}

export interface Portfolio {
  totalBalance: number
  availableBalance: number
  unrealizedPnl: number
  equity: number
  marginUsed: number
  marginAvailable: number
  positions: Position[]
}

export interface TradeHistory {
  id: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  quantity: number
  leverage: number
  pnl: number
  pnlPercent: number
  duration: number
  exchange: string
  openedAt: string
  closedAt: string
}

export interface PerformanceMetrics {
  totalPnl: number
  totalPnlPercent: number
  totalTrades: number
  profitableTrades: number
  winRate: number
  profitFactor: number
  maxDrawdown: number
  maxDrawdownPercent: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
}

export interface WebhookConfig {
  id: string
  userId: string
  token: string
  url: string
  isActive: boolean
  lastTriggered?: string
  totalTriggers: number
  createdAt: string
}

export interface WebhookLog {
  id: string
  webhookId: string
  payload: any
  status: 'success' | 'failed' | 'pending'
  response?: any
  error?: string
  processedAt: string
  createdAt: string
}

export interface BotSettings {
  id: string
  userId: string
  isEnabled: boolean
  maxPositions: number
  defaultLeverage: number
  maxLeverage: number
  riskPerTrade: number
  stopLossPercent: number
  takeProfitPercent: number
  trailingStop: boolean
  trailingStopPercent?: number
  allowedSymbols: string[]
  blacklistedSymbols: string[]
  tradingHours?: {
    start: string
    end: string
    timezone: string
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  data?: any
  createdAt: string
}

export interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
  plan: 'monthly' | 'yearly'
}

export interface AdminUser extends User {
  apiKeys: ApiKey[]
  portfolio?: Portfolio
  metrics?: PerformanceMetrics
  lastLogin?: string
  errorLogs?: any[]
}