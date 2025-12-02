export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
}

export const PLAN_TYPES = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const

export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
} as const

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  OTHER: 'other'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LINKS: '/dashboard/links',
  ANALYTICS: '/dashboard/analytics',
  TEAMS: '/dashboard/teams',
  LANDING_PAGES: '/dashboard/landing-pages',
  PROFILE: '/profile',
  GENERATOR: '/generator'
} as const
