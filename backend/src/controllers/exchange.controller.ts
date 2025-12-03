// backend/src/controllers/exchange.controller.ts
import { Response, NextFunction } from 'express'
import { ExchangeService } from '../services/exchange.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth'

export class ExchangeController {
  private exchangeService: ExchangeService

  constructor() {
    this.exchangeService = new ExchangeService()
  }

  getApiKeys = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const apiKeys = await this.exchangeService.getApiKeys(req.user!.userId)
      return sendSuccess(res, apiKeys)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  addApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const apiKey = await this.exchangeService.addApiKey(req.user!.userId, req.body)
      return sendSuccess(res, apiKey, 'API key added successfully', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  validateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.exchangeService.validateApiKey(req.user!.userId, req.params.id)
      return sendSuccess(res, result, 'API key validated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  updateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const apiKey = await this.exchangeService.updateApiKey(
        req.user!.userId,
        req.params.id,
        req.body
      )
      return sendSuccess(res, apiKey, 'API key updated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  deleteApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.exchangeService.deleteApiKey(req.user!.userId, req.params.id)
      return sendSuccess(res, null, 'API key deleted')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const balance = await this.exchangeService.getBalance(req.user!.userId)
      return sendSuccess(res, balance)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getPositions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const positions = await this.exchangeService.getPositions(req.user!.userId)
      return sendSuccess(res, positions)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await this.exchangeService.getOrders(req.user!.userId)
      return sendSuccess(res, orders)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await this.exchangeService.createOrder(req.user!.userId, req.body)
      return sendSuccess(res, order, 'Order created', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.exchangeService.cancelOrder(req.user!.userId, req.params.orderId)
      return sendSuccess(res, null, 'Order cancelled')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  closePosition = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.exchangeService.closePosition(req.user!.userId, req.body)
      return sendSuccess(res, result, 'Position closed')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}