// backend/src/routes/bot.routes.ts
import { Router } from 'express'
import { BotController } from '../controllers/bot.controller'
import { validate } from '../middlewares/validate'
import { authenticate, requireActive } from '../middlewares/auth'
import { botSchemas } from '../validators/bot.validator'

const router = Router()
const botController = new BotController()

router.use(authenticate)

router.get('/settings', botController.getSettings)

router.patch(
  '/settings',
  validate(botSchemas.updateSettings),
  botController.updateSettings
)

router.post(
  '/toggle',
  requireActive,
  botController.toggleBot
)

router.get('/status', botController.getStatus)
router.get('/logs', botController.getLogs)

export default router