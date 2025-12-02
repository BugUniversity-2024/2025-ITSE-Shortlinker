import { nanoid } from 'nanoid'

const SHORT_CODE_LENGTH = 6

export function generateShortCode(length = SHORT_CODE_LENGTH): string {
  return nanoid(length)
}

export function isValidShortCode(code: string): boolean {
  // 短码只允许字母数字和 - _
  return /^[a-zA-Z0-9_-]+$/.test(code) && code.length >= 3 && code.length <= 20
}
