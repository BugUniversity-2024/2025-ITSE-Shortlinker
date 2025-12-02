<template>
  <div class="min-h-screen gradient-bg">
    <!-- 导航栏 -->
    <nav class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <LinkIcon class="h-8 w-8 text-primary-600" />
            <span class="ml-2 text-xl font-bold text-gray-900">TinyBridge</span>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Login
            </router-link>
            <router-link to="/register" class="btn-primary">
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simplify Your
            <span class="text-primary-600">Link Sharing</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional URL shortening tool that makes your links cleaner and easier to remember. Supports analytics, QR code generation, custom short codes, and more.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/register" class="btn-primary text-lg px-8 py-3">
              Get Started Free
            </router-link>
            <button @click="scrollToFeatures" class="btn-outline text-lg px-8 py-3">
              Learn More
            </button>
          </div>
        </div>

        <!-- Demo Section -->
        <div class="mt-16 max-w-4xl mx-auto">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Try URL Shortening</h3>
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                v-model="demoUrl"
                type="url"
                placeholder="Enter the URL you want to shorten..."
                class="input-field flex-1"
              />
              <button
                @click="generateDemo"
                :disabled="!demoUrl || isGenerating"
                class="btn-primary whitespace-nowrap"
              >
                {{ isGenerating ? 'Generating...' : 'Shorten URL' }}
              </button>
            </div>
            <div v-if="demoResult" class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-green-600 mb-2">Generated successfully!</p>
              <div class="flex items-center justify-between bg-white rounded p-3">
                <span class="text-primary-600 font-medium">{{ demoResult }}</span>
                <button
                  @click="copyToClipboard(demoResult)"
                  class="text-gray-500 hover:text-primary-600"
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
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive URL shortening solutions for individuals and businesses
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="feature in features" :key="feature.title" class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <component :is="feature.icon" class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Numbers Speak</h2>
          <p class="text-lg text-gray-600">Providing reliable URL shortening services to users worldwide</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-gray-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-xl text-primary-100 mb-8">Sign up now and experience professional URL shortening</p>
        <router-link
          to="/register"
          class="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Sign Up Free
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <LinkIcon class="h-6 w-6 text-primary-400" />
              <span class="ml-2 text-lg font-bold">TinyBridge</span>
            </div>
            <p class="text-gray-400">Professional and reliable URL shortening platform</p>
          </div>
          <div>
            <h3 class="font-semibold mb-4">Product</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">URL Shortening</a></li>
              <li><a href="#" class="hover:text-white">Analytics</a></li>
              <li><a href="#" class="hover:text-white">API</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Help Center</a></li>
              <li><a href="#" class="hover:text-white">Contact Us</a></li>
              <li><a href="#" class="hover:text-white">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">About Us</a></li>
              <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 TinyBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'
import { useUIStore } from '@/stores/ui'
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
const featuresSection = ref<HTMLElement | null>(null)

const { copy } = useClipboard()
const uiStore = useUIStore()

const features = [
  { title: 'Quick Generation', description: 'One-click URL shortening with custom short codes for personalized needs', icon: RocketLaunchIcon },
  { title: 'Analytics', description: 'Detailed click statistics and analysis reports to understand link performance', icon: ChartBarIcon },
  { title: 'Secure & Reliable', description: 'Multiple security protections, malicious link detection, ensuring user safety', icon: ShieldCheckIcon },
  { title: 'QR Code Generation', description: 'Automatically generate QR codes in various formats and sizes', icon: QrCodeIcon },
  { title: 'Batch Management', description: 'Create and manage links in bulk to improve efficiency', icon: CogIcon },
  { title: 'Team Collaboration', description: 'Team sharing and permission management, perfect for enterprises', icon: UserGroupIcon }
]

const stats = [
  { value: '1M+', label: 'Links Created' },
  { value: '500K+', label: 'Registered Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
]

async function generateDemo() {
  if (!demoUrl.value) return

  isGenerating.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  const shortCode = Math.random().toString(36).substring(2, 8)
  demoResult.value = `https://tiny.link/${shortCode}`

  isGenerating.value = false
}

async function copyToClipboard(text: string) {
  const success = await copy(text)
  if (success) {
    uiStore.success('Link copied')
  }
}

function scrollToFeatures() {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
