// backend/src/controllers/admin.controller.ts
import { Response, NextFunction } from 'express'
import { AdminService } from '../services/admin.service'
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse'
import { AuthRequest } from '../middlewares/auth'

export class AdminController {
  private adminService: AdminService

  constructor() {
    this.adminService = new AdminService()
  }

  getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const search = req.query.search as string
      const status = req.query.status as string

      const result = await this.adminService.getUsers({ page, limit, search, status })
      return sendPaginated(res, result.users, page, limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.adminService.getUserById(req.params.id)
      return sendSuccess(res, user)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  activateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.adminService.activateUser(req.params.id, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, 'User activated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.adminService.deactivateUser(req.params.id, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, 'User deactivated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  toggleUserBot = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { enabled } = req.body
      await this.adminService.toggleUserBot(req.params.id, enabled, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, `User bot ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  resetUserApiKeys = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.adminService.resetUserApiKeys(req.params.id, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, 'API keys reset')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminService.getDashboardStats()
      return sendSuccess(res, stats)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  getAdminLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const result = await this.adminService.getAdminLogs(page, limit)
      return sendPaginated(res, result.logs, page, limit, result.total)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body
      await this.adminService.updateUserRole(req.params.id, role, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, 'User role updated')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }

  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.adminService.deleteUser(req.params.id, req.user!.userId, req.ip || '')
      return sendSuccess(res, null, 'User deleted')
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}