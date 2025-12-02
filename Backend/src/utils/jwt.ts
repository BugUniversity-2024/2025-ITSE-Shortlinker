import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'

export interface JwtPayload {
  userId: number
  username: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload
  } catch {
    return null
  }
}
