import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // 登录
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await authAPI.login(credentials)
      // 后端返回格式: { access_token, token_type, user }
      if (response.data.access_token) {
        const { user: userData, access_token } = response.data
        user.value = userData
        token.value = access_token
        // 使用localStorage代替Cookie确保立即生效
        localStorage.setItem('auth_token', access_token)
        console.log('登录成功，token已保存:', { 
          token: access_token.substring(0, 20) + '...', 
          user: userData.username,
          isAuthenticated: !!access_token
        })
        return { success: true }
      } else {
        return { success: false, message: '登录响应格式错误' }
      }
    } catch (error) {
      console.error('登录失败:', error)
      
      // 处理不同类型的错误响应
      let errorMessage = '登录失败'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // 处理401错误（用户名或密码错误）
        if (error.response.status === 401 && errorData.detail) {
          errorMessage = errorData.detail
        }
        // 处理422错误（数据验证失败）
        else if (error.response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        }
        // 其他错误
        else if (errorData.message) {
          errorMessage = errorData.message
        }
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await authAPI.register(userData)
      if (response.data.success) {
        return { success: true }
      }
    } catch (error) {
      console.error('注册失败:', error)
      
      // 处理不同类型的错误响应
      let errorMessage = '注册失败'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // 处理400错误（用户名/邮箱已存在）
        if (error.response.status === 400 && errorData.detail) {
          errorMessage = errorData.detail
        }
        // 处理422错误（数据验证失败）
        else if (error.response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        }
        // 其他错误
        else if (errorData.message) {
          errorMessage = errorData.message
        }
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    console.log('用户已登出，token已清除')
  }

  // 获取用户信息
  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const response = await authAPI.getProfile()
      if (response.data.success) {
        user.value = response.data.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout() // 如果token无效，则登出
    }
  }

  // 强制刷新认证状态
  const refreshAuthState = () => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken && storedToken !== token.value) {
      console.log('同步localStorage中的token')
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
    refreshAuthState
  }
})