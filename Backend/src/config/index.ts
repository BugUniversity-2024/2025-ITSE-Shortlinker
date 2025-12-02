import dotenv from 'dotenv'

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:8000',

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },

  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}
