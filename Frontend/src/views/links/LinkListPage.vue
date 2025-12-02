<template>
  <DashboardLayout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Link Management</h1>
          <p class="mt-1 text-gray-600">Manage all your short links</p>
        </div>
        <div class="flex items-center space-x-3">
          <BaseButton variant="secondary" @click="showBatchModal = true">
            <DocumentDuplicateIcon class="h-5 w-5 mr-2" />
            Batch Create
          </BaseButton>
          <router-link to="/generator" class="btn-primary">
            <PlusIcon class="h-5 w-5 mr-2" />
            Create Link
          </router-link>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search links..."
              class="input-field"
              @input="handleSearch"
            />
          </div>
          <select v-model="sortBy" class="input-field sm:w-48" @change="fetchLinks">
            <option value="created_at">By Created Time</option>
            <option value="click_count">By Clicks</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      <!-- 链接列表 -->
      <div v-if="linkStore.isLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="linkStore.links.length === 0" class="card text-center py-12">
        <LinkIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No Links Yet</h3>
        <p class="mt-2 text-gray-500">Start by creating your first short link</p>
        <router-link to="/generator" class="mt-4 btn-primary inline-flex">
          Create Link
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <LinkCard
          v-for="link in linkStore.links"
          :key="link.id"
          :link="link"
          @toggle-status="handleToggleStatus"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- 分页 -->
      <div v-if="linkStore.pagination.total_pages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            :disabled="linkStore.pagination.current_page === 1"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(linkStore.pagination.current_page - 1)"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            {{ linkStore.pagination.current_page }} / {{ linkStore.pagination.total_pages }}
          </span>
          <button
            :disabled="linkStore.pagination.current_page === linkStore.pagination.total_pages"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(linkStore.pagination.current_page + 1)"
          >
            Next
          </button>
        </nav>
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
import { useDebounceFn } from '@/composables/useDebounce'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import LinkCard from '@/components/links/LinkCard.vue'
import EditLinkModal from '@/components/links/EditLinkModal.vue'
import BatchCreateModal from '@/components/links/BatchCreateModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { PlusIcon, LinkIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'
import type { ShortLink } from '@/types'

const linkStore = useLinkStore()
const uiStore = useUIStore()

const searchQuery = ref('')
const sortBy = ref('created_at')
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
    search: searchQuery.value,
    sort: sortBy.value
  })
}

function changePage(page: number) {
  linkStore.pagination.current_page = page
  fetchLinks()
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
