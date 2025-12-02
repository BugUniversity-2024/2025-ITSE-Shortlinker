export const validators = {
  isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  isUrl(value: string): boolean {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  isStrongPassword(value: string): boolean {
    // At least 8 characters, including uppercase, lowercase letters and numbers
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(value)
  },

  minLength(value: string, min: number): boolean {
    return value.length >= min
  },

  maxLength(value: string, max: number): boolean {
    return value.length <= max
  },

  isShortCode(value: string): boolean {
    // Only letters, numbers and hyphens allowed, 3-32 characters
    const shortCodeRegex = /^[a-zA-Z0-9-]{3,32}$/
    return shortCodeRegex.test(value)
  },

  isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0
  }
}

export function validateRequired(value: string | null | undefined, fieldName: string): string | null {
  if (validators.isEmpty(value)) {
    return `${fieldName} is required`
  }
  return null
}

export function validateEmail(value: string): string | null {
  if (!validators.isEmail(value)) {
    return 'Please enter a valid email address'
  }
  return null
}

export function validateUrl(value: string): string | null {
  if (!validators.isUrl(value)) {
    return 'Please enter a valid URL'
  }
  return null
}

export function validatePassword(value: string): string | null {
  if (!validators.minLength(value, 8)) {
    return 'Password must be at least 8 characters'
  }
  if (!validators.isStrongPassword(value)) {
    return 'Password must contain uppercase, lowercase letters and numbers'
  }
  return null
}

export function validateShortCode(value: string): string | null {
  if (!validators.isShortCode(value)) {
    return 'Short code can only contain letters, numbers and hyphens, 3-32 characters'
  }
  return null
}
