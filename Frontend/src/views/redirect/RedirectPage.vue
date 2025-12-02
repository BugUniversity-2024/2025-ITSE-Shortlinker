<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <LoadingSpinner v-if="isLoading" size="lg" />

      <div v-else-if="error" class="max-w-md mx-auto px-4">
        <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-red-500" />
        <h1 class="mt-4 text-2xl font-bold text-gray-900">Invalid Link</h1>
        <p class="mt-2 text-gray-600">{{ error }}</p>
        <router-link to="/" class="mt-6 btn-primary inline-block">
          Back to Home
        </router-link>
      </div>

      <div v-else class="max-w-md mx-auto px-4">
        <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500" />
        <h1 class="mt-4 text-2xl font-bold text-gray-900">Redirecting...</h1>
        <p class="mt-2 text-gray-600">You will be redirected shortly</p>
        <p class="mt-4 text-sm text-gray-500 break-all">{{ targetUrl }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { linkService } from '@/services/link.service'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const route = useRoute()

const isLoading = ref(true)
const error = ref('')
const targetUrl = ref('')

onMounted(async () => {
  const shortCode = route.params.shortCode as string

  if (!shortCode) {
    error.value = 'Invalid short link'
    isLoading.value = false
    return
  }

  try {
    // 获取原始链接
    const data = await linkService.getLinkInfo(shortCode)
    targetUrl.value = data.original_url

    // 记录点击
    await linkService.recordClick(shortCode, {
      referrer: document.referrer,
      user_agent: navigator.userAgent
    }).catch(() => {
      // 忽略记录点击的错误
    })

    // 延迟跳转，让用户看到跳转提示
    setTimeout(() => {
      window.location.href = targetUrl.value
    }, 1000)
  } catch (e) {
    console.error('Failed to get link info:', e)
    error.value = 'Link does not exist or has expired'
  } finally {
    isLoading.value = false
  }
})
</script>
