import { Router } from 'express'
import * as apikeyController from '../controllers/apikey.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

// 所有路由都需要认证
router.use(authenticate)

// API Keys CRUD
router.get('/', apikeyController.listApiKeys)
router.post('/', apikeyController.createApiKey)
router.put('/:id', apikeyController.updateApiKey)
router.delete('/:id', apikeyController.deleteApiKey)

// 使用统计
router.get('/stats', apikeyController.getApiKeyStats)

export default router
