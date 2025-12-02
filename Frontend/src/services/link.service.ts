import api from './api'
import type {
  ShortLink,
  CreateLinkData,
  UpdateLinkData,
  LinkListParams,
  LinkListResponse,
  BatchCreateData,
  BatchCreateResponse
} from '@/types'

export const linkService = {
  // 创建短链接
  async createLink(data: CreateLinkData): Promise<ShortLink> {
    const response = await api.post<ShortLink>('/links/create', data)
    return response.data
  },

  // 批量创建短链接
  async batchCreateLinks(data: BatchCreateData): Promise<BatchCreateResponse> {
    const response = await api.post<BatchCreateResponse>('/links/batch', data)
    return response.data
  },

  // 获取用户链接列表
  async getLinks(params: LinkListParams = {}): Promise<LinkListResponse> {
    const response = await api.get<LinkListResponse>('/links/', { params })
    return response.data
  },

  // 获取单个链接详情
  async getLinkById(linkId: number): Promise<ShortLink> {
    const response = await api.get<ShortLink>(`/links/${linkId}`)
    return response.data
  },

  // 获取链接信息（通过短码）
  async getLinkByCode(shortCode: string): Promise<ShortLink> {
    const response = await api.get<ShortLink>(`/links/info/${shortCode}`)
    return response.data
  },

  // 更新链接
  async updateLink(linkId: number, data: UpdateLinkData): Promise<ShortLink> {
    const response = await api.put<ShortLink>(`/links/${linkId}`, data)
    return response.data
  },

  // 删除链接
  async deleteLink(linkId: number): Promise<void> {
    await api.delete(`/links/${linkId}`)
  },

  // 切换链接状态
  async toggleLinkStatus(linkId: number): Promise<ShortLink> {
    const response = await api.post<ShortLink>(`/links/${linkId}/toggle-status`)
    return response.data
  },

  // 获取二维码
  async getQRCode(shortCode: string, params: { size?: number; format?: string } = {}): Promise<Blob> {
    const response = await api.get(`/qr/${shortCode}`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // 获取链接信息用于重定向
  async getLinkInfo(shortCode: string): Promise<{ original_url: string }> {
    const response = await api.get<{ original_url: string }>(`/redirect/${shortCode}`)
    return response.data
  },

  // 记录点击
  async recordClick(shortCode: string, clickData: Record<string, unknown> = {}): Promise<void> {
    await api.post(`/redirect/${shortCode}/click`, clickData)
  }
}
