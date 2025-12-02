import { Router } from 'express'
import * as analyticsController from '../controllers/analytics.controller.js'
import { authenticate } from '../middlewares/auth.js'

const router = Router()

router.get('/dashboard', authenticate, analyticsController.getDashboard)
router.get('/links/:id', authenticate, analyticsController.getLinkAnalytics)
router.get('/export/:id', authenticate, analyticsController.exportAnalytics)

export default router
