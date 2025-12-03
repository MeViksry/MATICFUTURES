// backend/src/routes/webhook.routes.ts
import { Router } from 'express'
import { WebhookController } from '../controllers/webhook.controller'
import { authenticate } from '../middlewares/auth'
import { webhookLimiter } from '../middlewares/rateLimiter'

const router = Router()
const webhookController = new WebhookController()

// Public webhook endpoint (for TradingView)
router.post(
  '/:userId/:token',
  webhookLimiter,
  webhookController.handleWebhook
)

// Protected routes
router.use(authenticate)

router.get('/config', webhookController.getConfig)
router.post('/generate', webhookController.generateWebhook)
router.post('/regenerate', webhookController.regenerateWebhook)
router.get('/logs', webhookController.getLogs)
router.patch('/toggle', webhookController.toggleWebhook)

export default router