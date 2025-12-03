import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, TokenPayload } from '../utils/jwt'
import { sendError } from '../utils/apiResponse'
import { prisma } from '../config/database'

export interface AuthRequest extends Request {
  user?: TokenPayload & { isActive: boolean }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token required', 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)

    // Get user from database to check active status
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true, isEmailVerified: true }
    })

    if (!user) {
      return sendError(res, 'User not found', 401)
    }

    req.user = {
      ...payload,
      isActive: user.isActive
    }

    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', 401)
    }
    return sendError(res, 'Invalid token', 401)
  }
}

export const requireActive = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isActive) {
    return sendError(res, 'Account not activated', 403)
  }
  next()
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return sendError(res, 'Admin access required', 403)
  }
  next()
}

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return sendError(res, 'Super admin access required', 403)
  }
  next()
}