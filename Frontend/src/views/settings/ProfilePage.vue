<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
        <p class="mt-1 text-gray-600">Manage your account information and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p class="text-sm text-gray-500">Update your personal profile information</p>
            </div>

            <form @submit.prevent="handleUpdateProfile">
              <!-- Avatar -->
              <div class="flex items-center gap-4 mb-6">
                <div class="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-2xl text-white font-medium">
                    {{ userInitials }}
                  </span>
                </div>
                <div>
                  <button
                    type="button"
                    class="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                  >
                    Change Avatar
                  </button>
                  <p class="text-xs text-gray-500 mt-1">Supports JPG, PNG format, max 2MB</p>
                </div>
              </div>

              <!-- Username & Email -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    :value="userStore.user?.username"
                    disabled
                    class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    :value="userStore.user?.email"
                    disabled
                    class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <!-- Full Name & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    v-model="profileForm.full_name"
                    type="text"
                    placeholder="Your full name"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    v-model="profileForm.phone"
                    type="text"
                    placeholder="+1 234 567 8900"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <!-- Bio -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  v-model="profileForm.bio"
                  rows="3"
                  placeholder="Tell us about yourself"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isUpdating"
                  class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                >
                  {{ isUpdating ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Password Security -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Password Security</h2>
              <p class="text-sm text-gray-500">Change your account password</p>
            </div>

            <form @submit.prevent="handleChangePassword">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  v-model="passwordForm.current_password"
                  type="password"
                  placeholder="Enter current password"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-500': passwordErrors.current_password }"
                />
                <p v-if="passwordErrors.current_password" class="text-sm text-red-500 mt-1">
                  {{ passwordErrors.current_password }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    v-model="passwordForm.new_password"
                    type="password"
                    placeholder="Enter new password"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    :class="{ 'border-red-500': passwordErrors.new_password }"
                  />
                  <p v-if="passwordErrors.new_password" class="text-sm text-red-500 mt-1">
                    {{ passwordErrors.new_password }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    v-model="passwordForm.confirm_password"
                    type="password"
                    placeholder="Re-enter new password"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    :class="{ 'border-red-500': passwordErrors.confirm_password }"
                  />
                  <p v-if="passwordErrors.confirm_password" class="text-sm text-red-500 mt-1">
                    {{ passwordErrors.confirm_password }}
                  </p>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                >
                  {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Account Statistics -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Links Created</span>
                <span class="font-semibold text-gray-900">{{ stats.total_links }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Clicks</span>
                <span class="font-semibold text-gray-900">{{ stats.total_clicks }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Active Links</span>
                <span class="font-semibold text-gray-900">{{ stats.active_links }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Registered</span>
                <span class="font-semibold text-gray-900">{{ registeredDate }}</span>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Email Notifications</span>
                <button
                  @click="togglePreference('email_notifications')"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="preferences.email_notifications ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Public Profile</span>
                <button
                  @click="togglePreference('public_profile')"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="preferences.public_profile ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="preferences.public_profile ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Analytics Sharing</span>
                <button
                  @click="togglePreference('analytics_sharing')"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="preferences.analytics_sharing ? 'bg-primary-600' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="preferences.analytics_sharing ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div class="space-y-3">
              <router-link
                to="/dashboard/links"
                class="flex items-center text-primary-600 hover:text-primary-700"
              >
                <LinkIcon class="h-5 w-5 mr-2" />
                Manage My Links
              </router-link>
              <router-link
                to="/dashboard/analytics"
                class="flex items-center text-primary-600 hover:text-primary-700"
              >
                <ChartBarIcon class="h-5 w-5 mr-2" />
                View Analytics
              </router-link>
              <button
                @click="handleExportData"
                :disabled="isExporting"
                class="flex items-center text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
                {{ isExporting ? 'Exporting...' : 'Export User Data' }}
              </button>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 class="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
            <button
              @click="showDeleteAccountModal = true"
              class="flex items-center text-red-600 hover:text-red-700"
            >
              <TrashIcon class="h-5 w-5 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation -->
    <BaseModal v-model="showDeleteAccountModal" title="Confirm Account Deletion">
      <p class="text-gray-600 mb-4">
        This action is irreversible. All your data including links, analytics, and settings will be permanently deleted.
      </p>
      <p class="text-gray-600 mb-4">Please enter your password to confirm.</p>
      <input
        v-model="deletePassword"
        type="password"
        placeholder="Enter your password"
        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <template #footer>
        <button
          @click="showDeleteAccountModal = false"
          class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleDeleteAccount"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Confirm Delete
        </button>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import { authService } from '@/services/auth.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  LinkIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()

const profileForm = reactive({
  full_name: '',
  phone: '',
  bio: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordErrors = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const preferences = reactive({
  email_notifications: false,
  public_profile: false,
  analytics_sharing: false
})

const stats = reactive({
  total_links: 0,
  active_links: 0,
  total_clicks: 0
})

const isUpdating = ref(false)
const isChangingPassword = ref(false)
const isExporting = ref(false)
const showDeleteAccountModal = ref(false)
const deletePassword = ref('')

const userInitials = computed(() => {
  const username = userStore.user?.username || ''
  return username.substring(0, 2).toUpperCase()
})

const registeredDate = computed(() => {
  if (!userStore.user?.created_at) return '-'
  const date = new Date(userStore.user.created_at)
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
})

async function fetchStats() {
  try {
    const data = await authService.getUserStats()
    stats.total_links = data.total_links
    stats.active_links = data.active_links
    stats.total_clicks = data.total_clicks
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchSettings() {
  try {
    const data = await authService.getSettings()
    preferences.email_notifications = data.email_notifications
    preferences.public_profile = data.public_profile
    preferences.analytics_sharing = data.analytics_sharing
  } catch (error) {
    console.error('Failed to fetch settings:', error)
  }
}

async function togglePreference(key: keyof typeof preferences) {
  preferences[key] = !preferences[key]
  try {
    await authService.updateSettings({
      [key]: preferences[key]
    })
  } catch (error) {
    // Revert on error
    preferences[key] = !preferences[key]
    uiStore.error('Failed to update preference')
  }
}

onMounted(async () => {
  if (userStore.user) {
    profileForm.full_name = userStore.user.full_name || ''
    profileForm.phone = userStore.user.phone || ''
    profileForm.bio = userStore.user.bio || ''
  }
  await Promise.all([fetchStats(), fetchSettings()])
})

async function handleUpdateProfile() {
  isUpdating.value = true
  const result = await userStore.updateProfile(profileForm)
  if (result.success) {
    uiStore.success('Profile updated successfully')
  } else {
    uiStore.error(result.message || 'Update failed')
  }
  isUpdating.value = false
}

async function handleChangePassword() {
  // Reset errors
  Object.keys(passwordErrors).forEach(key => {
    passwordErrors[key as keyof typeof passwordErrors] = ''
  })

  if (!passwordForm.current_password) {
    passwordErrors.current_password = 'Please enter current password'
    return
  }
  if (!passwordForm.new_password || passwordForm.new_password.length < 8) {
    passwordErrors.new_password = 'New password must be at least 8 characters'
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    passwordErrors.confirm_password = 'Passwords do not match'
    return
  }

  isChangingPassword.value = true
  try {
    await authService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    })
    uiStore.success('Password changed successfully')
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key as keyof typeof passwordForm] = ''
    })
  } catch {
    uiStore.error('Failed to change password')
  }
  isChangingPassword.value = false
}

async function handleExportData() {
  isExporting.value = true
  try {
    const data = await authService.exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tinybridge-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    uiStore.success('Data exported successfully')
  } catch (error) {
    console.error('Failed to export data:', error)
    uiStore.error('Failed to export data')
  }
  isExporting.value = false
}

async function handleDeleteAccount() {
  if (!deletePassword.value) {
    uiStore.error('Please enter your password')
    return
  }

  try {
    await authService.deleteAccount({ password: deletePassword.value })
    uiStore.success('Account deleted')
    userStore.logout()
    router.push('/')
  } catch {
    uiStore.error('Deletion failed, please check your password')
  }
}
</script>
