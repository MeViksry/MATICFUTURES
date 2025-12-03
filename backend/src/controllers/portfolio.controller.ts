// backend/src/controllers/portfolio.controller.ts
import { Response, NextFunction } from 'express'
import { PortfolioService } from '../services/portfolio.service'
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth'

export class PortfolioController {
  private portfolioService: PortfolioService

  constructor() {
    this.portfolioService = new PortfolioService()
  }

  getPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolio = await this.portfolioService.getPortfolio(req.user!.userId)
      return sendSuccess(res, portfolio)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getTradeHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      
      const result = await this.portfolioService.getTradeHistory(req.user!.userId, page, limit)
      return sendPaginated(res, result.trades, page, limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.portfolioService.getMetrics(req.user!.userId)
      return sendSuccess(res, metrics)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  syncPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const portfolio = await this.portfolioService.syncPortfolio(req.user!.userId)
      return sendSuccess(res, portfolio, 'Portfolio synced')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}