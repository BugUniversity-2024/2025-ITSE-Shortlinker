<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-gray-600">Welcome back, {{ userStore.user?.username }}</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Links</p>
              <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.total_links }}</p>
            </div>
            <div class="p-3 bg-primary-100 rounded-full">
              <LinkIcon class="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Clicks</p>
              <p class="mt-1 text-3xl font-semibold text-gray-900">{{ formatNumber(stats.total_clicks) }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <CursorArrowRaysIcon class="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Today's Clicks</p>
              <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.today_clicks }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full">
              <CalendarIcon class="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Growth Rate</p>
              <p class="mt-1 text-3xl font-semibold" :class="stats.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ stats.growth_rate >= 0 ? '+' : '' }}{{ stats.growth_rate }}%
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <ArrowTrendingUpIcon class="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <router-link to="/generator" class="card hover:shadow-md transition-shadow group">
          <div class="flex items-center">
            <div class="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <PlusIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-4">
              <h3 class="font-medium text-gray-900">Create Link</h3>
              <p class="text-sm text-gray-500">Generate a new short link</p>
            </div>
          </div>
        </router-link>

        <router-link to="/dashboard/links" class="card hover:shadow-md transition-shadow group">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <ListBulletIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <h3 class="font-medium text-gray-900">Manage Links</h3>
              <p class="text-sm text-gray-500">View and edit all links</p>
            </div>
          </div>
        </router-link>

        <router-link to="/dashboard/analytics" class="card hover:shadow-md transition-shadow group">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
              <ChartBarIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <h3 class="font-medium text-gray-900">Analytics</h3>
              <p class="text-sm text-gray-500">View detailed statistics</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Recent Links -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Recently Created Links</h2>
          <router-link to="/dashboard/links" class="text-sm text-primary-600 hover:text-primary-700">
            View All
          </router-link>
        </div>

        <div v-if="isLoading" class="flex justify-center py-8">
          <LoadingSpinner />
        </div>

        <div v-else-if="recentLinks.length === 0" class="text-center py-8 text-gray-500">
          No links yet. Create your first one!
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="link in recentLinks"
            :key="link.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ link.title || link.short_code }}</p>
              <p class="text-sm text-gray-500 truncate">{{ link.original_url }}</p>
            </div>
            <div class="ml-4 flex items-center space-x-4">
              <span class="text-sm text-gray-500">{{ link.click_count }} clicks</span>
              <span class="text-sm text-gray-400">{{ formatDate(link.created_at, 'relative') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { analyticsService } from '@/services/analytics.service'
import { formatNumber, formatDate } from '@/utils/formatters'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  LinkIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  ListBulletIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const userStore = useUserStore()

const isLoading = ref(true)
const stats = ref({
  total_links: 0,
  total_clicks: 0,
  today_clicks: 0,
  growth_rate: 0
})
const recentLinks = ref<Array<{
  id: number
  short_code: string
  original_url: string
  title?: string
  click_count: number
  created_at: string
}>>([])

onMounted(async () => {
  try {
    const data = await analyticsService.getDashboard()
    stats.value = {
      total_links: data.total_links,
      total_clicks: data.total_clicks,
      today_clicks: data.today_clicks,
      growth_rate: data.growth_rate
    }
    recentLinks.value = data.recent_links || []
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
