// backend/src/validators/bot.validator.ts
import { z } from 'zod'

export const botSchemas = {
  updateSettings: z.object({
    body: z.object({
      isEnabled: z.boolean().optional(),
      maxPositions: z.number().int().min(1).max(20).optional(),
      defaultLeverage: z.number().int().min(1).max(125).optional(),
      maxLeverage: z.number().int().min(1).max(125).optional(),
      riskPerTrade: z.number().min(0.1).max(100).optional(),
      stopLossPercent: z.number().min(0.1).max(100).optional(),
      takeProfitPercent: z.number().min(0.1).max(1000).optional(),
      trailingStop: z.boolean().optional(),
      trailingStopPercent: z.number().min(0.1).max(50).optional(),
      allowedSymbols: z.array(z.string()).optional(),
      blacklistedSymbols: z.array(z.string()).optional()
    })
  })
}