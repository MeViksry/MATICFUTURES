// backend/src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit'
import { sendError } from '../utils/apiResponse'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

export const webhookLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each IP to 10 requests per second
  message: { success: false, message: 'Webhook rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false
})