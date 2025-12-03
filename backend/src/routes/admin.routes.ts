// backend/src/routes/admin.routes.ts
import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { validate } from '../middlewares/validate'
import { authenticate, requireAdmin, requireSuperAdmin } from '../middlewares/auth'
import { adminSchemas } from '../validators/admin.validator'

const router = Router()
const adminController = new AdminController()

router.use(authenticate, requireAdmin)

// Users Management
router.get('/users', adminController.getUsers)
router.get('/users/:id', adminController.getUserById)
router.patch(
  '/users/:id/activate',
  adminController.activateUser
)
router.patch(
  '/users/:id/deactivate',
  adminController.deactivateUser
)
router.patch(
  '/users/:id/toggle-bot',
  adminController.toggleUserBot
)
router.delete(
  '/users/:id/reset-api-keys',
  adminController.resetUserApiKeys
)

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats)
router.get('/logs', adminController.getAdminLogs)

// Super Admin Only
router.use(requireSuperAdmin)
router.patch(
  '/users/:id/role',
  validate(adminSchemas.updateRole),
  adminController.updateUserRole
)
router.delete('/users/:id', adminController.deleteUser)

export default router