export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    return formatRelativeTime(d)
  }

  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' }

  return d.toLocaleDateString('en-US', options)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minutes ago`
  if (diffHour < 24) return `${diffHour} hours ago`
  if (diffDay < 7) return `${diffDay} days ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} weeks ago`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} months ago`
  return `${Math.floor(diffDay / 365)} years ago`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%'
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  const start = url.substring(0, maxLength - 10)
  const end = url.substring(url.length - 7)
  return `${start}...${end}`
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
