<template>
  <DashboardLayout>
    <div class="p-6 max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p class="mt-1 text-gray-600">Manage your account information</p>
      </div>

      <!-- Basic Info -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div class="flex items-center space-x-4 mb-6">
            <div class="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center">
              <span class="text-3xl text-white font-medium">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ userStore.user?.username }}</h3>
              <p class="text-sm text-gray-500">{{ userStore.user?.email }}</p>
            </div>
          </div>

          <BaseInput
            v-model="profileForm.full_name"
            label="Full Name"
            placeholder="Your full name"
          />

          <BaseInput
            v-model="profileForm.phone"
            label="Phone"
            placeholder="Your phone number"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              v-model="profileForm.bio"
              rows="3"
              class="input-field"
              placeholder="Tell us about yourself"
            />
          </div>

          <div class="flex justify-end">
            <BaseButton type="submit" variant="primary" :loading="isUpdating">
              Save Changes
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <BaseInput
            v-model="passwordForm.current_password"
            type="password"
            label="Current Password"
            placeholder="Enter current password"
            :error="passwordErrors.current_password"
          />

          <BaseInput
            v-model="passwordForm.new_password"
            type="password"
            label="New Password"
            placeholder="Enter new password (min 8 characters)"
            :error="passwordErrors.new_password"
          />

          <BaseInput
            v-model="passwordForm.confirm_password"
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            :error="passwordErrors.confirm_password"
          />

          <div class="flex justify-end">
            <BaseButton type="submit" variant="primary" :loading="isChangingPassword">
              Change Password
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- API Key -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">API Key</h2>
        <p class="text-sm text-gray-600 mb-4">Use this key to access your account via API</p>

        <div class="flex items-center space-x-4">
          <div class="flex-1 bg-gray-100 rounded-lg p-3">
            <code v-if="isLoadingApiKey" class="text-sm text-gray-500">Loading...</code>
            <code v-else class="text-sm text-gray-800">
              {{ showApiKey ? apiKey : '••••••••••••••••••••••••••••••••' }}
            </code>
          </div>
          <button
            @click="showApiKey = !showApiKey"
            class="text-gray-500 hover:text-gray-700"
            :disabled="isLoadingApiKey"
          >
            <EyeIcon v-if="!showApiKey" class="h-5 w-5" />
            <EyeSlashIcon v-else class="h-5 w-5" />
          </button>
          <button
            @click="copyApiKey"
            class="text-gray-500 hover:text-gray-700"
            :disabled="isLoadingApiKey"
          >
            <ClipboardDocumentIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Data Export -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Data Export</h2>
        <p class="text-sm text-gray-600 mb-4">Download all your data including links, teams, and settings</p>
        <BaseButton variant="secondary" :loading="isExporting" @click="handleExportData">
          Export My Data
        </BaseButton>
      </div>

      <!-- Danger Zone -->
      <div class="card border-red-200">
        <h2 class="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p class="text-sm text-gray-600 mb-4">Once you delete your account, all data will be permanently deleted and cannot be recovered.</p>
        <BaseButton variant="danger" @click="showDeleteAccountModal = true">
          Delete Account
        </BaseButton>
      </div>
    </div>

    <!-- Delete Account Confirmation -->
    <BaseModal v-model="showDeleteAccountModal" title="Confirm Account Deletion">
      <p class="text-gray-600 mb-4">This action is irreversible. All data will be permanently deleted. Please enter your password to confirm.</p>
      <BaseInput
        v-model="deletePassword"
        type="password"
        placeholder="Enter your password"
      />
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteAccountModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="handleDeleteAccount">Confirm Delete</BaseButton>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { authService } from '@/services/auth.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()
const { copy } = useClipboard()

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

const isUpdating = ref(false)
const isChangingPassword = ref(false)
const isLoadingApiKey = ref(false)
const isExporting = ref(false)
const apiKey = ref('')
const showApiKey = ref(false)
const showDeleteAccountModal = ref(false)
const deletePassword = ref('')

async function fetchApiKey() {
  isLoadingApiKey.value = true
  try {
    const response = await authService.getApiKey()
    apiKey.value = response.api_key
  } catch (error) {
    console.error('Failed to fetch API key:', error)
    apiKey.value = 'Failed to load'
  }
  isLoadingApiKey.value = false
}

async function handleExportData() {
  isExporting.value = true
  try {
    const data = await authService.exportUserData()
    // 下载为 JSON 文件
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
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

onMounted(async () => {
  if (userStore.user) {
    profileForm.full_name = userStore.user.full_name || ''
    profileForm.phone = userStore.user.phone || ''
    profileForm.bio = userStore.user.bio || ''
  }
  await fetchApiKey()
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
  // 验证
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

async function copyApiKey() {
  const success = await copy(apiKey.value)
  if (success) {
    uiStore.success('API key copied')
  }
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
