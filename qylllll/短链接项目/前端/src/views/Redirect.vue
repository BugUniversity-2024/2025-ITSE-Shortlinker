<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <div class="text-center">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="space-y-4">
          <div class="mx-auto h-16 w-16 relative">
            <div class="absolute inset-0 rounded-full border-4 border-primary-200"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
          </div>
          <h2 class="text-xl font-semibold text-secondary-900">正在重定向...</h2>
          <p class="text-secondary-600">请稍候，正在为您跳转到目标页面</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="space-y-4">
          <div class="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
          </div>
          <h2 class="text-xl font-semibold text-secondary-900">链接无效或已过期</h2>
          <p class="text-secondary-600">{{ error }}</p>
          
          <div class="space-y-2">
            <button
              @click="retry"
              class="w-full btn-primary"
            >
              重试
            </button>
            <router-link
              to="/"
              class="block w-full btn-outline text-center"
            >
              返回首页
            </router-link>
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-else-if="showPreview && linkInfo" class="card space-y-6">
          <div class="text-center space-y-4">
            <div class="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <LinkIcon class="h-8 w-8 text-blue-600" />
            </div>
            <h2 class="text-xl font-semibold text-secondary-900">链接预览</h2>
            <p class="text-secondary-600">即将跳转到以下链接</p>
          </div>

          <div class="bg-secondary-50 rounded-lg p-4 text-left">
            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-secondary-700">目标链接：</span>
                <p class="text-sm text-secondary-900 break-all">{{ linkInfo.original_url }}</p>
              </div>
              <div v-if="linkInfo.title">
                <span class="text-sm font-medium text-secondary-700">标题：</span>
                <p class="text-sm text-secondary-900">{{ linkInfo.title }}</p>
              </div>
              <div v-if="linkInfo.description">
                <span class="text-sm font-medium text-secondary-700">描述：</span>
                <p class="text-sm text-secondary-900">{{ linkInfo.description }}</p>
              </div>
              <div>
                <span class="text-sm font-medium text-secondary-700">创建时间：</span>
                <p class="text-sm text-secondary-900">{{ formatDate(linkInfo.created_at) }}</p>
              </div>
              <div v-if="linkInfo.expires_at">
                <span class="text-sm font-medium text-secondary-700">过期时间：</span>
                <p class="text-sm text-secondary-900">{{ formatDate(linkInfo.expires_at) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="redirectToTarget"
              class="w-full btn-primary"
            >
              <ArrowTopRightOnSquareIcon class="h-4 w-4 mr-2" />
              继续访问 ({{ countdown }}s)
            </button>
            <router-link
              to="/"
              class="block w-full btn-outline text-center"
            >
              返回首页
            </router-link>
          </div>

          <!-- 安全警告 -->
          <div v-if="linkInfo.is_suspicious" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start">
              <ExclamationTriangleIcon class="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 class="text-sm font-medium text-yellow-800">安全提醒</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  此链接可能存在安全风险，请谨慎访问。建议您确认链接来源后再继续。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 重定向成功提示 -->
        <div v-else-if="redirected" class="space-y-4">
          <div class="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckIcon class="h-8 w-8 text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-secondary-900">重定向成功</h2>
          <p class="text-secondary-600">如果没有自动跳转，请点击下方链接</p>
          <a
            :href="linkInfo?.original_url"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary inline-flex items-center"
          >
            <ArrowTopRightOnSquareIcon class="h-4 w-4 mr-2" />
            访问链接
          </a>
        </div>
      </div>

      <!-- 页面底部信息 -->
      <div class="mt-8 text-center text-sm text-secondary-500">
        <p>
          该服务由
          <router-link to="/" class="text-primary-600 hover:text-primary-700">
            短链接系统
          </router-link>
          提供
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { linksAPI } from '@/api/links'
import {
  LinkIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const error = ref('')
const linkInfo = ref(null)
const showPreview = ref(false)
const redirected = ref(false)
const countdown = ref(5)

let countdownTimer = null

// 获取短链接信息
const fetchLinkInfo = async (shortCode) => {
  try {
    const response = await linksAPI.getLinkInfo(shortCode)
    
    if (response.data.success) {
      linkInfo.value = response.data.data
      
      // 检查链接是否过期
      if (linkInfo.value.expires_at) {
        const now = new Date()
        const expiresAt = new Date(linkInfo.value.expires_at)
        if (now > expiresAt) {
          error.value = '该链接已过期，无法访问'
          return
        }
      }

      // 检查是否需要预览模式
      const preview = route.query.preview === 'true'
      const suspicious = linkInfo.value.is_suspicious
      
      if (preview || suspicious) {
        showPreview.value = true
        startCountdown()
      } else {
        // 直接重定向
        await redirectToTarget()
      }
    } else {
      error.value = response.data.message || '链接不存在或已被删除'
    }
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = '链接不存在或已被删除'
    } else if (err.response?.status === 410) {
      error.value = '该链接已过期，无法访问'
    } else {
      error.value = '获取链接信息失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 记录点击并重定向
const redirectToTarget = async () => {
  if (!linkInfo.value) return

  try {
    // 记录点击
    await linksAPI.recordClick(route.params.shortCode, {
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      ip_address: await getClientIP()
    })

    // 重定向到目标链接
    window.location.href = linkInfo.value.original_url
    redirected.value = true
  } catch (err) {
    // 即使记录失败也要继续重定向
    window.location.href = linkInfo.value.original_url
    redirected.value = true
  }
}

// 开始倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      redirectToTarget()
    }
  }, 1000)
}

// 重试
const retry = () => {
  error.value = ''
  isLoading.value = true
  fetchLinkInfo(route.params.shortCode)
}

// 获取客户端IP（可选）
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  const shortCode = route.params.shortCode
  if (shortCode) {
    fetchLinkInfo(shortCode)
  } else {
    error.value = '无效的链接'
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>