<template>
  <DashboardLayout>
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Manage Links</h1>
        <p class="mt-1 text-gray-600">Manage all your short links</p>
      </div>

      <!-- Search and Actions Bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex-1 max-w-xl">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search links..."
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              @input="handleSearch"
            />
          </div>
        </div>
        <div class="flex items-center space-x-3 ml-4">
          <button
            @click="fetchLinks"
            class="inline-flex items-center px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon class="h-5 w-5 mr-2" />
            Refresh
          </button>
          <router-link
            to="/generator"
            class="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Create New Link
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="linkStore.isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="linkStore.links.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12">
        <LinkIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No Links Yet</h3>
        <p class="mt-2 text-gray-500">Start by creating your first short link</p>
        <router-link to="/generator" class="mt-4 inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Create Link
        </router-link>
      </div>

      <!-- Links Table -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Table Header with count -->
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            My Links ({{ linkStore.pagination.total || linkStore.links.length }})
          </h2>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Link Info
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Short Link
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="link in linkStore.links"
                :key="link.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Link Info -->
                <td class="px-6 py-4">
                  <div class="max-w-xs">
                    <router-link
                      :to="`/dashboard/links/${link.id}`"
                      class="font-medium text-gray-900 hover:text-primary-600 transition-colors block truncate"
                    >
                      {{ link.title || link.short_code }}
                    </router-link>
                    <p class="text-sm text-gray-500 truncate mt-0.5">
                      {{ link.original_url }}
                    </p>
                  </div>
                </td>

                <!-- Short Link -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-md font-mono text-sm font-medium">
                      {{ link.short_code }}
                    </span>
                    <button
                      @click="handleCopy(link)"
                      class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy link"
                    >
                      <ClipboardDocumentIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>

                <!-- Clicks -->
                <td class="px-6 py-4">
                  <span class="text-gray-900 font-medium">{{ formatNumber(link.click_count) }}</span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                    :class="link.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'"
                  >
                    {{ link.is_active ? 'Active' : 'Disabled' }}
                  </span>
                </td>

                <!-- Created -->
                <td class="px-6 py-4">
                  <span class="text-gray-600 text-sm">{{ formatDate(link.created_at, 'datetime') }}</span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end space-x-1">
                    <router-link
                      :to="`/dashboard/links/${link.id}`"
                      class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="View Analytics"
                    >
                      <ChartBarIcon class="h-5 w-5" />
                    </router-link>
                    <button
                      @click="handleEdit(link)"
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="handleToggleStatus(link)"
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      :title="link.is_active ? 'Disable link' : 'Enable link'"
                    >
                      <component :is="link.is_active ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
                    </button>
                    <button
                      @click="handleDelete(link)"
                      class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="linkStore.pagination.total_pages > 1" class="px-6 py-4 border-t border-gray-100 flex justify-center">
          <nav class="flex items-center space-x-2">
            <button
              :disabled="linkStore.pagination.current_page === 1"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="changePage(linkStore.pagination.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">
              {{ linkStore.pagination.current_page }} / {{ linkStore.pagination.total_pages }}
            </span>
            <button
              :disabled="linkStore.pagination.current_page === linkStore.pagination.total_pages"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="changePage(linkStore.pagination.current_page + 1)"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <BaseModal v-model="showDeleteModal" title="Confirm Delete">
      <p class="text-gray-600">Are you sure you want to delete this link? This action cannot be undone.</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">Cancel</BaseButton>
        <BaseButton variant="danger" :loading="isDeleting" @click="confirmDelete">Delete</BaseButton>
      </template>
    </BaseModal>

    <!-- Edit Link Modal -->
    <EditLinkModal
      v-model="showEditModal"
      :link="linkToEdit"
      @updated="fetchLinks"
    />

    <!-- Batch Create Modal -->
    <BatchCreateModal
      v-model="showBatchModal"
      @created="fetchLinks"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLinkStore } from '@/stores/link'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { useDebounceFn } from '@/composables/useDebounce'
import { formatDate, formatNumber } from '@/utils/formatters'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import EditLinkModal from '@/components/links/EditLinkModal.vue'
import BatchCreateModal from '@/components/links/BatchCreateModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  PlusIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'
import type { ShortLink } from '@/types'

const linkStore = useLinkStore()
const uiStore = useUIStore()
const { copy } = useClipboard()

const searchQuery = ref('')
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showBatchModal = ref(false)
const isDeleting = ref(false)
const linkToDelete = ref<ShortLink | null>(null)
const linkToEdit = ref<ShortLink | null>(null)

const handleSearch = useDebounceFn(() => {
  fetchLinks()
}, 300)

async function fetchLinks() {
  await linkStore.fetchLinks({
    page: linkStore.pagination.current_page,
    search: searchQuery.value
  })
}

function changePage(page: number) {
  linkStore.pagination.current_page = page
  fetchLinks()
}

async function handleCopy(link: ShortLink) {
  const success = await copy(link.short_url)
  if (success) {
    uiStore.success('Link copied')
  } else {
    uiStore.error('Copy failed')
  }
}

async function handleToggleStatus(link: ShortLink) {
  const result = await linkStore.toggleLinkStatus(link.id)
  if (result.success) {
    uiStore.success(link.is_active ? 'Link disabled' : 'Link enabled')
  } else {
    uiStore.error(result.message || 'Operation failed')
  }
}

function handleEdit(link: ShortLink) {
  linkToEdit.value = link
  showEditModal.value = true
}

function handleDelete(link: ShortLink) {
  linkToDelete.value = link
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!linkToDelete.value) return

  isDeleting.value = true
  const result = await linkStore.deleteLink(linkToDelete.value.id)

  if (result.success) {
    uiStore.success('Link deleted')
    showDeleteModal.value = false
  } else {
    uiStore.error(result.message || 'Failed to delete')
  }

  isDeleting.value = false
  linkToDelete.value = null
}

onMounted(fetchLinks)
</script>
