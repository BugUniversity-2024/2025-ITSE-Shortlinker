<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="mt-1 text-gray-600">View your link statistics</p>
      </div>

      <!-- Time Range Selection -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4">
          <select v-model="selectedPeriod" class="input-field w-40" @change="fetchAnalytics">
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select v-model="selectedLink" class="input-field w-64" @change="fetchAnalytics">
            <option value="">All Links (Dashboard)</option>
            <option v-for="link in links" :key="link.id" :value="link.id">
              {{ link.title || link.short_code }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4" v-if="summary">
          <div class="card">
            <div class="text-sm text-gray-500">Total Clicks</div>
            <div class="text-2xl font-bold text-gray-900">{{ summary.total_clicks }}</div>
          </div>
          <div class="card">
            <div class="text-sm text-gray-500">Unique Visitors</div>
            <div class="text-2xl font-bold text-gray-900">{{ summary.unique_clicks }}</div>
          </div>
          <div class="card" v-if="summary.peak_hour">
            <div class="text-sm text-gray-500">Peak Hour</div>
            <div class="text-2xl font-bold text-gray-900">{{ summary.peak_hour }}</div>
          </div>
          <div class="card" v-if="summary.peak_day">
            <div class="text-sm text-gray-500">Peak Day</div>
            <div class="text-2xl font-bold text-gray-900">{{ summary.peak_day }}</div>
          </div>
        </div>

        <!-- Click Trends -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Click Trends</h2>
          <LineChart
            :labels="chartData.labels"
            :datasets="[
              { label: 'Total Clicks', data: chartData.clicks },
              { label: 'Unique Visitors', data: chartData.uniqueClicks }
            ]"
            :height="300"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Device Distribution -->
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h2>
            <div v-if="deviceData.labels.length > 0">
              <PieChart
                :labels="deviceData.labels"
                :data="deviceData.values"
                :height="250"
              />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No device data available
            </div>
          </div>

          <!-- Geographic Distribution -->
          <div class="card">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
            <div v-if="geoData.labels.length > 0">
              <BarChart
                :labels="geoData.labels"
                :datasets="[{ label: 'Clicks', data: geoData.values }]"
                :height="250"
                :horizontal="true"
              />
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No geographic data available
            </div>
          </div>
        </div>

        <!-- Detailed Statistics Table -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Browser Statistics</h2>
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useLinkStore } from '@/stores/link'
import { analyticsService } from '@/services/analytics.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

const linkStore = useLinkStore()

const isLoading = ref(true)
const selectedPeriod = ref('week')
const selectedLink = ref('')
const links = ref<Array<{ id: number; title?: string; short_code: string }>>([])

const summary = ref<{ total_clicks: number; unique_clicks: number; peak_hour?: string; peak_day?: string } | null>(null)

const chartData = reactive({
  labels: [] as string[],
  clicks: [] as number[],
  uniqueClicks: [] as number[]
})

const deviceData = reactive({
  labels: [] as string[],
  values: [] as number[]
})

const geoData = reactive({
  labels: [] as string[],
  values: [] as number[]
})

const browserData = ref<Array<{ browser: string; clicks: number; percentage: number }>>([])

async function fetchAnalytics() {
  isLoading.value = true

  try {
    if (selectedLink.value) {
      // 获取单个链接的统计
      const data = await analyticsService.getLinkAnalytics(
        Number(selectedLink.value),
        { period: selectedPeriod.value as 'day' | 'week' | 'month' }
      )

      // Summary
      summary.value = {
        total_clicks: data.summary?.total_clicks || 0,
        unique_clicks: data.summary?.unique_clicks || 0,
        peak_hour: data.summary?.peak_hour,
        peak_day: data.summary?.peak_day
      }

      // Time series (如果有的话)
      if (data.time_series && data.time_series.length > 0) {
        chartData.labels = data.time_series.map((t: { date: string }) => t.date)
        chartData.clicks = data.time_series.map((t: { clicks: number }) => t.clicks)
        chartData.uniqueClicks = data.time_series.map((t: { unique_clicks?: number }) => t.unique_clicks || 0)
      } else {
        // 默认显示周数据
        chartData.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        chartData.clicks = [0, 0, 0, 0, 0, 0, 0]
        chartData.uniqueClicks = [0, 0, 0, 0, 0, 0, 0]
      }

      // Device distribution
      if (data.devices && data.devices.length > 0) {
        deviceData.labels = data.devices.map((d: { type: string }) => d.type)
        deviceData.values = data.devices.map((d: { clicks: number }) => d.clicks)
      } else {
        deviceData.labels = []
        deviceData.values = []
      }

      // Geographic distribution
      if (data.geographic && data.geographic.length > 0) {
        geoData.labels = data.geographic.map((g: { country: string }) => g.country)
        geoData.values = data.geographic.map((g: { clicks: number }) => g.clicks)
      } else {
        geoData.labels = []
        geoData.values = []
      }

      // Browser statistics
      if (data.browsers && data.browsers.length > 0) {
        browserData.value = data.browsers.map((b: { browser: string; clicks: number; percentage: number }) => ({
          browser: b.browser,
          clicks: b.clicks,
          percentage: b.percentage
        }))
      } else {
        browserData.value = []
      }
    } else {
      // 获取仪表板数据（所有链接汇总）
      const data = await analyticsService.getDashboard({
        period: selectedPeriod.value as 'day' | 'week' | 'month'
      })

      summary.value = {
        total_clicks: data.total_clicks || 0,
        unique_clicks: data.today_clicks || 0
      }

      // 仪表板数据默认显示
      chartData.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      chartData.clicks = [0, 0, 0, 0, 0, 0, 0]
      chartData.uniqueClicks = [0, 0, 0, 0, 0, 0, 0]

      deviceData.labels = []
      deviceData.values = []
      geoData.labels = []
      geoData.values = []
      browserData.value = []
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    summary.value = { total_clicks: 0, unique_clicks: 0 }
  }

  isLoading.value = false
}

onMounted(async () => {
  await linkStore.fetchLinks({ limit: 100 })
  links.value = linkStore.links.map(l => ({
    id: l.id,
    title: l.title,
    short_code: l.short_code
  }))
  await fetchAnalytics()
})
</script>
