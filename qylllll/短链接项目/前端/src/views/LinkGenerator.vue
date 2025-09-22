<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">创建短链接</h1>
        <p class="mt-1 text-secondary-600">将您的长链接转换为简洁易分享的短链接</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 链接生成表单 -->
        <div class="lg:col-span-2">
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-6">链接信息</h3>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- 原始链接 -->
              <div>
                <label for="originalUrl" class="block text-sm font-medium text-secondary-700 mb-2">
                  原始链接 *
                </label>
                <input
                  id="originalUrl"
                  v-model="form.url"
                  type="url"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.url }"
                  placeholder="https://example.com/your-long-url"
                />
                <p v-if="errors.url" class="mt-1 text-sm text-red-600">{{ errors.url }}</p>
              </div>

              <!-- 自定义短码 -->
              <div>
                <label for="customCode" class="block text-sm font-medium text-secondary-700 mb-2">
                  自定义短码（可选）
                </label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-secondary-300 bg-secondary-50 text-secondary-500 text-sm">
                    short.ly/
                  </span>
                  <input
                    id="customCode"
                    v-model="form.custom_code"
                    type="text"
                    class="flex-1 input-field rounded-l-none"
                    :class="{ 'border-red-500': errors.custom_code }"
                    placeholder="my-link"
                  />
                </div>
                <p v-if="errors.custom_code" class="mt-1 text-sm text-red-600">{{ errors.custom_code }}</p>
                <p class="mt-1 text-xs text-secondary-500">
                  4-20个字符，支持字母、数字、连字符和下划线
                </p>
              </div>

              <!-- 描述 -->
              <div>
                <label for="description" class="block text-sm font-medium text-secondary-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="3"
                  class="input-field resize-none"
                  :class="{ 'border-red-500': errors.description }"
                  placeholder="为这个链接添加描述，方便管理"
                ></textarea>
                <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
              </div>

              <!-- 标签 -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  标签（可选）
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(tag)"
                      class="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <XMarkIcon class="h-3 w-3" />
                    </button>
                  </span>
                </div>
                <div class="flex">
                  <input
                    v-model="newTag"
                    type="text"
                    class="flex-1 input-field rounded-r-none"
                    placeholder="输入标签名称"
                    @keyup.enter="addTag"
                  />
                  <button
                    type="button"
                    @click="addTag"
                    class="px-4 py-2 bg-secondary-100 border border-l-0 border-secondary-300 rounded-r-lg text-secondary-700 hover:bg-secondary-200"
                  >
                    添加
                  </button>
                </div>
              </div>

              <!-- 过期时间 -->
              <div>
                <label for="expiresAt" class="block text-sm font-medium text-secondary-700 mb-2">
                  过期时间（可选）
                </label>
                <input
                  id="expiresAt"
                  v-model="form.expires_at"
                  type="datetime-local"
                  class="input-field"
                  :class="{ 'border-red-500': errors.expires_at }"
                />
                <p v-if="errors.expires_at" class="mt-1 text-sm text-red-600">{{ errors.expires_at }}</p>
                <p class="mt-1 text-xs text-secondary-500">
                  留空表示永不过期
                </p>
              </div>

              <!-- 提交按钮 -->
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="resetForm"
                  class="btn-secondary"
                >
                  重置
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="btn-primary"
                >
                  <span v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </span>
                  <span v-else class="flex items-center">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    生成短链接
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- 生成结果 -->
          <div v-if="generatedLink" class="card mt-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-secondary-900">生成成功！</h3>
                <p class="text-sm text-secondary-600">您的短链接已创建完成</p>
              </div>
              <CheckCircleIcon class="h-8 w-8 text-green-500" />
            </div>

            <div class="space-y-4">
              <!-- 短链接 -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">短链接</label>
                <div class="flex">
                  <input
                    :value="generatedLink.short_url"
                    readonly
                    class="flex-1 input-field bg-secondary-50"
                  />
                  <button
                    @click="copyToClipboard(generatedLink.short_url)"
                    class="ml-2 btn-outline"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- 二维码 -->
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">二维码</label>
                <div class="flex items-center space-x-4">
                  <div class="w-24 h-24 bg-white border border-secondary-300 rounded-lg flex items-center justify-center">
                    <QrCodeIcon class="h-12 w-12 text-secondary-400" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-secondary-600 mb-2">扫描二维码访问链接</p>
                    <button class="btn-secondary text-sm">
                      下载二维码
                    </button>
                  </div>
                </div>
              </div>

              <!-- 链接信息 -->
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                <div>
                  <p class="text-sm text-secondary-600">创建时间</p>
                  <p class="text-sm font-medium text-secondary-900">{{ formatDate(generatedLink.created_at) }}</p>
                </div>
                <div>
                  <p class="text-sm text-secondary-600">点击次数</p>
                  <p class="text-sm font-medium text-secondary-900">{{ generatedLink.click_count }}</p>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-end space-x-4 pt-4 border-t border-secondary-200">
                <router-link
                  :to="`/analytics?link=${generatedLink.id}`"
                  class="btn-outline"
                >
                  <ChartBarIcon class="h-4 w-4 mr-2" />
                  查看统计
                </router-link>
                <button
                  @click="createAnother"
                  class="btn-primary"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  创建新链接
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="space-y-6">
          <!-- 使用技巧 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">使用技巧</h3>
            <div class="space-y-3">
              <div class="flex items-start">
                <LightBulbIcon class="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                <div>
                  <p class="text-sm font-medium text-secondary-900">自定义短码</p>
                  <p class="text-xs text-secondary-600">使用有意义的短码，便于记忆和分享</p>
                </div>
              </div>
              <div class="flex items-start">
                <TagIcon class="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <p class="text-sm font-medium text-secondary-900">添加标签</p>
                  <p class="text-xs text-secondary-600">用标签分类管理您的链接</p>
                </div>
              </div>
              <div class="flex items-start">
                <CalendarIcon class="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                <div>
                  <p class="text-sm font-medium text-secondary-900">设置过期</p>
                  <p class="text-xs text-secondary-600">为临时链接设置过期时间</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近创建 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">最近创建</h3>
            <div v-if="recentLinks.length === 0" class="text-center py-4">
              <p class="text-sm text-secondary-500">暂无记录</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="link in recentLinks"
                :key="link.id"
                class="p-3 bg-secondary-50 rounded-lg"
              >
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {{ link.description || '未命名链接' }}
                </p>
                <p class="text-xs text-primary-600 truncate">{{ link.short_url }}</p>
                <p class="text-xs text-secondary-500">{{ formatDate(link.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useLinksStore } from '@/stores/links'
import DashboardLayout from '@/components/DashboardLayout.vue'
import {
  PlusIcon,
  ClipboardIcon,
  XMarkIcon,
  QrCodeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  LightBulbIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const linksStore = useLinksStore()

const form = reactive({
  url: '',
  custom_code: '',
  description: '',
  tags: [],
  expires_at: ''
})

const errors = reactive({
  url: '',
  custom_code: '',
  description: '',
  expires_at: ''
})

const newTag = ref('')
const isLoading = ref(false)
const generatedLink = ref(null)

const recentLinks = computed(() => {
  return linksStore.links.slice(0, 3)
})

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // 验证URL
  if (!form.url) {
    errors.url = '请输入原始链接'
    isValid = false
  } else {
    try {
      new URL(form.url)
    } catch {
      errors.url = '请输入有效的URL'
      isValid = false
    }
  }

  // 验证自定义短码
  if (form.custom_code) {
    if (form.custom_code.length < 4 || form.custom_code.length > 20) {
      errors.custom_code = '短码长度必须在4-20个字符之间'
      isValid = false
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.custom_code)) {
      errors.custom_code = '短码只能包含字母、数字、连字符和下划线'
      isValid = false
    }
  }

  // 验证描述长度
  if (form.description && form.description.length > 200) {
    errors.description = '描述长度不能超过200个字符'
    isValid = false
  }

  // 验证过期时间
  if (form.expires_at) {
    const expiresDate = new Date(form.expires_at)
    const now = new Date()
    if (expiresDate <= now) {
      errors.expires_at = '过期时间必须晚于当前时间'
      isValid = false
    }
  }

  return isValid
}

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 确保URL格式正确
    let url = form.url.trim()
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    const linkData = {
      original_url: url,
      title: form.description || undefined,  // 使用description作为title
      description: form.description || undefined,  // 保持原有description
      tags: form.tags.length > 0 ? form.tags.join(',') : undefined,
      expires_at: form.expires_at || undefined
    }

    if (form.custom_code) {
      linkData.short_code = form.custom_code  // 修正字段名
    }

    console.log('发送数据:', linkData)  // 调试日志
    
    const result = await linksStore.createLink(linkData)
    
    if (result.success) {
      generatedLink.value = result.data  // 直接使用后端返回的数据
      // 不重置表单，让用户可以看到生成结果
    } else {
      // 处理错误
      if (result.message.includes('短码已存在') || result.message.includes('短码')) {
        errors.custom_code = result.message
      } else {
        errors.url = result.message
      }
    }
  } catch (error) {
    console.error('提交错误:', error)
    errors.url = '创建失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (Array.isArray(form[key])) {
      form[key] = []
    } else {
      form[key] = ''
    }
  })
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  generatedLink.value = null
}

const createAnother = () => {
  resetForm()
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  // 获取最近的链接
  linksStore.fetchLinks({ limit: 3, sort: 'created_desc' })
})
</script>