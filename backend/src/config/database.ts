// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
})

prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning:', e)
})

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error:', e)
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}