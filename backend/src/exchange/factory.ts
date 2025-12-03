import { BaseExchange, ExchangeCredentials } from './base'
import { BinanceExchange } from './binance'
import { OKXExchange } from './okx'
import { BitgetExchange } from './bitget'

export type ExchangeType = 'binance' | 'okx' | 'bitget'

export class ExchangeFactory {
  static create(
    exchange: ExchangeType,
    credentials: ExchangeCredentials
  ): BaseExchange {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return new BinanceExchange(credentials)
      case 'okx':
        return new OKXExchange(credentials)
      case 'bitget':
        return new BitgetExchange(credentials)
      default:
        throw new Error(`Unsupported exchange: ${exchange}`)
    }
  }
}