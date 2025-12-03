import api from './api'

export interface ApiKey {
  id: number
  name: string
  key_prefix: string
  permissions: string[]
  rate_limit: number
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export interface CreateApiKeyData {
  name: string
  permissions?: string[]
  rateLimit?: number
  expiresAt?: string
}

export interface CreateApiKeyResponse extends ApiKey {
  api_key: string
  message: string
}

export interface ApiKeyStats {
  active_keys: number
  today_requests: number
  month_requests: number
  quota_used: number
  quota_limit: number
}

export const apikeyService = {
  // 获取所有 API Keys
  async listApiKeys(): Promise<ApiKey[]> {
    const response = await api.get<ApiKey[]>('/api-keys')
    return response.data
  },

  // 创建新 API Key
  async createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResponse> {
    const response = await api.post<CreateApiKeyResponse>('/api-keys', data)
    return response.data
  },

  // 更新 API Key
  async updateApiKey(id: number, data: Partial<{
    name: string
    permissions: string[]
    rateLimit: number
    isActive: boolean
  }>): Promise<ApiKey> {
    const response = await api.put<ApiKey>(`/api-keys/${id}`, data)
    return response.data
  },

  // 删除/撤销 API Key
  async deleteApiKey(id: number): Promise<void> {
    await api.delete(`/api-keys/${id}`)
  },

  // 获取使用统计
  async getStats(): Promise<ApiKeyStats> {
    const response = await api.get<ApiKeyStats>('/api-keys/stats')
    return response.data
  }
}

// 权限常量
export const PERMISSIONS = {
  LINKS_READ: 'links:read',
  LINKS_WRITE: 'links:write',
  LINKS_DELETE: 'links:delete',
  ANALYTICS_READ: 'analytics:read',
} as const

export const PERMISSION_LABELS: Record<string, string> = {
  'links:read': 'Read Links',
  'links:write': 'Write Links',
  'links:delete': 'Delete Links',
  'analytics:read': 'Read Analytics',
}
