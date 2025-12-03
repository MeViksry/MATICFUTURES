// backend/src/controllers/bot.controller.ts
import { Response, NextFunction } from 'express'
import { BotService } from '../services/bot.service'
import { sendSuccess, sendError } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth'

export class BotController {
  private botService: BotService

  constructor() {
    this.botService = new BotService()
  }

  getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await this.botService.getSettings(req.user!.userId)
      return sendSuccess(res, settings)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const settings = await this.botService.updateSettings(req.user!.userId, req.body)
      return sendSuccess(res, settings, 'Settings updated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  toggleBot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { enabled } = req.body
      const result = await this.botService.toggleBot(req.user!.userId, enabled)
      return sendSuccess(res, result, `Bot ${enabled ? 'started' : 'stopped'}`)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = await this.botService.getStatus(req.user!.userId)
      return sendSuccess(res, status)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      
      const logs = await this.botService.getLogs(req.user!.userId, page, limit)
      return sendSuccess(res, logs)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}