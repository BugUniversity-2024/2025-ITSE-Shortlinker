import prisma from '../config/database.js'
import { AppError } from '../middlewares/errorHandler.js'
import crypto from 'crypto'

// 权限定义
export const PERMISSIONS = {
  LINKS_READ: 'links:read',
  LINKS_WRITE: 'links:write',
  LINKS_DELETE: 'links:delete',
  ANALYTICS_READ: 'analytics:read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// 格式化 API Key 为前端格式
function formatApiKey(apiKey: {
  id: number
  name: string
  keyHash: string
  permissions: string | null
  rateLimit: number
  isActive: boolean
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}) {
  let permissions: string[] = []
  try {
    const parsed = apiKey.permissions ? JSON.parse(apiKey.permissions) : {}
    if (Array.isArray(parsed)) {
      permissions = parsed
    } else if (typeof parsed === 'object') {
      // 兼容旧格式 { read: true, write: true }
      if (parsed.read) permissions.push(PERMISSIONS.LINKS_READ)
      if (parsed.write) permissions.push(PERMISSIONS.LINKS_WRITE)
    }
  } catch {
    permissions = []
  }

  return {
    id: apiKey.id,
    name: apiKey.name,
    key_prefix: `tb_live_${apiKey.keyHash.slice(0, 6)}...`,
    permissions,
    rate_limit: apiKey.rateLimit,
    is_active: apiKey.isActive,
    last_used_at: apiKey.lastUsedAt?.toISOString() || null,
    expires_at: apiKey.expiresAt?.toISOString() || null,
    created_at: apiKey.createdAt.toISOString(),
  }
}

// 生成 API Key
function generateApiKey(): { rawKey: string; keyHash: string } {
  const prefix = 'tb_live_'
  const randomPart = crypto.randomBytes(24).toString('hex')
  const rawKey = prefix + randomPart
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  return { rawKey, keyHash }
}

// 获取用户所有 API Keys
export async function listApiKeys(userId: number) {
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return apiKeys.map(formatApiKey)
}

// 创建新 API Key
export async function createApiKey(
  userId: number,
  data: {
    name: string
    permissions?: string[]
    rateLimit?: number
    expiresAt?: string
  }
) {
  const { rawKey, keyHash } = generateApiKey()

  const permissions = data.permissions || [
    PERMISSIONS.LINKS_READ,
    PERMISSIONS.LINKS_WRITE,
  ]

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: data.name,
      keyHash,
      permissions: JSON.stringify(permissions),
      rateLimit: data.rateLimit || 1000,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })

  // 返回完整的 key（只在创建时返回一次）
  return {
    ...formatApiKey(apiKey),
    api_key: rawKey,
    message: 'Please save this API key securely. You will not be able to see it again.',
  }
}

// 更新 API Key
export async function updateApiKey(
  userId: number,
  keyId: number,
  data: {
    name?: string
    permissions?: string[]
    rateLimit?: number
    isActive?: boolean
  }
) {
  // 确保 Key 属于该用户
  const existingKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  })

  if (!existingKey) {
    throw new AppError('API Key not found', 404)
  }

  const updateData: {
    name?: string
    permissions?: string
    rateLimit?: number
    isActive?: boolean
  } = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.permissions !== undefined) updateData.permissions = JSON.stringify(data.permissions)
  if (data.rateLimit !== undefined) updateData.rateLimit = data.rateLimit
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const apiKey = await prisma.apiKey.update({
    where: { id: keyId },
    data: updateData,
  })

  return formatApiKey(apiKey)
}

// 删除/撤销 API Key
export async function deleteApiKey(userId: number, keyId: number) {
  // 确保 Key 属于该用户
  const existingKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  })

  if (!existingKey) {
    throw new AppError('API Key not found', 404)
  }

  // 软删除：将 isActive 设为 false
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  })
}

// 获取使用统计（模拟数据）
export async function getApiKeyStats(userId: number) {
  const activeKeys = await prisma.apiKey.count({
    where: { userId, isActive: true },
  })

  // 模拟数据
  return {
    active_keys: activeKeys,
    today_requests: Math.floor(Math.random() * 200) + 50,
    month_requests: Math.floor(Math.random() * 5000) + 1000,
    quota_used: Math.floor(Math.random() * 5000) + 1000,
    quota_limit: 10000,
  }
}

// 验证 API Key（供中间件使用）
export async function validateApiKey(rawKey: string) {
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash, isActive: true },
    include: { user: true },
  })

  if (!apiKey) {
    return null
  }

  // 检查是否过期
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }

  // 更新最后使用时间
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    userId: apiKey.userId,
    permissions: apiKey.permissions ? JSON.parse(apiKey.permissions) : [],
    rateLimit: apiKey.rateLimit,
  }
}
