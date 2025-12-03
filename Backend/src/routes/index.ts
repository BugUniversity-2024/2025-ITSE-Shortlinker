import { Router } from 'express'
import authRoutes from './auth.routes.js'
import linksRoutes from './links.routes.js'
import analyticsRoutes from './analytics.routes.js'
import teamsRoutes from './teams.routes.js'
import landingPagesRoutes from './landing-pages.routes.js'
import apikeyRoutes from './apikey.routes.js'

const router = Router()

// 根路由
router.get('/', (_req, res) => {
  res.json({
    name: 'TinyBridge API',
    version: '1.0.0',
    description: 'URL Shortener Service API',
  })
})

// 模块路由
router.use('/auth', authRoutes)
router.use('/links', linksRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/teams', teamsRoutes)
router.use('/landing-pages', landingPagesRoutes)
router.use('/api-keys', apikeyRoutes)

export default router
