import prisma from '../config/database.js'
import { config } from '../config/index.js'
import { generateShortCode, isValidShortCode } from '../utils/shortCode.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { CreateLinkInput, UpdateLinkInput, ListLinksQuery } from '../schemas/links.schema.js'

export async function createLink(userId: number, data: CreateLinkInput) {
  let shortCode = data.short_code

  if (shortCode) {
    if (!isValidShortCode(shortCode)) {
      throw new AppError('短码格式无效', 400)
    }
    const existing = await prisma.shortLink.findUnique({
      where: { shortCode },
    })
    if (existing) {
      throw new AppError('短码已被使用', 409)
    }
  } else {
    // 生成唯一短码
    let attempts = 0
    do {
      shortCode = generateShortCode()
      const existing = await prisma.shortLink.findUnique({
        where: { shortCode },
      })
      if (!existing) break
      attempts++
    } while (attempts < 10)

    if (attempts >= 10) {
      throw new AppError('无法生成唯一短码，请稍后重试', 500)
    }
  }

  const link = await prisma.shortLink.create({
    data: {
      userId,
      originalUrl: data.original_url,
      shortCode: shortCode!,
      title: data.title,
      description: data.description,
      tags: data.tags,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    },
  })

  return formatLink(link)
}

export async function batchCreate(userId: number, urls: string[]) {
  const created: ReturnType<typeof formatLink>[] = []
  const failed: { url: string; error: string }[] = []

  for (const url of urls) {
    try {
      const link = await createLink(userId, { original_url: url })
      created.push(link)
    } catch (error) {
      failed.push({
        url,
        error: error instanceof Error ? error.message : '创建失败',
      })
    }
  }

  return { created, failed }
}

export async function getLinks(userId: number, query: ListLinksQuery) {
  const { page, limit, sort, search } = query
  const skip = (page - 1) * limit

  const where = {
    userId,
    ...(search && {
      OR: [
        { title: { contains: search } },
        { originalUrl: { contains: search } },
        { shortCode: { contains: search } },
        { tags: { contains: search } },
      ],
    }),
  }

  const orderBy = sort === 'click_count'
    ? { clickCount: 'desc' as const }
    : sort === 'title'
    ? { title: 'asc' as const }
    : { createdAt: 'desc' as const }

  const [links, total] = await Promise.all([
    prisma.shortLink.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.shortLink.count({ where }),
  ])

  return {
    links: links.map(formatLink),
    pagination: { page, limit, total },
  }
}

export async function getLinkById(userId: number, linkId: number) {
  const link = await prisma.shortLink.findFirst({
    where: { id: linkId, userId },
  })

  if (!link) {
    throw new AppError('链接不存在', 404)
  }

  return formatLink(link)
}

export async function getLinkByShortCode(shortCode: string) {
  const link = await prisma.shortLink.findUnique({
    where: { shortCode },
  })

  if (!link) {
    throw new AppError('链接不存在', 404)
  }

  return formatLink(link)
}

export async function updateLink(userId: number, linkId: number, data: UpdateLinkInput) {
  const existing = await prisma.shortLink.findFirst({
    where: { id: linkId, userId },
  })

  if (!existing) {
    throw new AppError('链接不存在', 404)
  }

  const link = await prisma.shortLink.update({
    where: { id: linkId },
    data: {
      title: data.title,
      description: data.description,
      tags: data.tags,
      isActive: data.is_active,
      expiresAt: data.expires_at === null ? null : data.expires_at ? new Date(data.expires_at) : undefined,
    },
  })

  return formatLink(link)
}

export async function deleteLink(userId: number, linkId: number) {
  const existing = await prisma.shortLink.findFirst({
    where: { id: linkId, userId },
  })

  if (!existing) {
    throw new AppError('链接不存在', 404)
  }

  await prisma.shortLink.delete({
    where: { id: linkId },
  })
}

export async function toggleStatus(userId: number, linkId: number) {
  const existing = await prisma.shortLink.findFirst({
    where: { id: linkId, userId },
  })

  if (!existing) {
    throw new AppError('链接不存在', 404)
  }

  const link = await prisma.shortLink.update({
    where: { id: linkId },
    data: { isActive: !existing.isActive },
  })

  return formatLink(link)
}

function formatLink(link: {
  id: number
  userId: number
  teamId: number | null
  originalUrl: string
  shortCode: string
  title: string | null
  description: string | null
  tags: string | null
  clickCount: number
  isActive: boolean
  isPublic: boolean
  password: string | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: link.id,
    user_id: link.userId,
    team_id: link.teamId,
    original_url: link.originalUrl,
    short_code: link.shortCode,
    short_url: `${config.baseUrl}/${link.shortCode}`,
    title: link.title,
    description: link.description,
    tags: link.tags,
    click_count: link.clickCount,
    is_active: link.isActive,
    is_public: link.isPublic,
    expires_at: link.expiresAt?.toISOString() ?? null,
    created_at: link.createdAt.toISOString(),
    updated_at: link.updatedAt.toISOString(),
  }
}
