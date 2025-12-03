<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="{ '-translate-x-full': !sidebarOpen }"
    >
      <div class="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <LinkIcon class="h-8 w-8 text-primary-600" />
        <span class="ml-2 text-xl font-bold text-gray-900">TinyBridge</span>
      </div>

      <nav class="mt-8 px-4">
        <div class="space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="isActive(item.name)
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
          >
            <component
              :is="item.icon"
              class="mr-3 h-5 w-5"
              :class="isActive(item.name) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'"
            />
            {{ item.label }}
          </router-link>
        </div>
      </nav>

      <!-- 用户信息 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitial }}</span>
            </div>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-gray-900">{{ userStore.user?.username }}</p>
            <p class="text-xs text-gray-500">{{ userStore.user?.plan_type || 'free' }}</p>
          </div>
          <Menu as="div" class="relative">
            <MenuButton class="flex items-center text-gray-400 hover:text-gray-600">
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
                      :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                    >
                      Settings
                    </router-link>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleLogout"
                      :class="[active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700']"
                    >
                      Sign Out
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
      <!-- 顶部导航栏（移动端） -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="text-gray-500 hover:text-gray-600"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>
          <div class="flex items-center">
            <LinkIcon class="h-6 w-6 text-primary-600" />
            <span class="ml-2 text-lg font-semibold text-gray-900">TinyBridge</span>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  LinkIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  HomeIcon,
  PlusIcon,
  ChartBarIcon,
  UserIcon,
  ListBulletIcon,
  UserGroupIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const sidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { name: 'LinkList', href: '/dashboard/links', icon: ListBulletIcon, label: 'Manage Links' },
  { name: 'LinkGenerator', href: '/generator', icon: PlusIcon, label: 'Create Link' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, label: 'Analytics' },
  { name: 'ApiKeys', href: '/dashboard/api-keys', icon: KeyIcon, label: 'API Keys' },
  { name: 'Profile', href: '/profile', icon: UserIcon, label: 'Profile' }
]

const userInitial = computed(() => {
  return userStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

function isActive(name: string): boolean {
  return route.name === name
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>
