<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">仪表板</h1>
        <p class="mt-1 text-secondary-600">欢迎回来，{{ authStore.user?.username }}！</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="p-3 rounded-lg" :class="stat.bgColor">
                <component :is="stat.icon" class="h-6 w-6" :class="stat.iconColor" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-secondary-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-secondary-900">{{ stat.value }}</p>
              <p class="text-sm" :class="stat.change >= 0 ? 'text-green-600' : 'text-red-600'">
                <span class="flex items-center">
                  <ArrowUpIcon v-if="stat.change >= 0" class="h-4 w-4 mr-1" />
                  <ArrowDownIcon v-else class="h-4 w-4 mr-1" />
                  {{ Math.abs(stat.change) }}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 最近创建的链接 -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-secondary-900">最近创建的链接</h3>
            <div class="flex items-center space-x-4">
              <router-link
                to="/dashboard/links"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                查看全部
              </router-link>
              <router-link
                to="/generator"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                创建新链接
              </router-link>
            </div>
          </div>
          
          <div v-if="recentLinks.length === 0" class="text-center py-8">
            <LinkIcon class="mx-auto h-12 w-12 text-secondary-400" />
            <h3 class="mt-2 text-sm font-medium text-secondary-900">暂无链接</h3>
            <p class="mt-1 text-sm text-secondary-500">开始创建您的第一个短链接吧！</p>
            <div class="mt-6">
              <router-link
                to="/generator"
                class="btn-primary"
              >
                创建链接
              </router-link>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="link in recentLinks"
              :key="link.id"
              class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary-900 truncate">
                  {{ link.description || link.original_url }}
                </p>
                <p class="text-xs text-primary-600">{{ link.short_url }}</p>
                <p class="text-xs text-secondary-500">
                  {{ formatDate(link.created_at) }} · {{ link.click_count }} 次点击
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="copyToClipboard(link.short_url)"
                  class="text-secondary-400 hover:text-secondary-600"
                  title="复制链接"
                >
                  <ClipboardIcon class="h-4 w-4" />
                </button>
                <router-link
                  :to="`/analytics?link=${link.id}`"
                  class="text-secondary-400 hover:text-secondary-600"
                  title="查看统计"
                >
                  <ChartBarIcon class="h-4 w-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 点击趋势图 -->
        <div class="card">
          <h3 class="text-lg font-semibold text-secondary-900 mb-4">点击趋势</h3>
          <div class="h-64 flex items-center justify-center bg-secondary-50 rounded-lg">
            <div class="text-center">
              <ChartBarIcon class="mx-auto h-12 w-12 text-secondary-400" />
              <p class="mt-2 text-sm text-secondary-500">图表数据加载中...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-secondary-900 mb-4">快速操作</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link
            to="/generator"
            class="p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <div class="text-center">
              <PlusIcon class="mx-auto h-8 w-8 text-secondary-400 group-hover:text-primary-600" />
              <h4 class="mt-2 text-sm font-medium text-secondary-900">创建短链接</h4>
              <p class="text-xs text-secondary-500">快速生成新的短链接</p>
            </div>
          </router-link>

          <button
            @click="showBatchModal = true"
            class="p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <div class="text-center">
              <DocumentDuplicateIcon class="mx-auto h-8 w-8 text-secondary-400 group-hover:text-primary-600" />
              <h4 class="mt-2 text-sm font-medium text-secondary-900">批量创建</h4>
              <p class="text-xs text-secondary-500">一次创建多个链接</p>
            </div>
          </button>

          <router-link
            to="/analytics"
            class="p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <div class="text-center">
              <ChartBarIcon class="mx-auto h-8 w-8 text-secondary-400 group-hover:text-primary-600" />
              <h4 class="mt-2 text-sm font-medium text-secondary-900">查看统计</h4>
              <p class="text-xs text-secondary-500">分析链接表现</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLinksStore } from '@/stores/links'
import DashboardLayout from '@/components/DashboardLayout.vue'
import {
  LinkIcon,
  ChartBarIcon,
  ClipboardIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const linksStore = useLinksStore()

const showBatchModal = ref(false)

const stats = ref([
  {
    label: '总链接数',
    value: '0',
    change: 0,
    icon: LinkIcon,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    label: '总点击数',
    value: '0',
    change: 0,
    icon: CursorArrowRaysIcon,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    label: '今日点击',
    value: '0',
    change: 0,
    icon: EyeIcon,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    label: '独立访客',
    value: '0',
    change: 0,
    icon: UserGroupIcon,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  }
])

const recentLinks = computed(() => {
  return linksStore.links.slice(0, 5)
})

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
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  // 获取最近的链接
  await linksStore.fetchLinks({ limit: 5, sort: 'created_desc' })
  
  // 更新统计数据
  stats.value[0].value = linksStore.links.length.toString()
  
  const totalClicks = linksStore.links.reduce((sum, link) => sum + link.click_count, 0)
  stats.value[1].value = totalClicks.toString()
  
  // 这里可以添加更多的统计数据获取逻辑
})
</script>