// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { generateTokenPair, verifyRefreshToken, TokenPayload } from '../utils/jwt'
import { generateToken } from '../utils/encryption'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email'
import { logger } from '../utils/logger'

export class AuthService {
  async register(data: {
    email: string
    password: string
    fullName: string
    phone?: string
    address?: string
    plan: 'monthly' | 'yearly'
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verifyExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Create user with subscription
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        emailVerifyCode: verifyCode,
        emailVerifyExpiry: verifyExpiry,
        subscription: {
          create: {
            plan: data.plan === 'yearly' ? 'YEARLY' : 'MONTHLY',
            status: 'PENDING'
          }
        },
        portfolio: {
          create: {}
        },
        botSettings: {
          create: {}
        }
      },
      include: {
        subscription: true
      }
    })

    // Send verification email
    await sendVerificationEmail(data.email, verifyCode)

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const { password: _, emailVerifyCode: __, ...userWithoutSensitive } = user

    return {
      user: userWithoutSensitive,
      ...tokens
    }
  }

  async login(email: string, password: string, ipAddress: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true
      }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress
      }
    })

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const { password: _, emailVerifyCode: __, resetPasswordToken: ___, ...userWithoutSensitive } = user

    return {
      user: userWithoutSensitive,
      ...tokens
    }
  }

  async verifyEmail(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified')
    }

    if (user.emailVerifyCode !== code) {
      throw new Error('Invalid verification code')
    }

    if (user.emailVerifyExpiry && new Date() > user.emailVerifyExpiry) {
      throw new Error('Verification code expired')
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifyCode: null,
        emailVerifyExpiry: null
      }
    })

    return true
  }

  async resendVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified')
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verifyExpiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyCode: verifyCode,
        emailVerifyExpiry: verifyExpiry
      }
    })

    await sendVerificationEmail(user.email, verifyCode)

    return true
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists
      return true
    }

    const resetToken = generateToken(32)
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry
      }
    })

    await sendPasswordResetEmail(email, resetToken)

    return true
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    })

    return true
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken)

      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      return tokens
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const { password, emailVerifyCode, resetPasswordToken, ...userWithoutSensitive } = user

    return userWithoutSensitive
  }

  async updateProfile(userId: string, data: {
    fullName?: string
    phone?: string
    address?: string
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        subscription: true
      }
    })

    const { password, emailVerifyCode, resetPasswordToken, ...userWithoutSensitive } = user

    return userWithoutSensitive
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return true
  }
}