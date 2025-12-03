// backend/src/routes/portfolio.routes.ts
import { Router } from 'express'
import { PortfolioController } from '../controllers/portfolio.controller'
import { authenticate } from '../middlewares/auth'

const router = Router()
const portfolioController = new PortfolioController()

router.use(authenticate)

router.get('/', portfolioController.getPortfolio)
router.get('/history', portfolioController.getTradeHistory)
router.get('/metrics', portfolioController.getMetrics)
router.post('/sync', portfolioController.syncPortfolio)

export default router