<template>
  <BaseModal v-model="isOpen" title="Edit Link" size="lg">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.title"
        label="Title"
        placeholder="Link title (optional)"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="input-field"
          placeholder="Link description (optional)"
        />
      </div>

      <BaseInput
        v-model="form.tags"
        label="Tags"
        placeholder="Comma separated tags"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
        <input
          v-model="form.expires_at"
          type="datetime-local"
          class="input-field"
        />
      </div>

      <div class="flex items-center">
        <input
          v-model="form.is_active"
          type="checkbox"
          id="is_active"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="is_active" class="ml-2 block text-sm text-gray-900">
          Link is active
        </label>
      </div>
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="isOpen = false">Cancel</BaseButton>
      <BaseButton variant="primary" :loading="isSubmitting" @click="handleSubmit">
        Save Changes
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useLinkStore } from '@/stores/link'
import { useUIStore } from '@/stores/ui'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import type { ShortLink } from '@/types'

interface Props {
  modelValue: boolean
  link: ShortLink | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'updated': []
}>()

const linkStore = useLinkStore()
const uiStore = useUIStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isSubmitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  tags: '',
  expires_at: '',
  is_active: true
})

watch(() => props.link, (newLink) => {
  if (newLink) {
    form.title = newLink.title || ''
    form.description = newLink.description || ''
    form.tags = newLink.tags || ''
    form.expires_at = newLink.expires_at ? newLink.expires_at.slice(0, 16) : ''
    form.is_active = newLink.is_active
  }
}, { immediate: true })

async function handleSubmit() {
  if (!props.link) return

  isSubmitting.value = true

  const result = await linkStore.updateLink(props.link.id, {
    title: form.title || undefined,
    description: form.description || undefined,
    tags: form.tags || undefined,
    expires_at: form.expires_at || undefined,
    is_active: form.is_active
  })

  if (result.success) {
    uiStore.success('Link updated successfully')
    isOpen.value = false
    emit('updated')
  } else {
    uiStore.error(result.message || 'Failed to update link')
  }

  isSubmitting.value = false
}
</script>
