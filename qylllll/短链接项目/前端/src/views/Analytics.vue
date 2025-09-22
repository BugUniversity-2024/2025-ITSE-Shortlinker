<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">数据统计</h1>
        <p class="mt-1 text-secondary-600">分析您的链接表现和访问数据</p>
      </div>

      <!-- 链接选择器 -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex-1">
            <label for="linkSelect" class="block text-sm font-medium text-secondary-700 mb-2">
              选择要分析的链接
            </label>
            <select
              id="linkSelect"
              v-model="selectedLinkId"
              @change="loadAnalytics"
              class="input-field"
            >
              <option value="">选择链接</option>
              <option v-for="link in linksStore.links" :key="link.id" :value="link.id">
                {{ link.description || link.short_code }} ({{ link.click_count }} 次点击)
              </option>
            </select>
          </div>
          <div class="flex items-center space-x-4">
            <div>
              <label for="periodSelect" class="block text-sm font-medium text-secondary-700 mb-2">
                时间范围
              </label>
              <select
                id="periodSelect"
                v-model="selectedPeriod"
                @change="loadAnalytics"
                class="input-field"
              >
                <option value="day">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="year">本年</option>
              </select>
            </div>
            <div class="pt-6">
              <button
                v-if="selectedLinkId"
                @click="exportData"
                class="btn-outline"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                导出数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!selectedLinkId" class="text-center py-12">
        <ChartBarIcon class="mx-auto h-16 w-16 text-secondary-400" />
        <h3 class="mt-4 text-lg font-medium text-secondary-900">选择链接查看统计</h3>
        <p class="mt-2 text-secondary-500">请从上方选择一个链接来查看详细的访问统计数据</p>
      </div>

      <div v-else-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-secondary-500">正在加载统计数据...</p>
      </div>

      <div v-else-if="analyticsData" class="space-y-6">
        <!-- 概览统计 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CursorArrowRaysIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">总点击数</p>
                <p class="text-2xl font-bold text-secondary-900">{{ analyticsData.summary.total_clicks }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UserGroupIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">独立访客</p>
                <p class="text-2xl font-bold text-secondary-900">{{ analyticsData.summary.unique_clicks }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">高峰时段</p>
                <p class="text-2xl font-bold text-secondary-900">{{ analyticsData.summary.peak_hour }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CalendarIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-secondary-600">高峰日期</p>
                <p class="text-xl font-bold text-secondary-900">{{ formatDate(analyticsData.summary.peak_day) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 点击趋势图 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">点击趋势</h3>
          <div class="h-80 flex items-center justify-center bg-secondary-50 rounded-lg">
            <div class="text-center">
              <ChartBarIcon class="mx-auto h-16 w-16 text-secondary-400" />
              <p class="mt-4 text-secondary-500">图表组件加载中...</p>
              <p class="text-xs text-secondary-400">
                {{ analyticsData.time_series.length }} 个数据点
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 地理分布 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">地理分布</h3>
            <div class="space-y-3">
              <div
                v-for="country in analyticsData.geographic"
                :key="country.country"
                class="flex items-center justify-between"
              >
                <div class="flex items-center">
                  <GlobeAltIcon class="h-5 w-5 text-secondary-400 mr-3" />
                  <span class="text-sm font-medium text-secondary-900">{{ country.country }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-secondary-200 rounded-full h-2 w-20">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      :style="{ width: `${country.percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-secondary-600">{{ country.clicks }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 设备类型 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">设备类型</h3>
            <div class="space-y-3">
              <div
                v-for="device in analyticsData.devices"
                :key="device.type"
                class="flex items-center justify-between"
              >
                <div class="flex items-center">
                  <component
                    :is="getDeviceIcon(device.type)"
                    class="h-5 w-5 text-secondary-400 mr-3"
                  />
                  <span class="text-sm font-medium text-secondary-900 capitalize">
                    {{ getDeviceLabel(device.type) }}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-secondary-200 rounded-full h-2 w-20">
                    <div
                      class="bg-green-600 h-2 rounded-full"
                      :style="{ width: `${device.percentage}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-secondary-600">{{ device.clicks }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 来源分析 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">流量来源</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="referrer in analyticsData.referrers"
              :key="referrer.source"
              class="text-center p-4 bg-secondary-50 rounded-lg"
            >
              <div class="text-2xl font-bold text-secondary-900">{{ referrer.clicks }}</div>
              <div class="text-sm text-secondary-600">{{ referrer.source }}</div>
              <div class="text-xs text-secondary-500">{{ referrer.percentage }}%</div>
            </div>
          </div>
        </div>

        <!-- 详细时间序列数据 -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-900">详细数据</h3>
            <button
              @click="showDetailedData = !showDetailedData"
              class="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {{ showDetailedData ? '隐藏' : '显示' }}详细数据
            </button>
          </div>

          <div v-if="showDetailedData" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-secondary-200">
              <thead class="bg-secondary-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    点击数
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    独立访客
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-secondary-200">
                <tr v-for="item in analyticsData.time_series" :key="item.date">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {{ formatDate(item.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {{ item.clicks }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {{ item.unique_clicks }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLinksStore } from '@/stores/links'
import { analyticsAPI } from '@/api/analytics'
import DashboardLayout from '@/components/DashboardLayout.vue'
import {
  ChartBarIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const linksStore = useLinksStore()

const selectedLinkId = ref('')
const selectedPeriod = ref('week')
const analyticsData = ref(null)
const isLoading = ref(false)
const showDetailedData = ref(false)

const getDeviceIcon = (type) => {
  switch (type) {
    case 'mobile':
      return DevicePhoneMobileIcon
    case 'tablet':
      return DeviceTabletIcon
    case 'desktop':
    default:
      return ComputerDesktopIcon
  }
}

const getDeviceLabel = (type) => {
  switch (type) {
    case 'mobile':
      return '移动设备'
    case 'tablet':
      return '平板电脑'
    case 'desktop':
      return '桌面设备'
    default:
      return '其他'
  }
}

const loadAnalytics = async () => {
  if (!selectedLinkId.value) {
    analyticsData.value = null
    return
  }

  isLoading.value = true
  try {
    const response = await analyticsAPI.getLinkAnalytics(selectedLinkId.value, {
      period: selectedPeriod.value
    })
    
    if (response.data.success) {
      analyticsData.value = response.data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

const exportData = async () => {
  if (!selectedLinkId.value) return

  try {
    const response = await analyticsAPI.exportAnalytics(selectedLinkId.value, {
      format: 'csv',
      period: selectedPeriod.value
    })

    // 创建下载链接
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_${selectedLinkId.value}_${selectedPeriod.value}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  // 获取链接列表
  await linksStore.fetchLinks()
  
  // 如果URL中有链接参数，自动选择
  if (route.query.link) {
    selectedLinkId.value = route.query.link
    await loadAnalytics()
  }
})
</script>