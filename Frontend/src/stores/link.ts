import { defineStore } from 'pinia'
import { ref } from 'vue'
import { linkService } from '@/services/link.service'
import type { ShortLink, CreateLinkData, UpdateLinkData, LinkListParams, PaginationInfo, ApiError } from '@/types'

interface LinkResult {
  success: boolean
  message?: string
  data?: ShortLink
}

export const useLinkStore = defineStore('link', () => {
  const links = ref<ShortLink[]>([])
  const currentLink = ref<ShortLink | null>(null)
  const isLoading = ref(false)
  const pagination = ref<PaginationInfo>({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  })

  // 解析错误信息
  function parseError(error: unknown): string {
    const err = error as ApiError
    if (err.response?.data) {
      const errorData = err.response.data
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          return errorData.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        }
        return String(errorData.detail)
      }
      if (errorData.message) {
        return errorData.message
      }
    }
    return 'Operation failed'
  }

  // Fetch link list
  async function fetchLinks(params: LinkListParams = {}): Promise<void> {
    isLoading.value = true
    try {
      const response = await linkService.getLinks(params)
      links.value = response.links || []
      pagination.value = response.pagination || pagination.value
    } catch (error) {
      console.error('Failed to fetch links:', error)
      links.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Fetch single link
  async function fetchLinkById(linkId: number): Promise<ShortLink | null> {
    try {
      const link = await linkService.getLinkById(linkId)
      currentLink.value = link
      return link
    } catch (error) {
      console.error('Failed to fetch link details:', error)
      return null
    }
  }

  // Create short link
  async function createLink(data: CreateLinkData): Promise<LinkResult> {
    try {
      const newLink = await linkService.createLink(data)
      links.value.unshift(newLink)
      return { success: true, data: newLink }
    } catch (error) {
      console.error('Failed to create link:', error)
      return { success: false, message: parseError(error) }
    }
  }

  // Update link
  async function updateLink(linkId: number, data: UpdateLinkData): Promise<LinkResult> {
    try {
      const updatedLink = await linkService.updateLink(linkId, data)
      const index = links.value.findIndex(link => link.id === linkId)
      if (index !== -1) {
        links.value[index] = updatedLink
      }
      if (currentLink.value?.id === linkId) {
        currentLink.value = updatedLink
      }
      return { success: true, data: updatedLink }
    } catch (error) {
      console.error('Failed to update link:', error)
      return { success: false, message: parseError(error) }
    }
  }

  // Delete link
  async function deleteLink(linkId: number): Promise<LinkResult> {
    try {
      await linkService.deleteLink(linkId)
      links.value = links.value.filter(link => link.id !== linkId)
      if (currentLink.value?.id === linkId) {
        currentLink.value = null
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to delete link:', error)
      return { success: false, message: parseError(error) }
    }
  }

  // Toggle link status
  async function toggleLinkStatus(linkId: number): Promise<LinkResult> {
    try {
      const updatedLink = await linkService.toggleLinkStatus(linkId)
      const index = links.value.findIndex(link => link.id === linkId)
      if (index !== -1) {
        links.value[index] = updatedLink
      }
      return { success: true, data: updatedLink }
    } catch (error) {
      console.error('Failed to toggle link status:', error)
      return { success: false, message: parseError(error) }
    }
  }

  // 清空当前链接
  function clearCurrentLink() {
    currentLink.value = null
  }

  return {
    links,
    currentLink,
    isLoading,
    pagination,
    fetchLinks,
    fetchLinkById,
    createLink,
    updateLink,
    deleteLink,
    toggleLinkStatus,
    clearCurrentLink
  }
})
