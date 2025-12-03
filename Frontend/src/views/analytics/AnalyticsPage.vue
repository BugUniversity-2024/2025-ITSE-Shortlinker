<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="mt-1 text-gray-600">Analyze your link performance and visitor data</p>
      </div>

      <!-- Filters Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <!-- Link Selector -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select a link to analyze</label>
            <select
              v-model="selectedLink"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              @change="fetchAnalytics"
            >
              <option value="">All Links (Dashboard)</option>
              <option v-for="link in links" :key="link.id" :value="link.id">
                {{ link.title || link.short_code }} ({{ link.click_count }} clicks)
              </option>
            </select>
          </div>

          <!-- Time Period & Export -->
          <div class="flex items-end gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                v-model="selectedPeriod"
                class="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                @change="fetchAnalytics"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <button
              @click="exportData"
              class="inline-flex items-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Clicks -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center">
              <div class="p-3 bg-blue-50 rounded-lg">
                <CursorArrowRaysIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Total Clicks</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(summary?.total_clicks || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Unique Visitors -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center">
              <div class="p-3 bg-green-50 rounded-lg">
                <UsersIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Unique Visitors</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(summary?.unique_clicks || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Peak Hour -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-50 rounded-lg">
                <ClockIcon class="h-6 w-6 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Peak Hour</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary?.peak_hour || '--:--' }}</p>
              </div>
            </div>
          </div>

          <!-- Peak Day -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center">
              <div class="p-3 bg-purple-50 rounded-lg">
                <CalendarIcon class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Peak Day</p>
                <p class="text-2xl font-bold text-gray-900">{{ summary?.peak_day || '--' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Click Trends Chart -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Click Trends</h2>
          <div v-if="chartData.labels.length > 0" class="h-72">
            <LineChart
              :labels="chartData.labels"
              :datasets="[
                { label: 'Total Clicks', data: chartData.clicks },
                { label: 'Unique Visitors', data: chartData.uniqueClicks }
              ]"
              :height="280"
            />
          </div>
          <div v-else class="flex flex-col items-center justify-center h-72 text-gray-400">
            <ChartBarIcon class="h-12 w-12 mb-2" />
            <p>Loading chart...</p>
            <p class="text-sm">{{ chartData.labels.length }} data points</p>
          </div>
        </div>

        <!-- Geographic Distribution & Device Types -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Geographic Distribution -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
            <div v-if="geoData.length > 0" class="space-y-3">
              <div v-for="item in geoData" :key="item.country" class="flex items-center">
                <GlobeAltIcon class="h-5 w-5 text-gray-400 mr-3" />
                <span class="w-28 text-gray-700">{{ item.country }}</span>
                <div class="flex-1 mx-3">
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{ width: `${(item.clicks / maxGeoClicks) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <span class="text-gray-600 text-sm w-12 text-right">{{ item.clicks }}</span>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-48 text-gray-400">
              No geographic data available
            </div>
          </div>

          <!-- Device Types -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Device Types</h2>
            <div v-if="deviceData.length > 0" class="space-y-3">
              <div v-for="(item, index) in deviceData" :key="item.type" class="flex items-center">
                <component :is="getDeviceIcon(item.type)" class="h-5 w-5 text-gray-400 mr-3" />
                <span class="w-20 text-gray-700">{{ item.type }}</span>
                <div class="flex-1 mx-3">
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="deviceColors[index % deviceColors.length]"
                      :style="{ width: `${(item.clicks / maxDeviceClicks) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <span class="text-gray-600 text-sm w-12 text-right">{{ item.clicks }}</span>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-48 text-gray-400">
              No device data available
            </div>
          </div>
        </div>

        <!-- Traffic Sources -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="source in trafficSources"
              :key="source.name"
              class="bg-gray-50 rounded-lg p-4 text-center"
            >
              <p class="text-2xl font-bold text-gray-900">{{ source.clicks }}</p>
              <p class="text-gray-600">{{ source.name }}</p>
              <p class="text-sm text-gray-400">{{ source.percentage }}%</p>
            </div>
          </div>
        </div>

        <!-- Detailed Data Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div
            class="p-6 flex items-center justify-between cursor-pointer"
            @click="showDetailedData = !showDetailedData"
          >
            <h2 class="text-lg font-semibold text-gray-900">Detailed Data</h2>
            <button class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {{ showDetailedData ? 'Hide' : 'Show' }} Detailed Data
            </button>
          </div>

          <div v-if="showDetailedData" class="px-6 pb-6">
            <!-- Browser Statistics -->
            <h3 class="text-md font-medium text-gray-800 mb-3">Browser Statistics</h3>
            <div v-if="browserData.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Browser</th>
                    <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Clicks</th>
                    <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in browserData" :key="item.browser" class="border-b border-gray-100">
                    <td class="py-3 px-4 text-gray-900">{{ item.browser }}</td>
                    <td class="py-3 px-4 text-right text-gray-600">{{ item.clicks }}</td>
                    <td class="py-3 px-4 text-right text-gray-600">{{ (item.percentage * 100).toFixed(1) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No browser data available
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useLinkStore } from '@/stores/link'
import { useUIStore } from '@/stores/ui'
import { analyticsService } from '@/services/analytics.service'
import { formatNumber } from '@/utils/formatters'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LineChart from '@/components/charts/LineChart.vue'
import {
  CursorArrowRaysIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon
} from '@heroicons/vue/24/outline'

const linkStore = useLinkStore()
const uiStore = useUIStore()

const isLoading = ref(true)
const selectedPeriod = ref('week')
const selectedLink = ref('')
const showDetailedData = ref(false)
const links = ref<Array<{ id: number; title?: string; short_code: string; click_count: number }>>([])

const summary = ref<{
  total_clicks: number
  unique_clicks: number
  peak_hour?: string
  peak_day?: string
} | null>(null)

const chartData = reactive({
  labels: [] as string[],
  clicks: [] as number[],
  uniqueClicks: [] as number[]
})

const deviceData = ref<Array<{ type: string; clicks: number }>>([])
const geoData = ref<Array<{ country: string; clicks: number }>>([])
const browserData = ref<Array<{ browser: string; clicks: number; percentage: number }>>([])
const trafficSources = ref<Array<{ name: string; clicks: number; percentage: string }>>([
  { name: 'Direct', clicks: 0, percentage: '0' },
  { name: 'Google', clicks: 0, percentage: '0' },
  { name: 'Twitter', clicks: 0, percentage: '0' },
  { name: 'Others', clicks: 0, percentage: '0' }
])

const deviceColors = ['bg-green-500', 'bg-green-400', 'bg-green-300']

const maxGeoClicks = computed(() => {
  return Math.max(...geoData.value.map(g => g.clicks), 1)
})

const maxDeviceClicks = computed(() => {
  return Math.max(...deviceData.value.map(d => d.clicks), 1)
})

function getDeviceIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'desktop':
      return ComputerDesktopIcon
    case 'mobile':
      return DevicePhoneMobileIcon
    case 'tablet':
      return DeviceTabletIcon
    default:
      return ComputerDesktopIcon
  }
}

async function fetchAnalytics() {
  isLoading.value = true

  try {
    if (selectedLink.value) {
      const data = await analyticsService.getLinkAnalytics(
        Number(selectedLink.value),
        { period: selectedPeriod.value as 'day' | 'week' | 'month' }
      )

      summary.value = {
        total_clicks: data.summary?.total_clicks || 0,
        unique_clicks: data.summary?.unique_clicks || 0,
        peak_hour: data.summary?.peak_hour,
        peak_day: data.summary?.peak_day
      }

      if (data.time_series && data.time_series.length > 0) {
        chartData.labels = data.time_series.map((t: { date: string }) => t.date)
        chartData.clicks = data.time_series.map((t: { clicks: number }) => t.clicks)
        chartData.uniqueClicks = data.time_series.map((t: { unique_clicks?: number }) => t.unique_clicks || 0)
      } else {
        chartData.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        chartData.clicks = [0, 0, 0, 0, 0, 0, 0]
        chartData.uniqueClicks = [0, 0, 0, 0, 0, 0, 0]
      }

      if (data.devices && data.devices.length > 0) {
        deviceData.value = data.devices.map((d: { type: string; clicks: number }) => ({
          type: d.type,
          clicks: d.clicks
        }))
      } else {
        deviceData.value = [
          { type: 'Desktop', clicks: 0 },
          { type: 'Mobile', clicks: 0 },
          { type: 'Tablet', clicks: 0 }
        ]
      }

      if (data.geographic && data.geographic.length > 0) {
        geoData.value = data.geographic.slice(0, 5).map((g: { country: string; clicks: number }) => ({
          country: g.country,
          clicks: g.clicks
        }))
      } else {
        geoData.value = []
      }

      if (data.browsers && data.browsers.length > 0) {
        browserData.value = data.browsers.map((b: { browser: string; clicks: number; percentage: number }) => ({
          browser: b.browser,
          clicks: b.clicks,
          percentage: b.percentage
        }))
      } else {
        browserData.value = []
      }

      // Traffic sources (mock or from referrers data)
      if (data.referrers && data.referrers.length > 0) {
        const total = data.referrers.reduce((sum: number, r: { clicks: number }) => sum + r.clicks, 0)
        trafficSources.value = data.referrers.slice(0, 4).map((r: { source: string; clicks: number }) => ({
          name: r.source,
          clicks: r.clicks,
          percentage: total > 0 ? ((r.clicks / total) * 100).toFixed(0) : '0'
        }))
      }
    } else {
      const data = await analyticsService.getDashboard({
        period: selectedPeriod.value as 'day' | 'week' | 'month'
      })

      summary.value = {
        total_clicks: data.total_clicks || 0,
        unique_clicks: data.today_clicks || 0
      }

      chartData.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      chartData.clicks = [0, 0, 0, 0, 0, 0, 0]
      chartData.uniqueClicks = [0, 0, 0, 0, 0, 0, 0]

      deviceData.value = []
      geoData.value = []
      browserData.value = []
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    summary.value = { total_clicks: 0, unique_clicks: 0 }
  }

  isLoading.value = false
}

function exportData() {
  // 导出数据为 CSV
  const rows = [
    ['Metric', 'Value'],
    ['Total Clicks', summary.value?.total_clicks?.toString() || '0'],
    ['Unique Visitors', summary.value?.unique_clicks?.toString() || '0'],
    ['Peak Hour', summary.value?.peak_hour || 'N/A'],
    ['Peak Day', summary.value?.peak_day || 'N/A']
  ]

  // 添加设备数据
  if (deviceData.value.length > 0) {
    rows.push(['', ''])
    rows.push(['Device', 'Clicks'])
    deviceData.value.forEach(d => {
      rows.push([d.type, d.clicks.toString()])
    })
  }

  // 添加地理数据
  if (geoData.value.length > 0) {
    rows.push(['', ''])
    rows.push(['Country', 'Clicks'])
    geoData.value.forEach(g => {
      rows.push([g.country, g.clicks.toString()])
    })
  }

  const csvContent = rows.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `analytics-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  uiStore.success('Data exported successfully')
}

onMounted(async () => {
  await linkStore.fetchLinks({ limit: 100 })
  links.value = linkStore.links.map(l => ({
    id: l.id,
    title: l.title,
    short_code: l.short_code,
    click_count: l.click_count
  }))
  await fetchAnalytics()
})
</script>
