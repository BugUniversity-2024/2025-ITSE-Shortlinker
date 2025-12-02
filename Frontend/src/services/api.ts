import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { storage } from '@/utils/storage'
import router from '@/router'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地数据并跳转到登录页
      storage.removeToken()
      storage.removeUser()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api
