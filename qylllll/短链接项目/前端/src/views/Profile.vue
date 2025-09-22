<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">个人资料</h1>
        <p class="mt-1 text-secondary-600">管理您的账户信息和偏好设置</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 个人信息 -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="border-b border-secondary-200 pb-4 mb-6">
              <h2 class="text-lg font-semibold text-secondary-900">基本信息</h2>
              <p class="text-sm text-secondary-600">更新您的个人资料信息</p>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- 头像上传 -->
              <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                  <img
                    :src="form.avatar || defaultAvatar"
                    :alt="form.username"
                    class="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <label for="avatar" class="btn-outline cursor-pointer">
                    <PhotoIcon class="h-4 w-4 mr-2" />
                    更换头像
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    @change="handleAvatarChange"
                    accept="image/*"
                    class="hidden"
                  />
                  <p class="mt-2 text-xs text-secondary-500">
                    支持 JPG、PNG 格式，最大 2MB
                  </p>
                </div>
              </div>

              <!-- 表单字段 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="username" class="label">用户名</label>
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    class="input-field"
                    :class="{ 'input-error': errors.username }"
                  />
                  <p v-if="errors.username" class="form-error">{{ errors.username }}</p>
                </div>

                <div>
                  <label for="email" class="label">邮箱地址</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="input-field"
                    :class="{ 'input-error': errors.email }"
                  />
                  <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
                </div>

                <div>
                  <label for="fullName" class="label">真实姓名</label>
                  <input
                    id="fullName"
                    v-model="form.full_name"
                    type="text"
                    class="input-field"
                  />
                </div>

                <div>
                  <label for="phone" class="label">手机号码</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="input-field"
                  />
                </div>
              </div>

              <div>
                <label for="bio" class="label">个人简介</label>
                <textarea
                  id="bio"
                  v-model="form.bio"
                  rows="4"
                  class="input-field"
                  placeholder="介绍一下您自己..."
                ></textarea>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isUpdatingProfile"
                  class="btn-primary"
                >
                  <span v-if="isUpdatingProfile" class="loading-spinner"></span>
                  {{ isUpdatingProfile ? '保存中...' : '保存更改' }}
                </button>
              </div>
            </form>
          </div>

          <!-- 密码修改 -->
          <div class="card mt-6">
            <div class="border-b border-secondary-200 pb-4 mb-6">
              <h2 class="text-lg font-semibold text-secondary-900">密码安全</h2>
              <p class="text-sm text-secondary-600">修改您的账户密码</p>
            </div>

            <form @submit.prevent="changePassword" class="space-y-6">
              <div>
                <label for="currentPassword" class="label">当前密码</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.current_password"
                  type="password"
                  class="input-field"
                  :class="{ 'input-error': passwordErrors.current_password }"
                />
                <p v-if="passwordErrors.current_password" class="form-error">
                  {{ passwordErrors.current_password }}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="newPassword" class="label">新密码</label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.new_password"
                    type="password"
                    class="input-field"
                    :class="{ 'input-error': passwordErrors.new_password }"
                  />
                  <p v-if="passwordErrors.new_password" class="form-error">
                    {{ passwordErrors.new_password }}
                  </p>
                </div>

                <div>
                  <label for="confirmPassword" class="label">确认新密码</label>
                  <input
                    id="confirmPassword"
                    v-model="passwordForm.confirm_password"
                    type="password"
                    class="input-field"
                    :class="{ 'input-error': passwordErrors.confirm_password }"
                  />
                  <p v-if="passwordErrors.confirm_password" class="form-error">
                    {{ passwordErrors.confirm_password }}
                  </p>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="btn-primary"
                >
                  <span v-if="isChangingPassword" class="loading-spinner"></span>
                  {{ isChangingPassword ? '修改中...' : '修改密码' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="space-y-6">
          <!-- 账户统计 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">账户统计</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">创建链接</span>
                <span class="text-sm font-medium text-secondary-900">{{ stats.total_links }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">总点击数</span>
                <span class="text-sm font-medium text-secondary-900">{{ stats.total_clicks }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">活跃链接</span>
                <span class="text-sm font-medium text-secondary-900">{{ stats.active_links }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary-600">注册时间</span>
                <span class="text-sm font-medium text-secondary-900">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- 偏好设置 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">偏好设置</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label for="emailNotifications" class="text-sm text-secondary-700">
                  邮件通知
                </label>
                <input
                  id="emailNotifications"
                  v-model="settings.email_notifications"
                  type="checkbox"
                  class="toggle"
                  @change="updateSettings"
                />
              </div>
              <div class="flex items-center justify-between">
                <label for="publicProfile" class="text-sm text-secondary-700">
                  公开资料
                </label>
                <input
                  id="publicProfile"
                  v-model="settings.public_profile"
                  type="checkbox"
                  class="toggle"
                  @change="updateSettings"
                />
              </div>
              <div class="flex items-center justify-between">
                <label for="analyticsSharing" class="text-sm text-secondary-700">
                  数据分析共享
                </label>
                <input
                  id="analyticsSharing"
                  v-model="settings.analytics_sharing"
                  type="checkbox"
                  class="toggle"
                  @change="updateSettings"
                />
              </div>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="card">
            <h3 class="text-lg font-semibold text-secondary-900 mb-4">快捷操作</h3>
            <div class="space-y-3">
              <router-link
                to="/dashboard/links"
                class="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <LinkIcon class="h-4 w-4 mr-2" />
                管理我的链接
              </router-link>
              <router-link
                to="/dashboard/analytics"
                class="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <ChartBarIcon class="h-4 w-4 mr-2" />
                查看数据统计
              </router-link>
              <button
                @click="exportUserData"
                class="flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
                导出用户数据
              </button>
            </div>
          </div>

          <!-- 危险操作 -->
          <div class="card border-red-200">
            <h3 class="text-lg font-semibold text-red-600 mb-4">危险操作</h3>
            <div class="space-y-3">
              <button
                @click="showDeleteModal = true"
                class="w-full text-left flex items-center text-sm text-red-600 hover:text-red-700"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                删除账户
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除账户确认模态框 -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showDeleteModal = false"
      >
        <div
          class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600 mr-3" />
            <h3 class="text-lg font-semibold text-secondary-900">删除账户</h3>
          </div>
          <p class="text-secondary-600 mb-4">
            此操作将永久删除您的账户和所有相关数据，包括创建的短链接和统计数据。此操作不可撤销。
          </p>
          <div class="mb-4">
            <label for="deleteConfirm" class="label">请输入您的密码确认删除</label>
            <input
              id="deleteConfirm"
              v-model="deletePassword"
              type="password"
              class="input-field"
              placeholder="输入密码确认"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="btn-outline"
            >
              取消
            </button>
            <button
              @click="deleteAccount"
              :disabled="!deletePassword || isDeletingAccount"
              class="btn-danger"
            >
              <span v-if="isDeletingAccount" class="loading-spinner"></span>
              {{ isDeletingAccount ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import DashboardLayout from '@/components/DashboardLayout.vue'
import {
  PhotoIcon,
  LinkIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff'

// 表单数据
const form = reactive({
  username: '',
  email: '',
  full_name: '',
  phone: '',
  bio: '',
  avatar: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const settings = reactive({
  email_notifications: true,
  public_profile: false,
  analytics_sharing: false
})

const stats = reactive({
  total_links: 0,
  total_clicks: 0,
  active_links: 0
})

// 状态
const errors = ref({})
const passwordErrors = ref({})
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)
const showDeleteModal = ref(false)
const deletePassword = ref('')
const isDeletingAccount = ref(false)

// 头像上传处理
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      errors.value.avatar = '头像文件大小不能超过 2MB'
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 更新个人资料
const updateProfile = async () => {
  isUpdatingProfile.value = true
  errors.value = {}

  try {
    const response = await authAPI.updateProfile(form)
    if (response.data.success) {
      // 更新本地用户信息
      authStore.user = { ...authStore.user, ...form }
      
      // 显示成功消息
      showToast('个人资料更新成功', 'success')
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showToast('更新失败，请稍后重试', 'error')
    }
  } finally {
    isUpdatingProfile.value = false
  }
}

// 修改密码
const changePassword = async () => {
  isChangingPassword.value = true
  passwordErrors.value = {}

  // 验证密码
  if (!passwordForm.current_password) {
    passwordErrors.value.current_password = '请输入当前密码'
    isChangingPassword.value = false
    return
  }

  if (passwordForm.new_password.length < 8) {
    passwordErrors.value.new_password = '新密码长度至少8位'
    isChangingPassword.value = false
    return
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.value.confirm_password = '两次输入的密码不一致'
    isChangingPassword.value = false
    return
  }

  try {
    const response = await authAPI.changePassword(passwordForm)
    if (response.data.success) {
      // 清空表单
      Object.keys(passwordForm).forEach(key => {
        passwordForm[key] = ''
      })
      
      showToast('密码修改成功', 'success')
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      passwordErrors.value = error.response.data.errors
    } else {
      showToast('密码修改失败，请稍后重试', 'error')
    }
  } finally {
    isChangingPassword.value = false
  }
}

// 更新设置
const updateSettings = async () => {
  try {
    await authAPI.updateSettings(settings)
    showToast('设置更新成功', 'success')
  } catch (error) {
    showToast('设置更新失败', 'error')
  }
}

// 导出用户数据
const exportUserData = async () => {
  try {
    const response = await authAPI.exportUserData()
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user_data_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    showToast('用户数据导出成功', 'success')
  } catch (error) {
    showToast('导出失败，请稍后重试', 'error')
  }
}

// 删除账户
const deleteAccount = async () => {
  if (!deletePassword.value) return

  isDeletingAccount.value = true

  try {
    const response = await authAPI.deleteAccount({ password: deletePassword.value })
    if (response.data.success) {
      showToast('账户已删除', 'success')
      authStore.logout()
      router.push('/')
    }
  } catch (error) {
    showToast('删除失败，请检查密码', 'error')
  } finally {
    isDeletingAccount.value = false
    showDeleteModal.value = false
    deletePassword.value = ''
  }
}

// 工具函数
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const showToast = (message, type) => {
  // 简单的提示实现，实际项目中可以使用更完善的通知组件
  console.log(`${type}: ${message}`)
}

// 加载用户数据
const loadUserData = async () => {
  try {
    // 加载用户资料
    const profileResponse = await authAPI.getProfile()
    if (profileResponse.data.success) {
      Object.assign(form, profileResponse.data.data)
    }

    // 加载用户设置
    const settingsResponse = await authAPI.getSettings()
    if (settingsResponse.data.success) {
      Object.assign(settings, settingsResponse.data.data)
    }

    // 加载统计数据
    const statsResponse = await authAPI.getUserStats()
    if (statsResponse.data.success) {
      Object.assign(stats, statsResponse.data.data)
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

onMounted(() => {
  // 初始化表单数据
  if (authStore.user) {
    Object.assign(form, authStore.user)
  }
  
  // 加载完整的用户数据
  loadUserData()
})
</script>

<style scoped>
.toggle {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply bg-secondary-200 checked:bg-primary-600;
}

.toggle:checked::before {
  @apply translate-x-5;
}

.toggle::before {
  @apply absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform;
  content: '';
}

.loading-spinner {
  @apply inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white;
}
</style>