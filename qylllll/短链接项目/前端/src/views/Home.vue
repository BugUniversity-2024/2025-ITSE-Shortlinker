<template>
  <div class="min-h-screen gradient-bg">
    <!-- 导航栏 -->
    <nav class="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <LinkIcon class="h-8 w-8 text-primary-600" />
            <span class="ml-2 text-xl font-bold text-secondary-900">短链接系统</span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
            >
              登录
            </router-link>
            <router-link
              to="/register"
              class="btn-primary"
            >
              注册
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
            简化您的
            <span class="text-primary-600">链接分享</span>
          </h1>
          <p class="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
            专业的短链接生成工具，让您的链接更简洁、更易记。支持数据统计、二维码生成、自定义短码等功能。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/register"
              class="btn-primary text-lg px-8 py-3"
            >
              免费开始使用
            </router-link>
            <button
              @click="scrollToFeatures"
              class="btn-outline text-lg px-8 py-3"
            >
              了解更多
            </button>
          </div>
        </div>

        <!-- 演示区域 -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">试用短链接生成</h3>
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                v-model="demoUrl"
                type="url"
                placeholder="输入您要缩短的链接..."
                class="input-field flex-1"
              >
              <button
                @click="generateDemo"
                :disabled="!demoUrl || isGenerating"
                class="btn-primary whitespace-nowrap"
              >
                <span v-if="isGenerating">生成中...</span>
                <span v-else>生成短链接</span>
              </button>
            </div>
            <div v-if="demoResult" class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-green-600 mb-2">生成成功！</p>
              <div class="flex items-center justify-between bg-white rounded p-3">
                <span class="text-primary-600 font-medium">{{ demoResult }}</span>
                <button
                  @click="copyToClipboard(demoResult)"
                  class="text-secondary-500 hover:text-primary-600"
                >
                  <ClipboardIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresSection" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            强大的功能特性
          </h2>
          <p class="text-lg text-secondary-600 max-w-2xl mx-auto">
            提供全面的短链接解决方案，满足个人和企业的各种需求
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <component :is="feature.icon" class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-secondary-900 mb-3">{{ feature.title }}</h3>
            <p class="text-secondary-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-20 bg-secondary-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            用数据说话
          </h2>
          <p class="text-lg text-secondary-600">
            已为全球用户提供可靠的短链接服务
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-secondary-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          准备开始了吗？
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          立即注册，体验专业的短链接服务
        </p>
        <router-link
          to="/register"
          class="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
        >
          免费注册
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-secondary-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <LinkIcon class="h-6 w-6 text-primary-400" />
              <span class="ml-2 text-lg font-bold">短链接系统</span>
            </div>
            <p class="text-secondary-400">
              专业、可靠的短链接服务平台
            </p>
          </div>
          <div>
            <h3 class="font-semibold mb-4">产品</h3>
            <ul class="space-y-2 text-secondary-400">
              <li><a href="#" class="hover:text-white">链接缩短</a></li>
              <li><a href="#" class="hover:text-white">数据分析</a></li>
              <li><a href="#" class="hover:text-white">API接口</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4">支持</h3>
            <ul class="space-y-2 text-secondary-400">
              <li><a href="#" class="hover:text-white">帮助中心</a></li>
              <li><a href="#" class="hover:text-white">联系我们</a></li>
              <li><a href="#" class="hover:text-white">API文档</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4">公司</h3>
            <ul class="space-y-2 text-secondary-400">
              <li><a href="#" class="hover:text-white">关于我们</a></li>
              <li><a href="#" class="hover:text-white">隐私政策</a></li>
              <li><a href="#" class="hover:text-white">服务条款</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
          <p>&copy; 2025 短链接系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import {
  LinkIcon,
  ClipboardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  CogIcon,
  RocketLaunchIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const demoUrl = ref('')
const demoResult = ref('')
const isGenerating = ref(false)
const featuresSection = ref(null)

const features = [
  {
    title: '快速生成',
    description: '一键生成短链接，支持自定义短码，满足个性化需求',
    icon: RocketLaunchIcon
  },
  {
    title: '数据统计',
    description: '详细的点击统计和分析报告，了解链接表现',
    icon: ChartBarIcon
  },
  {
    title: '安全可靠',
    description: '多重安全防护，恶意链接检测，保障用户安全',
    icon: ShieldCheckIcon
  },
  {
    title: '二维码生成',
    description: '自动生成二维码，支持多种格式和尺寸',
    icon: QrCodeIcon
  },
  {
    title: '批量管理',
    description: '批量创建和管理链接，提升工作效率',
    icon: CogIcon
  },
  {
    title: '团队协作',
    description: '支持团队共享和权限管理，适合企业使用',
    icon: UserGroupIcon
  }
]

const stats = [
  { value: '100万+', label: '生成链接' },
  { value: '50万+', label: '注册用户' },
  { value: '99.9%', label: '服务可用性' },
  { value: '24/7', label: '技术支持' }
]

const generateDemo = async () => {
  if (!demoUrl.value) return

  isGenerating.value = true
  
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 生成示例短链接
  const shortCode = Math.random().toString(36).substring(2, 8)
  demoResult.value = `https://short.ly/${shortCode}`
  
  isGenerating.value = false
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加提示消息
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>