import { defineStore } from 'pinia'
import { ref } from 'vue'
import { linksAPI } from '@/api/links'

export const useLinksStore = defineStore('links', () => {
  const links = ref([])
  const isLoading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  })

  // 获取链接列表
  const fetchLinks = async (params = {}) => {
    isLoading.value = true
    try {
      const response = await linksAPI.getLinks(params)
      if (response.data?.success && response.data?.data) {
        links.value = response.data.data.links || []
        pagination.value = response.data.data.pagination || pagination.value
      } else {
        console.warn('API响应格式异常:', response.data)
        links.value = []
      }
    } catch (error) {
      console.error('获取链接列表失败:', error)
      // 确保在错误时也设置为空数组，避免 undefined
      links.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 创建短链接
  const createLink = async (linkData) => {
    try {
      console.log('发送创建链接请求:', linkData)
      const response = await linksAPI.createLink(linkData)
      console.log('创建链接响应:', response.data)
      
      if (response.data?.success && response.data?.data) {
        // 确保 links.value 是数组
        if (Array.isArray(links.value)) {
          links.value.unshift(response.data.data)
        } else {
          links.value = [response.data.data]
        }
        return { success: true, data: response.data.data }
      }
    } catch (error) {
      console.error('创建链接失败:', error)
      
      // 详细的错误处理
      let errorMessage = '创建失败'
      
      if (error.response?.data) {
        const errorData = error.response.data
        console.log('错误响应数据:', errorData)
        
        // 处理422验证错误
        if (error.response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`
              }
              return err.msg || err
            }).join(', ')
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
    }
  }

  // 更新链接
  const updateLink = async (linkId, linkData) => {
    try {
      const response = await linksAPI.updateLink(linkId, linkData)
      if (response.data?.success && response.data?.data) {
        // 确保 links.value 是数组
        if (Array.isArray(links.value)) {
          const index = links.value.findIndex(link => link.id === linkId)
          if (index !== -1) {
            links.value[index] = response.data.data
          }
        }
        return { success: true, data: response.data.data }
      }
    } catch (error) {
      console.error('更新链接失败:', error)
      return { success: false, message: error.response?.data?.error?.message || '更新失败' }
    }
  }

  // 删除链接
  const deleteLink = async (linkId) => {
    try {
      const response = await linksAPI.deleteLink(linkId)
      if (response.data?.success) {
        // 确保 links.value 是数组
        if (Array.isArray(links.value)) {
          links.value = links.value.filter(link => link.id !== linkId)
        }
        return { success: true }
      }
    } catch (error) {
      console.error('删除链接失败:', error)
      return { success: false, message: error.response?.data?.error?.message || '删除失败' }
    }
  }

  // 切换链接状态
  const toggleLinkStatus = async (linkId, status) => {
    try {
      const response = await linksAPI.updateLinkStatus(linkId, status)
      if (response.data?.success) {
        // 确保 links.value 是数组
        if (Array.isArray(links.value)) {
          const index = links.value.findIndex(link => link.id === linkId)
          if (index !== -1) {
            links.value[index].status = status
          }
        }
        return { success: true }
      }
    } catch (error) {
      console.error('更新链接状态失败:', error)
      return { success: false, message: error.response?.data?.error?.message || '操作失败' }
    }
  }

  return {
    links,
    isLoading,
    pagination,
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleLinkStatus
  }
})