import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import { storage } from '@/utils/storage'
import type { User, LoginCredentials, RegisterData, ApiError } from '@/types'

interface AuthResult {
  success: boolean
  message?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(storage.getToken())
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // 解析错误信息
  function parseError(error: unknown): string {
    const err = error as ApiError
    if (err.response?.data) {
      const errorData = err.response.data
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          return errorData.detail.map(e => e.msg).join(', ')
        }
        return String(errorData.detail)
      }
      if (errorData.message) {
        return errorData.message
      }
    }
    return err.message || 'Operation failed'
  }

  // Login
  async function login(credentials: LoginCredentials): Promise<AuthResult> {
    isLoading.value = true
    try {
      const response = await authService.login(credentials)
      if (response.access_token) {
        token.value = response.access_token
        storage.setToken(response.access_token)

        // Fetch user info
        await fetchUser()

        return { success: true }
      }
      return { success: false, message: 'Invalid login response format' }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: parseError(error) }
    } finally {
      isLoading.value = false
    }
  }

  // Register
  async function register(data: RegisterData): Promise<AuthResult> {
    isLoading.value = true
    try {
      await authService.register(data)
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, message: parseError(error) }
    } finally {
      isLoading.value = false
    }
  }

  // Logout
  function logout() {
    user.value = null
    token.value = null
    storage.removeToken()
    storage.removeUser()
  }

  // Fetch user info
  async function fetchUser(): Promise<void> {
    if (!token.value) return

    try {
      const userData = await authService.getProfile()
      user.value = userData
      storage.setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      logout()
    }
  }

  // Update profile
  async function updateProfile(data: Partial<User>): Promise<AuthResult> {
    try {
      const updatedUser = await authService.updateProfile(data)
      user.value = updatedUser
      storage.setUser(updatedUser)
      return { success: true }
    } catch (error) {
      console.error('Failed to update profile:', error)
      return { success: false, message: parseError(error) }
    }
  }

  // 强制刷新认证状态
  function refreshAuthState(): boolean {
    const storedToken = storage.getToken()
    if (storedToken && storedToken !== token.value) {
      token.value = storedToken
    }
    return !!token.value
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUser()
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    refreshAuthState
  }
})
