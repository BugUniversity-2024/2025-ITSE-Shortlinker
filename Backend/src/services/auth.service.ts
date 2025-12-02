import prisma from '../config/database.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import { AppError } from '../middlewares/errorHandler.js'
import crypto from 'crypto'
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateSettingsInput,
} from '../schemas/auth.schema.js'

// 格式化 User 对象为前端期望的 snake_case 格式
function formatUser(user: {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    bio: user.bio,
    avatar: user.avatarUrl,
    plan_type: 'free' as const,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  }
}

export async function register(data: RegisterInput) {
  // 检查用户名是否已存在
  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  })
  if (existingUsername) {
    throw new AppError('用户名已被使用', 409)
  }

  // 检查邮箱是否已存在
  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  })
  if (existingEmail) {
    throw new AppError('邮箱已被注册', 409)
  }

  // 创建用户
  const passwordHash = await hashPassword(data.password)
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // 创建默认设置
  await prisma.userSettings.create({
    data: { userId: user.id },
  })

  return formatUser(user)
}

export async function login(data: LoginInput) {
  // 支持用户名或邮箱登录
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.username },
      ],
    },
  })

  if (!user) {
    throw new AppError('用户名或密码错误', 401)
  }

  if (!user.isActive) {
    throw new AppError('账户已被禁用', 403)
  }

  const isValidPassword = await comparePassword(data.password, user.passwordHash)
  if (!isValidPassword) {
    throw new AppError('用户名或密码错误', 401)
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
  })

  return {
    access_token: token,
    token_type: 'Bearer',
  }
}

export async function getProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  return formatUser(user)
}

export async function updateProfile(userId: number, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      bio: data.bio,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return formatUser(user)
}

export async function changePassword(userId: number, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  const isValidPassword = await comparePassword(data.current_password, user.passwordHash)
  if (!isValidPassword) {
    throw new AppError('当前密码错误', 400)
  }

  const newPasswordHash = await hashPassword(data.new_password)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  })
}

export async function getSettings(userId: number) {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    })
  }

  return {
    email_notifications: settings.emailNotifications,
    public_profile: settings.publicProfile,
    analytics_sharing: settings.analyticsSharing,
    theme: settings.theme,
    language: settings.language,
    timezone: settings.timezone,
  }
}

export async function updateSettings(userId: number, data: UpdateSettingsInput) {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  })

  return {
    email_notifications: settings.emailNotifications,
    public_profile: settings.publicProfile,
    analytics_sharing: settings.analyticsSharing,
    theme: settings.theme,
    language: settings.language,
    timezone: settings.timezone,
  }
}

export async function getStats(userId: number) {
  const [totalLinks, activeLinks, totalClicks] = await Promise.all([
    prisma.shortLink.count({ where: { userId } }),
    prisma.shortLink.count({ where: { userId, isActive: true } }),
    prisma.shortLink.aggregate({
      where: { userId },
      _sum: { clickCount: true },
    }),
  ])

  return {
    total_links: totalLinks,
    active_links: activeLinks,
    total_clicks: totalClicks._sum.clickCount || 0,
  }
}

export async function deleteAccount(userId: number, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw new AppError('密码错误', 400)
  }

  // 级联删除会处理相关数据
  await prisma.user.delete({
    where: { id: userId },
  })
}

// 获取或创建 API 密钥
export async function getApiKey(userId: number) {
  // 查找现有的活跃 API 密钥
  let apiKey = await prisma.apiKey.findFirst({
    where: { userId, isActive: true },
  })

  // 如果没有，创建一个新的
  if (!apiKey) {
    const rawKey = crypto.randomBytes(32).toString('hex')
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

    apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: 'Default API Key',
        keyHash,
        permissions: JSON.stringify({ read: true, write: true }),
      },
    })

    // 返回原始密钥（只在创建时返回一次）
    return { api_key: rawKey, is_new: true }
  }

  // 已有密钥，返回提示（不能返回原始密钥，因为只存储了哈希）
  return { api_key: `sk_****${apiKey.keyHash.slice(-8)}`, is_new: false }
}

// 刷新 Token
export async function refreshToken(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, isActive: true },
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  if (!user.isActive) {
    throw new AppError('账户已被禁用', 403)
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
  })

  return {
    access_token: token,
    token_type: 'Bearer',
  }
}

// 导出用户数据
export async function exportUserData(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      links: {
        include: {
          clickLogs: true,
          landingPage: true,
        },
      },
      ownedTeams: {
        include: {
          members: true,
        },
      },
      teamMembers: {
        include: {
          team: true,
        },
      },
      apiKeys: {
        select: {
          id: true,
          name: true,
          permissions: true,
          rateLimit: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  // 移除敏感信息
  const { passwordHash: _, ...userData } = user

  return {
    exported_at: new Date().toISOString(),
    user: {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      full_name: userData.fullName,
      phone: userData.phone,
      bio: userData.bio,
      avatar: userData.avatarUrl,
      created_at: userData.createdAt.toISOString(),
      updated_at: userData.updatedAt.toISOString(),
    },
    settings: userData.settings ? {
      email_notifications: userData.settings.emailNotifications,
      public_profile: userData.settings.publicProfile,
      analytics_sharing: userData.settings.analyticsSharing,
      theme: userData.settings.theme,
      language: userData.settings.language,
      timezone: userData.settings.timezone,
    } : null,
    links: userData.links.map(link => ({
      id: link.id,
      original_url: link.originalUrl,
      short_code: link.shortCode,
      title: link.title,
      description: link.description,
      tags: link.tags,
      click_count: link.clickCount,
      is_active: link.isActive,
      created_at: link.createdAt.toISOString(),
      click_logs_count: link.clickLogs.length,
      has_landing_page: !!link.landingPage,
    })),
    teams: {
      owned: userData.ownedTeams.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        member_count: t.members.length,
        created_at: t.createdAt.toISOString(),
      })),
      member_of: userData.teamMembers.map(tm => ({
        team_id: tm.team.id,
        team_name: tm.team.name,
        role: tm.role,
        joined_at: tm.joinedAt.toISOString(),
      })),
    },
    api_keys: userData.apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      is_active: key.isActive,
      created_at: key.createdAt.toISOString(),
    })),
  }
}
