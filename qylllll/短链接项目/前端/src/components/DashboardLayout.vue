<template>
  <div class="min-h-screen bg-secondary-50">
    <!-- 侧边栏 -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0" :class="{ '-translate-x-full': !sidebarOpen }">
      <div class="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
        <LinkIcon class="h-8 w-8 text-primary-600" />
        <span class="ml-2 text-xl font-bold text-secondary-900">短链接系统</span>
      </div>
      
      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="$route.name === item.name 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5"
              :class="$route.name === item.name ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'"
            />
            {{ item.label }}
          </router-link>
        </div>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitial }}</span>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-secondary-900">{{ authStore.user?.username }}</p>
            <p class="text-xs text-secondary-500">{{ authStore.user?.plan_type }}</p>
          </div>
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center text-secondary-400 hover:text-secondary-600">
              <EllipsisVerticalIcon class="h-5 w-5" />
            </MenuButton>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems class="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1">
                  <MenuItem v-slot="{ active }">
                    <router-link
                      to="/profile"
                      :class="[active ? 'bg-secondary-100' : '', 'block px-4 py-2 text-sm text-secondary-700']"
                    >
                      个人设置
                    </router-link>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleLogout"
                      :class="[active ? 'bg-secondary-100' : '', 'block w-full text-left px-4 py-2 text-sm text-secondary-700']"
                      aria-label="退出登录"
                      title="退出当前账户"
                    >
                      退出登录
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <!-- 移动端遮罩 -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="absolute inset-0 bg-black opacity-50"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="lg:pl-64">
      <!-- 顶部导航栏 -->
      <div class="sticky top-0 z-10 bg-white border-b border-secondary-200 lg:hidden">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="text-secondary-500 hover:text-secondary-600"
            aria-label="打开侧边栏菜单"
            title="打开/关闭侧边栏"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          <div class="flex items-center">
            <LinkIcon class="h-6 w-6 text-primary-600" />
            <span class="ml-2 text-lg font-semibold text-secondary-900">短链接系统</span>
          </div>
          <div class="w-6"></div>
        </div>
      </div>

      <!-- 页面内容 -->
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  LinkIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  HomeIcon,
  PlusIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, label: '仪表板' },
  { name: 'DashboardLinks', href: '/dashboard/links', icon: ListBulletIcon, label: '链接管理' },
  { name: 'LinkGenerator', href: '/generator', icon: PlusIcon, label: '创建链接' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, label: '数据分析' },
  { name: 'Profile', href: '/profile', icon: UserIcon, label: '个人资料' }
]

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>