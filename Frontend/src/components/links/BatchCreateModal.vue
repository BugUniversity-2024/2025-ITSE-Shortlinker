<template>
  <BaseModal v-model="isOpen" title="Batch Create Links" size="lg">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Enter one URL per line. Each URL will be converted to a short link.
      </p>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">URLs</label>
        <textarea
          v-model="urlsText"
          rows="8"
          class="input-field font-mono text-sm"
          placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
        />
      </div>

      <div class="text-sm text-gray-500">
        {{ urlCount }} URL(s) detected
      </div>

      <!-- Results -->
      <div v-if="results" class="mt-4 space-y-3">
        <div v-if="results.created.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 class="text-sm font-medium text-green-800 mb-2">
            Successfully created {{ results.created.length }} link(s)
          </h4>
          <ul class="text-sm text-green-700 space-y-1">
            <li v-for="link in results.created" :key="link.id" class="truncate">
              {{ link.short_url }}
            </li>
          </ul>
        </div>

        <div v-if="results.failed.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 class="text-sm font-medium text-red-800 mb-2">
            Failed to create {{ results.failed.length }} link(s)
          </h4>
          <ul class="text-sm text-red-700 space-y-1">
            <li v-for="(fail, index) in results.failed" :key="index" class="truncate">
              {{ fail.url }}: {{ fail.error }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="handleClose">
        {{ results ? 'Close' : 'Cancel' }}
      </BaseButton>
      <BaseButton
        v-if="!results"
        variant="primary"
        :loading="isSubmitting"
        :disabled="urlCount === 0"
        @click="handleSubmit"
      >
        Create {{ urlCount }} Link(s)
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { linkService } from '@/services/link.service'
import { useUIStore } from '@/stores/ui'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import type { BatchCreateResponse } from '@/types'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const uiStore = useUIStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const urlsText = ref('')
const isSubmitting = ref(false)
const results = ref<BatchCreateResponse | null>(null)

const urls = computed(() => {
  return urlsText.value
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && url.startsWith('http'))
})

const urlCount = computed(() => urls.value.length)

async function handleSubmit() {
  if (urls.value.length === 0) return

  isSubmitting.value = true

  try {
    results.value = await linkService.batchCreateLinks({ urls: urls.value })

    if (results.value.created.length > 0) {
      uiStore.success(`Created ${results.value.created.length} link(s)`)
      emit('created')
    }

    if (results.value.failed.length > 0 && results.value.created.length === 0) {
      uiStore.error('All URLs failed to create')
    }
  } catch (error) {
    uiStore.error('Batch creation failed')
    console.error('Batch create error:', error)
  }

  isSubmitting.value = false
}

function handleClose() {
  isOpen.value = false
  urlsText.value = ''
  results.value = null
}
</script>
