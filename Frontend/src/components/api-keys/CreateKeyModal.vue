<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" title="Create New API Key">
    <!-- Step 1: Create Form -->
    <div v-if="!createdKey">
      <div class="space-y-4">
        <!-- Key Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="e.g., Production, Testing, Mobile App"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Permissions -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <div class="space-y-2">
            <label v-for="perm in availablePermissions" :key="perm.value" class="flex items-center">
              <input
                type="checkbox"
                :value="perm.value"
                v-model="formData.permissions"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{{ perm.label }}</span>
            </label>
          </div>
        </div>

        <!-- Rate Limit -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests/hour)</label>
          <select
            v-model="formData.rateLimit"
            class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option :value="100">100 requests/hour</option>
            <option :value="1000">1,000 requests/hour</option>
            <option :value="5000">5,000 requests/hour</option>
            <option :value="10000">10,000 requests/hour</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Step 2: Show Created Key -->
    <div v-else>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="text-sm font-medium text-yellow-800">Save your API key</h4>
            <p class="text-sm text-yellow-700 mt-1">
              This is the only time you'll see this key. Please copy and store it securely.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <code class="text-sm text-gray-800 break-all">{{ createdKey }}</code>
          <button
            @click="copyKey"
            class="ml-2 p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
            title="Copy"
          >
            <ClipboardDocumentIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <p v-if="copied" class="text-sm text-green-600 mt-2 flex items-center">
        <CheckIcon class="h-4 w-4 mr-1" />
        Copied to clipboard
      </p>
    </div>

    <template #footer>
      <template v-if="!createdKey">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="isCreating"
          :disabled="!formData.name.trim()"
          @click="createKey"
        >
          Create Key
        </BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="primary" @click="closeAndReset">
          Done
        </BaseButton>
      </template>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useClipboard } from '@/composables/useClipboard'
import { apikeyService, PERMISSIONS } from '@/services/apikey.service'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()

const uiStore = useUIStore()
const { copy } = useClipboard()

const isCreating = ref(false)
const createdKey = ref<string | null>(null)
const copied = ref(false)

const formData = reactive({
  name: '',
  permissions: [PERMISSIONS.LINKS_READ, PERMISSIONS.LINKS_WRITE] as string[],
  rateLimit: 1000
})

const availablePermissions = [
  { value: PERMISSIONS.LINKS_READ, label: 'Read Links (links:read)' },
  { value: PERMISSIONS.LINKS_WRITE, label: 'Write Links (links:write)' },
  { value: PERMISSIONS.LINKS_DELETE, label: 'Delete Links (links:delete)' },
  { value: PERMISSIONS.ANALYTICS_READ, label: 'Read Analytics (analytics:read)' }
]

// Reset form when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    formData.name = ''
    formData.permissions = [PERMISSIONS.LINKS_READ, PERMISSIONS.LINKS_WRITE]
    formData.rateLimit = 1000
    createdKey.value = null
    copied.value = false
  }
})

async function createKey() {
  if (!formData.name.trim()) return

  isCreating.value = true
  try {
    const result = await apikeyService.createApiKey({
      name: formData.name.trim(),
      permissions: formData.permissions,
      rateLimit: formData.rateLimit
    })

    createdKey.value = result.api_key
    emit('created')
  } catch (error) {
    console.error('Failed to create API key:', error)
    uiStore.error('Failed to create API key')
  }
  isCreating.value = false
}

function copyKey() {
  if (createdKey.value) {
    copy(createdKey.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function closeAndReset() {
  emit('update:modelValue', false)
}
</script>
