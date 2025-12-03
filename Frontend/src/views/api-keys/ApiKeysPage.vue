<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">API Key Management</h1>
          <p class="mt-1 text-gray-600">Manage your API keys for programmatic access</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Create New Key
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content - API Keys List -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>

          <!-- API Keys List -->
          <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              My API Keys ({{ apiKeys.length }})
            </h2>

            <div v-if="apiKeys.length === 0" class="text-center py-8 text-gray-500">
              <KeyIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No API keys yet. Create your first key to get started.</p>
            </div>

            <div v-else class="space-y-4">
              <ApiKeyCard
                v-for="key in apiKeys"
                :key="key.id"
                :apiKey="key"
                @delete="handleDelete"
              />
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Usage Statistics -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Active Keys</span>
                <span class="font-semibold text-gray-900">{{ stats.active_keys }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Today's Requests</span>
                <span class="font-semibold text-gray-900">{{ stats.today_requests }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">This Month</span>
                <span class="font-semibold text-gray-900">{{ stats.month_requests }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Request Quota</span>
                <span class="font-semibold text-gray-900">{{ stats.quota_used }}/{{ stats.quota_limit }}</span>
              </div>
              <div class="mt-2">
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500 rounded-full transition-all"
                    :style="{ width: `${(stats.quota_used / stats.quota_limit) * 100}%` }"
                  ></div>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  {{ Math.round((stats.quota_used / stats.quota_limit) * 100) }}% of quota used
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Start -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
            <div class="space-y-3">
              <a href="#" class="flex items-center text-primary-600 hover:text-primary-700">
                <DocumentTextIcon class="h-5 w-5 mr-2" />
                API Documentation
              </a>
              <a href="#" class="flex items-center text-primary-600 hover:text-primary-700">
                <CodeBracketIcon class="h-5 w-5 mr-2" />
                SDK Download
              </a>
              <a href="#" class="flex items-center text-primary-600 hover:text-primary-700">
                <BookOpenIcon class="h-5 w-5 mr-2" />
                Tutorial
              </a>
            </div>
          </div>

          <!-- Code Example -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Code Example</h2>
            <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre class="text-sm text-gray-100"><code>curl -X POST \
  {{ apiBaseUrl }}/v1/links \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'</code></pre>
            </div>
            <button
              @click="copyCode"
              class="mt-3 w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-primary-600"
            >
              <ClipboardDocumentIcon class="h-5 w-5 mr-2" />
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Key Modal -->
    <CreateKeyModal
      v-model="showCreateModal"
      @created="handleKeyCreated"
    />

    <!-- Delete Confirmation Modal -->
    <BaseModal v-model="showDeleteModal" title="Revoke API Key">
      <p class="text-gray-600">
        Are you sure you want to revoke this API key? This action cannot be undone and any applications using this key will stop working.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" :loading="isDeleting" @click="confirmDelete">Revoke Key</BaseButton>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { apikeyService, type ApiKey, type ApiKeyStats } from '@/services/apikey.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ApiKeyCard from '@/components/api-keys/ApiKeyCard.vue'
import CreateKeyModal from '@/components/api-keys/CreateKeyModal.vue'
import {
  PlusIcon,
  KeyIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  BookOpenIcon,
  ClipboardDocumentIcon
} from '@heroicons/vue/24/outline'

const uiStore = useUIStore()
const { copy } = useClipboard()

const isLoading = ref(true)
const apiKeys = ref<ApiKey[]>([])
const stats = ref<ApiKeyStats>({
  active_keys: 0,
  today_requests: 0,
  month_requests: 0,
  quota_used: 0,
  quota_limit: 10000
})

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const keyToDelete = ref<ApiKey | null>(null)

const apiBaseUrl = computed(() => {
  return window.location.origin.replace('://localhost', '://api.tinybridge.link')
})

async function fetchApiKeys() {
  isLoading.value = true
  try {
    const [keys, keyStats] = await Promise.all([
      apikeyService.listApiKeys(),
      apikeyService.getStats()
    ])
    apiKeys.value = keys
    stats.value = keyStats
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
    uiStore.error('Failed to load API keys')
  }
  isLoading.value = false
}

function handleKeyCreated() {
  fetchApiKeys()
}

function handleDelete(key: ApiKey) {
  keyToDelete.value = key
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!keyToDelete.value) return

  isDeleting.value = true
  try {
    await apikeyService.deleteApiKey(keyToDelete.value.id)
    uiStore.success('API key revoked successfully')
    showDeleteModal.value = false
    fetchApiKeys()
  } catch (error) {
    console.error('Failed to delete API key:', error)
    uiStore.error('Failed to revoke API key')
  }
  isDeleting.value = false
  keyToDelete.value = null
}

function copyCode() {
  const code = `curl -X POST \\
  ${apiBaseUrl.value}/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`

  copy(code)
  uiStore.success('Code copied to clipboard')
}

onMounted(fetchApiKeys)
</script>
