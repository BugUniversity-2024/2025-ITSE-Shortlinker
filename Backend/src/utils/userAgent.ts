import { UAParser } from 'ua-parser-js'

export interface ParsedUserAgent {
  browser: string | undefined
  os: string | undefined
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'other'
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'other' = 'desktop'
  const device = result.device.type

  if (device === 'mobile') {
    deviceType = 'mobile'
  } else if (device === 'tablet') {
    deviceType = 'tablet'
  } else if (!device) {
    deviceType = 'desktop'
  } else {
    deviceType = 'other'
  }

  return {
    browser: result.browser.name,
    os: result.os.name,
    deviceType,
  }
}
