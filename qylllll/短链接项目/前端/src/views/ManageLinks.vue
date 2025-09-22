<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">链接管理</h1>
        <p class="mt-1 text-secondary-600">管理您的所有短链接</p>
      </div>

      <!-- 操作栏 -->
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- 搜索框 -->
        <div class="flex-1 max-w-md">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索链接..."
              class="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center space-x-3">
          <button
            @click="refreshLinks"
            class="btn-secondary flex items-center"
            :disabled="linksStore.isLoading"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': linksStore.isLoading }" />
            刷新
          </button>
          <router-link to="/generator" class="btn-primary">
            <PlusIcon class="h-4 w-4 mr-2" />
            创建新链接
          </router-link>
        </div>
      </div>

      <!-- 链接列表 -->
      <div class="card">
        <!-- 表格头部 -->
        <div class="px-6 py-4 border-b border-secondary-200">
          <h3 class="text-lg font-semibold text-secondary-900">
            我的链接 ({{ filteredLinks.length }})
          </h3>
        </div>

        <!-- 加载状态 -->
        <div v-if="linksStore.isLoading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            加载中...
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredLinks.length === 0" class="p-8 text-center">
          <LinkIcon class="mx-auto h-12 w-12 text-secondary-400" />
          <h3 class="mt-2 text-sm font-medium text-secondary-900">
            {{ searchQuery ? '未找到匹配的链接' : '暂无链接' }}
          </h3>
          <p class="mt-1 text-sm text-secondary-500">
            {{ searchQuery ? '尝试修改搜索关键词' : '开始创建您的第一个短链接吧！' }}
          </p>
          <div v-if="!searchQuery" class="mt-6">
            <router-link to="/generator" class="btn-primary">
              创建链接
            </router-link>
          </div>
        </div>

        <!-- 链接表格 -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-secondary-200">
            <thead class="bg-secondary-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  链接信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  短链接
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  点击数
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-secondary-200">
              <tr v-for="link in filteredLinks" :key="link.id" class="hover:bg-secondary-50">
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <p class="text-sm font-medium text-secondary-900 truncate">
                      {{ link.title || link.description || '无标题' }}
                    </p>
                    <p class="text-sm text-secondary-500 truncate">
                      {{ link.original_url }}
                    </p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <code class="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {{ link.short_code }}
                    </code>
                    <button
                      @click="copyToClipboard(getShortUrl(link))"
                      class="ml-2 text-secondary-400 hover:text-secondary-600"
                      title="复制短链接"
                    >
                      <ClipboardIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-secondary-900">
                  {{ link.click_count || 0 }}
                </td>
                <td class="px-6 py-4">
                  <span 
                    :class="link.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ link.is_active ? '活跃' : '禁用' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-secondary-500">
                  {{ formatDate(link.created_at) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <!-- 查看统计 -->
                    <router-link
                      :to="`/analytics?link=${link.id}`"
                      class="text-blue-600 hover:text-blue-900"
                      title="查看统计"
                    >
                      <ChartBarIcon class="h-4 w-4" />
                    </router-link>
                    
                    <!-- 编辑 -->
                    <button
                      @click="editLink(link)"
                      class="text-indigo-600 hover:text-indigo-900"
                      title="编辑"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    
                    <!-- 切换状态 -->
                    <button
                      @click="toggleLinkStatus(link)"
                      :class="link.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                      :title="link.is_active ? '禁用' : '启用'"
                    >
                      <component :is="link.is_active ? EyeSlashIcon : EyeIcon" class="h-4 w-4" />
                    </button>
                    
                    <!-- 删除 -->
                    <button
                      @click="confirmDelete(link)"
                      class="text-red-600 hover:text-red-900"
                      title="删除"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="linksStore.pagination.total_pages > 1" class="mt-6 flex justify-center">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            @click="changePage(linksStore.pagination.current_page - 1)"
            :disabled="linksStore.pagination.current_page <= 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <span class="relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-700">
            {{ linksStore.pagination.current_page }} / {{ linksStore.pagination.total_pages }}
          </span>
          
          <button
            @click="changePage(linksStore.pagination.current_page + 1)"
            :disabled="linksStore.pagination.current_page >= linksStore.pagination.total_pages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </nav>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">编辑链接</h3>
        
        <form @submit.prevent="updateLink">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                标题
              </label>
              <input
                v-model="editForm.title"
                type="text"
                class="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="为您的链接添加标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                描述
              </label>
              <textarea
                v-model="editForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="添加链接描述"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                标签
              </label>
              <input
                v-model="editForm.tags"
                type="text"
                class="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="用逗号分隔标签"
              />
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelEdit"
              class="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="isUpdating"
            >
              {{ isUpdating ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">确认删除</h3>
        <p class="text-secondary-600 mb-6">
          确定要删除短链接 <code class="bg-secondary-100 px-1 rounded">{{ linkToDelete?.short_code }}</code> 吗？此操作无法撤销。
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="btn-secondary"
          >
            取消
          </button>
          <button
            @click="deleteLink"
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            :disabled="isDeleting"
          >
            {{ isDeleting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLinksStore } from '@/stores/links'
import DashboardLayout from '@/components/DashboardLayout.vue'

// Icons
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  LinkIcon,
  ClipboardIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const linksStore = useLinksStore()

// 响应式数据
const searchQuery = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const linkToEdit = ref(null)
const linkToDelete = ref(null)
const isUpdating = ref(false)
const isDeleting = ref(false)

// 编辑表单
const editForm = ref({
  title: '',
  description: '',
  tags: ''
})

// 计算属性
const filteredLinks = computed(() => {
  if (!searchQuery.value) {
    return linksStore.links || []
  }
  
  const query = searchQuery.value.toLowerCase()
  return (linksStore.links || []).filter(link => 
    link.original_url?.toLowerCase().includes(query) ||
    link.short_code?.toLowerCase().includes(query) ||
    link.title?.toLowerCase().includes(query) ||
    link.description?.toLowerCase().includes(query)
  )
})

// 方法
const refreshLinks = async () => {
  await linksStore.fetchLinks()
}

const handleSearch = () => {
  // 搜索是通过计算属性实时过滤，无需额外处理
}

const getShortUrl = (link) => {
  return `${window.location.protocol}//${window.location.host.replace(':3001', ':8000')}/${link.short_code}`
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加提示消息
    console.log('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editLink = (link) => {
  linkToEdit.value = link
  editForm.value = {
    title: link.title || '',
    description: link.description || '',
    tags: link.tags || ''
  }
  showEditModal.value = true
}

const cancelEdit = () => {
  showEditModal.value = false
  linkToEdit.value = null
  editForm.value = {
    title: '',
    description: '',
    tags: ''
  }
}

const updateLink = async () => {
  if (!linkToEdit.value) return
  
  isUpdating.value = true
  try {
    const result = await linksStore.updateLink(linkToEdit.value.id, editForm.value)
    if (result.success) {
      showEditModal.value = false
      linkToEdit.value = null
      await refreshLinks()
    }
  } catch (error) {
    console.error('更新链接失败:', error)
  } finally {
    isUpdating.value = false
  }
}

const toggleLinkStatus = async (link) => {
  try {
    const result = await linksStore.updateLink(link.id, { 
      is_active: !link.is_active 
    })
    if (result.success) {
      await refreshLinks()
    }
  } catch (error) {
    console.error('更新链接状态失败:', error)
  }
}

const confirmDelete = (link) => {
  linkToDelete.value = link
  showDeleteModal.value = true
}

const deleteLink = async () => {
  if (!linkToDelete.value) return
  
  isDeleting.value = true
  try {
    const result = await linksStore.deleteLink(linkToDelete.value.id)
    if (result.success) {
      showDeleteModal.value = false
      linkToDelete.value = null
      await refreshLinks()
    }
  } catch (error) {
    console.error('删除链接失败:', error)
  } finally {
    isDeleting.value = false
  }
}

const changePage = async (page) => {
  await linksStore.fetchLinks({ 
    skip: (page - 1) * linksStore.pagination.per_page,
    limit: linksStore.pagination.per_page 
  })
}

// 生命周期
onMounted(() => {
  refreshLinks()
})
</script>