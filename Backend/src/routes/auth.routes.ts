import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
  deleteAccountSchema,
} from '../schemas/auth.schema.js'

const router = Router()

// 公开路由
router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', validateBody(loginSchema), authController.login)

// 需要认证的路由
router.get('/profile', authenticate, authController.getProfile)
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile)
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword)
router.get('/settings', authenticate, authController.getSettings)
router.put('/settings', authenticate, validateBody(updateSettingsSchema), authController.updateSettings)
router.get('/stats', authenticate, authController.getStats)
router.delete('/account', authenticate, validateBody(deleteAccountSchema), authController.deleteAccount)

// 新增：API 密钥、Token 刷新、数据导出
router.get('/api-key', authenticate, authController.getApiKey)
router.post('/refresh', authenticate, authController.refreshToken)
router.get('/export', authenticate, authController.exportUserData)

export default router
