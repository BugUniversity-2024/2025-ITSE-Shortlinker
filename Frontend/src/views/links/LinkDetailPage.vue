<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <router-link to="/dashboard/links" class="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon class="h-5 w-5" />
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ link?.title || link?.short_code || 'Link Details' }}
            </h1>
            <p class="mt-1 text-gray-600">View link statistics and details</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <router-link
            :to="`/links/${id}/landing`"
            class="btn-secondary"
          >
            <DocumentTextIcon class="h-5 w-5 mr-2" />
            Edit Landing Page
          </router-link>
          <BaseButton variant="primary" @click="showEditModal = true">
            <PencilIcon class="h-5 w-5 mr-2" />
            Edit
          </BaseButton>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="link" class="space-y-6">
        <!-- Link Info Card -->
        <div class="card">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-4">
                <a
                  :href="link.short_url"
                  target="_blank"
                  class="text-lg font-medium text-primary-600 hover:text-primary-700"
                >
                  {{ link.short_url }}
                </a>
                <button @click="copyLink" class="text-gray-400 hover:text-gray-600">
                  <ClipboardDocumentIcon class="h-5 w-5" />
                </button>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ link.is_active ? 'Active' : 'Disabled' }}
                </span>
              </div>

              <div class="text-sm text-gray-600 space-y-2">
                <p><strong>Original URL:</strong> {{ link.original_url }}</p>
                <p v-if="link.description"><strong>Description:</strong> {{ link.description }}</p>
                <p v-if="link.tags"><strong>Tags:</strong> {{ link.tags }}</p>
                <p><strong>Created:</strong> {{ formatDate(link.created_at) }}</p>
                <p v-if="link.expires_at"><strong>Expires:</strong> {{ formatDate(link.expires_at) }}</p>
              </div>
            </div>

            <!-- QR Code -->
            <div class="ml-6">
              <QRCodeGenerator :url="link.short_url" :size="120" />
            </div>
          </div>
        </div>

        <!-- Statistics Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="card">
            <div class="text-sm text-gray-500">Total Clicks</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(link.click_count) }}</div>
          </div>
          <div class="card" v-if="analytics">
            <div class="text-sm text-gray-500">Unique Visitors</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(analytics.summary?.unique_clicks || 0) }}</div>
          </div>
          <div class="card" v-if="analytics?.summary?.peak_hour">
            <div class="text-sm text-gray-500">Peak Hour</div>
            <div class="text-2xl font-bold text-gray-900">{{ analytics.summary.peak_hour }}</div>
          </div>
          <div class="card" v-if="analytics?.summary?.peak_day">
            <div class="text-sm text-gray-500">Peak Day</div>
            <div class="text-2xl font-bold text-gray-900">{{ analytics.summary.peak_day }}</div>
          </div>
        </div>

        <!-- Analytics Charts -->
        <div v-if="analytics" class="space-y-6">
          <!-- Click Trends -->
          <div class="card" v-if="chartData.labels.length > 0">
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
            <div class="card" v-if="deviceData.labels.length > 0">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h2>
              <PieChart
                :labels="deviceData.labels"
                :data="deviceData.values"
                :height="250"
              />
            </div>

            <!-- Geographic Distribution -->
            <div class="card" v-if="geoData.labels.length > 0">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
              <BarChart
                :labels="geoData.labels"
                :datasets="[{ label: 'Clicks', data: geoData.values }]"
                :height="250"
                :horizontal="true"
              />
            </div>
          </div>

          <!-- Browser Statistics -->
          <div class="card" v-if="browserData.length > 0">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Browser Statistics</h2>
            <div class="overflow-x-auto">
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
          </div>
        </div>
      </div>

      <div v-else class="card text-center py-12">
        <p class="text-gray-500">Link not found</p>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditLinkModal
      v-model="showEditModal"
      :link="link"
      @updated="fetchLink"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useLinkStore } from '@/stores/link'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { analyticsService } from '@/services/analytics.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import EditLinkModal from '@/components/links/EditLinkModal.vue'
import QRCodeGenerator from '@/components/links/QRCodeGenerator.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import {
  ArrowLeftIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import type { ShortLink } from '@/types'

interface Props {
  id: string
}

const props = defineProps<Props>()

const linkStore = useLinkStore()
const uiStore = useUIStore()
const { copy } = useClipboard()

const isLoading = ref(true)
const link = ref<ShortLink | null>(null)
const showEditModal = ref(false)
const analytics = ref<{
  summary?: { total_clicks: number; unique_clicks: number; peak_hour?: string; peak_day?: string }
  time_series?: Array<{ date: string; clicks: number; unique_clicks?: number }>
  devices?: Array<{ type: string; clicks: number }>
  geographic?: Array<{ country: string; clicks: number }>
  browsers?: Array<{ browser: string; clicks: number; percentage: number }>
} | null>(null)

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

async function copyLink() {
  if (!link.value) return
  const success = await copy(link.value.short_url)
  if (success) {
    uiStore.success('Link copied')
  }
}

async function fetchLink() {
  const result = await linkStore.fetchLinkById(Number(props.id))
  link.value = result
}

async function fetchAnalytics() {
  try {
    const data = await analyticsService.getLinkAnalytics(Number(props.id), { period: 'week' })
    analytics.value = data

    // Process time series
    if (data.time_series && data.time_series.length > 0) {
      chartData.labels = data.time_series.map((t: { date: string }) => t.date)
      chartData.clicks = data.time_series.map((t: { clicks: number }) => t.clicks)
      chartData.uniqueClicks = data.time_series.map((t: { unique_clicks?: number }) => t.unique_clicks || 0)
    }

    // Process device data
    if (data.devices && data.devices.length > 0) {
      deviceData.labels = data.devices.map((d: { type: string }) => d.type)
      deviceData.values = data.devices.map((d: { clicks: number }) => d.clicks)
    }

    // Process geographic data
    if (data.geographic && data.geographic.length > 0) {
      geoData.labels = data.geographic.map((g: { country: string }) => g.country)
      geoData.values = data.geographic.map((g: { clicks: number }) => g.clicks)
    }

    // Process browser data
    if (data.browsers && data.browsers.length > 0) {
      browserData.value = data.browsers
    }
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  }
}

onMounted(async () => {
  isLoading.value = true
  await fetchLink()
  if (link.value) {
    await fetchAnalytics()
  }
  isLoading.value = false
})
</script>
