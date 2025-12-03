// backend/src/routes/exchange.routes.ts
import { Router } from 'express'
import { ExchangeController } from '../controllers/exchange.controller'
import { validate } from '../middlewares/validate'
import { authenticate, requireActive } from '../middlewares/auth'
import { exchangeSchemas } from '../validators/exchange.validator'

const router = Router()
const exchangeController = new ExchangeController()

router.use(authenticate)

// API Keys
router.get('/api-keys', exchangeController.getApiKeys)

router.post(
  '/api-keys',
  validate(exchangeSchemas.addApiKey),
  exchangeController.addApiKey
)

router.post(
  '/api-keys/:id/validate',
  exchangeController.validateApiKey
)

router.patch(
  '/api-keys/:id',
  validate(exchangeSchemas.updateApiKey),
  exchangeController.updateApiKey
)

router.delete('/api-keys/:id', exchangeController.deleteApiKey)

// Exchange Operations (require active account)
router.use(requireActive)

router.get('/balance', exchangeController.getBalance)
router.get('/positions', exchangeController.getPositions)
router.get('/orders', exchangeController.getOrders)
router.post('/order', validate(exchangeSchemas.createOrder), exchangeController.createOrder)
router.delete('/order/:orderId', exchangeController.cancelOrder)
router.post('/close-position', exchangeController.closePosition)

export default router