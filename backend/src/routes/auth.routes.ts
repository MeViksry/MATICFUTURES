// backend/src/routes/auth.routes.ts
import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { validate } from '../middlewares/validate'
import { authenticate } from '../middlewares/auth'
import { authLimiter } from '../middlewares/rateLimiter'
import { authSchemas } from '../validators/auth.validator'

const router = Router()
const authController = new AuthController()

router.post(
  '/register',
  validate(authSchemas.register),
  authController.register
)

router.post(
  '/login',
  authLimiter,
  validate(authSchemas.login),
  authController.login
)

router.post(
  '/verify-email',
  authenticate,
  validate(authSchemas.verifyEmail),
  authController.verifyEmail
)

router.post(
  '/resend-verification',
  authenticate,
  authController.resendVerification
)

router.post(
  '/forgot-password',
  authLimiter,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
)

router.post(
  '/reset-password',
  validate(authSchemas.resetPassword),
  authController.resetPassword
)

router.post(
  '/refresh',
  validate(authSchemas.refresh),
  authController.refreshToken
)

router.get(
  '/profile',
  authenticate,
  authController.getProfile
)

router.put(
  '/profile',
  authenticate,
  validate(authSchemas.updateProfile),
  authController.updateProfile
)

router.post(
  '/change-password',
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword
)

router.post(
  '/logout',
  authenticate,
  authController.logout
)

export default router