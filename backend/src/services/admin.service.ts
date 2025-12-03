// backend/src/services/admin.service.ts
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

export class AdminService {
  async getUsers(params: {
    page: number
    limit: number
    search?: string
    status?: string
  }) {
    const { page, limit, search, status } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          subscription: true,
          _count: {
            select: {
              apiKeys: true,
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return { users, total }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        apiKeys: {
          select: {
            id: true,
            exchange: true,
            isActive: true,
            isValid: true,
            lastValidated: true,
            createdAt: true
          }
        },
        portfolio: true,
        botSettings: true,
        _count: {
          select: {
            orders: true,
            tradeHistory: true,
            webhookLogs: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get performance metrics
    const metrics = await prisma.performanceMetrics.findUnique({
      where: { userId }
    })

    const { password, emailVerifyCode, resetPasswordToken, ...userWithoutSensitive } = user

    return {
      ...userWithoutSensitive,
      metrics
    }
  }

  async activateUser(userId: string, adminId: string, ipAddress: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    })

    // Update subscription status
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    await this.logAdminAction(adminId, userId, 'ACTIVATE_USER', {}, ipAddress)

    logger.info(`User ${userId} activated by admin ${adminId}`)
  }

  async deactivateUser(userId: string, adminId: string, ipAddress: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    // Disable bot
    await prisma.botSettings.update({
      where: { userId },
      data: { isEnabled: false }
    })

    await this.logAdminAction(adminId, userId, 'DEACTIVATE_USER', {}, ipAddress)

    logger.info(`User ${userId} deactivated by admin ${adminId}`)
  }

  async toggleUserBot(userId: string, enabled: boolean, adminId: string, ipAddress: string) {
    await prisma.botSettings.update({
      where: { userId },
      data: { isEnabled: enabled }
    })

    await this.logAdminAction(adminId, userId, enabled ? 'ENABLE_BOT' : 'DISABLE_BOT', {}, ipAddress)

    logger.info(`Bot ${enabled ? 'enabled' : 'disabled'} for user ${userId} by admin ${adminId}`)
  }

  async resetUserApiKeys(userId: string, adminId: string, ipAddress: string) {
    await prisma.apiKey.deleteMany({
      where: { userId }
    })

    // Disable bot since no API keys
    await prisma.botSettings.update({
      where: { userId },
      data: { isEnabled: false }
    })

    await this.logAdminAction(adminId, userId, 'RESET_API_KEYS', {}, ipAddress)

    logger.info(`API keys reset for user ${userId} by admin ${adminId}`)
  }

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalApiKeys,
      validApiKeys,
      activeBots,
      totalTrades,
      totalVolume
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.apiKey.count(),
      prisma.apiKey.count({ where: { isValid: true } }),
      prisma.botSettings.count({ where: { isEnabled: true } }),
      prisma.tradeHistory.count(),
      prisma.tradeHistory.aggregate({
        _sum: { quantity: true }
      })
    ])

    // Get recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentSignups = await prisma.user.count({
      where: {
        createdAt: { gte: weekAgo }
      }
    })

    // Get total PnL
    const totalPnl = await prisma.tradeHistory.aggregate({
      _sum: { pnl: true }
    })

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalApiKeys,
      validApiKeys,
      activeBots,
      totalTrades,
      totalVolume: totalVolume._sum.quantity || 0,
      totalPnl: totalPnl._sum.pnl || 0,
      recentSignups
    }
  }

  async getAdminLogs(page: number, limit: number) {
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          },
          targetUser: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.adminLog.count()
    ])

    return { logs, total }
  }

  async updateUserRole(userId: string, role: string, adminId: string, ipAddress: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as any }
    })

    await this.logAdminAction(adminId, userId, 'UPDATE_ROLE', { newRole: role }, ipAddress)

    logger.info(`User ${userId} role updated to ${role} by admin ${adminId}`)
  }

  async deleteUser(userId: string, adminId: string, ipAddress: string) {
    await prisma.user.delete({
      where: { id: userId }
    })

    await this.logAdminAction(adminId, userId, 'DELETE_USER', {}, ipAddress)

    logger.info(`User ${userId} deleted by admin ${adminId}`)
  }

  private async logAdminAction(
    adminId: string,
    targetUserId: string | null,
    action: string,
    details: any,
    ipAddress: string
  ) {
    await prisma.adminLog.create({
      data: {
        adminId,
        targetUserId,
        action,
        details,
        ipAddress
      }
    })
  }
}