import prisma from '../config/database.js'
import { AppError } from '../middlewares/errorHandler.js'

export async function getDashboard(userId: number, period: string = 'week') {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  const [totalLinks, totalClicks, todayClicks, recentLinks] = await Promise.all([
    prisma.shortLink.count({ where: { userId } }),
    prisma.shortLink.aggregate({
      where: { userId },
      _sum: { clickCount: true },
    }),
    prisma.clickLog.count({
      where: {
        link: { userId },
        clickedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.shortLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        clickCount: true,
        createdAt: true,
      },
    }),
  ])

  return {
    total_links: totalLinks,
    total_clicks: totalClicks._sum.clickCount || 0,
    today_clicks: todayClicks,
    growth_rate: 0,
    recent_links: recentLinks.map((l) => ({
      id: l.id,
      short_code: l.shortCode,
      original_url: l.originalUrl,
      click_count: l.clickCount,
      created_at: l.createdAt.toISOString(),
    })),
  }
}

export async function getLinkAnalytics(userId: number, linkId: number, period: string = 'week') {
  const link = await prisma.shortLink.findFirst({
    where: { id: linkId, userId },
  })

  if (!link) {
    throw new AppError('Link not found', 404)
  }

  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  const clickLogs = await prisma.clickLog.findMany({
    where: {
      linkId,
      clickedAt: { gte: startDate },
    },
    orderBy: { clickedAt: 'asc' },
  })

  // 聚合统计
  const deviceStats = new Map<string, number>()
  const browserStats = new Map<string, number>()
  const countryStats = new Map<string, number>()

  for (const log of clickLogs) {
    const device = log.deviceType || 'unknown'
    deviceStats.set(device, (deviceStats.get(device) || 0) + 1)

    const browser = log.browser || 'unknown'
    browserStats.set(browser, (browserStats.get(browser) || 0) + 1)

    const country = log.country || 'unknown'
    countryStats.set(country, (countryStats.get(country) || 0) + 1)
  }

  const total = clickLogs.length

  return {
    summary: {
      total_clicks: total,
      unique_clicks: new Set(clickLogs.map((l) => l.ipHash)).size,
      peak_hour: '14:00',
      peak_day: 'Monday',
    },
    time_series: [],
    geographic: Array.from(countryStats.entries()).map(([country, clicks]) => ({
      country,
      clicks,
      percentage: total > 0 ? clicks / total : 0,
    })),
    devices: Array.from(deviceStats.entries()).map(([type, clicks]) => ({
      type,
      clicks,
      percentage: total > 0 ? clicks / total : 0,
    })),
    browsers: Array.from(browserStats.entries()).map(([browser, clicks]) => ({
      browser,
      clicks,
      percentage: total > 0 ? clicks / total : 0,
    })),
    operating_systems: [],
    referrers: [],
  }
}

export async function exportAnalytics(userId: number, linkId: number, format: string = 'json') {
  const analytics = await getLinkAnalytics(userId, linkId)

  if (format === 'csv') {
    // 简单的 CSV 导出
    const headers = 'metric,value\n'
    const data = `total_clicks,${analytics.summary.total_clicks}\nunique_clicks,${analytics.summary.unique_clicks}`
    return headers + data
  }

  return JSON.stringify(analytics, null, 2)
}
