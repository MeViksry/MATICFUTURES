import Redis from 'ioredis'
import { config } from './env'
import { logger } from '../utils/logger'

let redis: Redis | null = null

export const initializeRedis = async (): Promise<Redis> => {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  })

  redis.on('connect', () => {
    logger.info('Redis connected')
  })

  redis.on('error', (err) => {
    logger.error('Redis error:', err)
  })

  return redis
}

export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error('Redis not initialized')
  }
  return redis
}

export { redis }