import { Router } from 'express'
import * as linksController from '../controllers/links.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { validateBody } from '../middlewares/validate.js'
import {
  createLinkSchema,
  updateLinkSchema,
  batchCreateSchema,
} from '../schemas/links.schema.js'

const router = Router()

// 创建链接
router.post('/create', authenticate, validateBody(createLinkSchema), linksController.createLink)
router.post('/batch', authenticate, validateBody(batchCreateSchema), linksController.batchCreate)

// 获取链接列表
router.get('/', authenticate, linksController.getLinks)

// 通过短码获取链接信息（公开）
router.get('/info/:shortCode', linksController.getLinkInfo)

// 获取单个链接
router.get('/:id', authenticate, linksController.getLinkById)

// 更新链接
router.put('/:id', authenticate, validateBody(updateLinkSchema), linksController.updateLink)

// 删除链接
router.delete('/:id', authenticate, linksController.deleteLink)

// 切换状态
router.post('/:id/toggle-status', authenticate, linksController.toggleStatus)

// QR 码生成
router.get('/qr/:shortCode', linksController.getQRCode)

export default router
