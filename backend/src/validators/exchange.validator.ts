import { z } from 'zod'
export const exchangeSchemas = {
  addApiKey: z.object({
    body: z.object({
      exchange: z.enum(['binance', 'okx', 'bitget']),
      apiKey: z.string().min(1, 'API key is required'),
      secretKey: z.string().min(1, 'Secret key is required'),
      passphrase: z.string().optional()
    })
  }),

  updateApiKey: z.object({
    body: z.object({
      isActive: z.boolean().optional()
    })
  }),

  createOrder: z.object({
    body: z.object({
      symbol: z.string().min(1, 'Symbol is required'),
      side: z.enum(['buy', 'sell']),
      type: z.enum(['market', 'limit']),
      quantity: z.number().positive('Quantity must be positive'),
      price: z.number().positive().optional(),
      leverage: z.number().int().min(1).max(125).optional(),
      stopLoss: z.number().positive().optional(),
      takeProfit: z.number().positive().optional()
    })
  })
}