<template>
  <DashboardLayout>
    <div class="p-6 max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Create Short Link</h1>
        <p class="mt-1 text-gray-600">Enter a long URL to generate a short link</p>
      </div>

      <form @submit.prevent="handleCreate" class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Link Information</h2>

          <div class="space-y-4">
            <BaseInput
              v-model="form.original_url"
              label="Original URL"
              placeholder="https://example.com/your-long-url"
              :error="errors.original_url"
              required
            />

            <BaseInput
              v-model="form.title"
              label="Title (optional)"
              placeholder="Give your link a name"
            />

            <BaseInput
              v-model="form.short_code"
              label="Custom Short Code (optional)"
              placeholder="Leave empty to auto-generate"
              :error="errors.short_code"
              hint="3-32 characters, letters, numbers and hyphens only"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="input-field"
                placeholder="Brief description of the link"
              />
            </div>

            <BaseInput
              v-model="form.tags"
              label="Tags (optional)"
              placeholder="Separate multiple tags with commas"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Expiration (optional)</label>
              <input
                v-model="form.expires_at"
                type="datetime-local"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <router-link to="/dashboard/links" class="btn-secondary">
            Cancel
          </router-link>
          <BaseButton type="submit" variant="primary" :loading="isLoading">
            Create Link
          </BaseButton>
        </div>
      </form>

      <!-- Success Result -->
      <div v-if="createdLink" class="mt-8 card bg-green-50 border-green-200">
        <div class="flex items-start">
          <CheckCircleIcon class="h-6 w-6 text-green-600 flex-shrink-0" />
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-green-800">Link created successfully!</h3>
            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between bg-white rounded-lg p-3">
                <span class="text-primary-600 font-medium">{{ createdLink.short_url }}</span>
                <button
                  @click="copyLink"
                  class="text-gray-500 hover:text-primary-600"
                >
                  <ClipboardDocumentIcon class="h-5 w-5" />
                </button>
              </div>

              <div class="flex justify-center">
                <QRCodeGenerator :url="createdLink.short_url" :size="150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useLinkStore } from '@/stores/link'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { validateUrl, validateShortCode } from '@/utils/validators'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import QRCodeGenerator from '@/components/links/QRCodeGenerator.vue'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import type { ShortLink } from '@/types'

const linkStore = useLinkStore()
const uiStore = useUIStore()
const { copy } = useClipboard()

const form = reactive({
  original_url: '',
  title: '',
  short_code: '',
  description: '',
  tags: '',
  expires_at: ''
})

const errors = reactive({
  original_url: '',
  short_code: ''
})

const isLoading = ref(false)
const createdLink = ref<ShortLink | null>(null)

function validateForm(): boolean {
  let isValid = true
  errors.original_url = ''
  errors.short_code = ''

  const urlError = validateUrl(form.original_url)
  if (urlError) {
    errors.original_url = urlError
    isValid = false
  }

  if (form.short_code) {
    const codeError = validateShortCode(form.short_code)
    if (codeError) {
      errors.short_code = codeError
      isValid = false
    }
  }

  return isValid
}

async function handleCreate() {
  if (!validateForm()) return

  isLoading.value = true
  createdLink.value = null

  try {
    const result = await linkStore.createLink({
      original_url: form.original_url,
      title: form.title || undefined,
      short_code: form.short_code || undefined,
      description: form.description || undefined,
      tags: form.tags || undefined,
      expires_at: form.expires_at || undefined
    })

    if (result.success && result.data) {
      createdLink.value = result.data
      uiStore.success('Link created successfully')
      // Reset form
      Object.keys(form).forEach(key => {
        form[key as keyof typeof form] = ''
      })
    } else {
      uiStore.error(result.message || 'Failed to create link')
    }
  } catch {
    uiStore.error('Network error, please try again later')
  } finally {
    isLoading.value = false
  }
}

async function copyLink() {
  if (!createdLink.value) return
  const success = await copy(createdLink.value.short_url)
  if (success) {
    uiStore.success('Link copied')
  }
}
</script>
