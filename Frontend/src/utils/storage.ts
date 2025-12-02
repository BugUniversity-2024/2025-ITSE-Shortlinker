const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_data'

export const storage = {
  // Token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  // User data
  getUser<T>(): T | null {
    const data = localStorage.getItem(USER_KEY)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return null
    }
  },

  setUser<T>(user: T): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  // Generic
  get<T>(key: string): T | null {
    const data = localStorage.getItem(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return data as unknown as T
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    localStorage.clear()
  }
}
