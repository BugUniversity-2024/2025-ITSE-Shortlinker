<template>
  <div class="card hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <router-link
          :to="`/dashboard/links/${link.id}`"
          class="text-lg font-medium text-gray-900 truncate hover:text-primary-600 transition-colors block"
        >
          {{ link.title || link.short_code }}
        </router-link>
        <p class="mt-1 text-sm text-gray-500 truncate">
          {{ link.original_url }}
        </p>
      </div>
      <div class="ml-4 flex items-center space-x-2">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
        >
          {{ link.is_active ? 'Active' : 'Disabled' }}
        </span>
      </div>
    </div>

    <div class="mt-4 flex items-center text-sm text-gray-500">
      <LinkIcon class="h-4 w-4 mr-1" />
      <a
        :href="link.short_url"
        target="_blank"
        class="text-primary-600 hover:text-primary-700 truncate"
      >
        {{ link.short_url }}
      </a>
      <button
        @click="handleCopy"
        class="ml-2 text-gray-400 hover:text-gray-600"
        title="Copy link"
      >
        <ClipboardDocumentIcon class="h-4 w-4" />
      </button>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center space-x-4 text-sm text-gray-500">
        <span class="flex items-center">
          <CursorArrowRaysIcon class="h-4 w-4 mr-1" />
          {{ formatNumber(link.click_count) }} clicks
        </span>
        <span class="flex items-center">
          <ClockIcon class="h-4 w-4 mr-1" />
          {{ formatDate(link.created_at, 'relative') }}
        </span>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('toggle-status', link)"
          class="p-1 text-gray-400 hover:text-gray-600"
          :title="link.is_active ? 'Disable link' : 'Enable link'"
        >
          <component :is="link.is_active ? EyeSlashIcon : EyeIcon" class="h-5 w-5" />
        </button>
        <button
          @click="$emit('edit', link)"
          class="p-1 text-gray-400 hover:text-gray-600"
          title="Edit"
        >
          <PencilIcon class="h-5 w-5" />
        </button>
        <button
          @click="$emit('delete', link)"
          class="p-1 text-gray-400 hover:text-red-600"
          title="Delete"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from '@/composables/useClipboard'
import { useUIStore } from '@/stores/ui'
import { formatDate, formatNumber } from '@/utils/formatters'
import type { ShortLink } from '@/types'
import {
  LinkIcon,
  ClipboardDocumentIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

interface Props {
  link: ShortLink
}

const props = defineProps<Props>()

defineEmits<{
  'toggle-status': [link: ShortLink]
  'edit': [link: ShortLink]
  'delete': [link: ShortLink]
}>()

const { copy } = useClipboard()
const uiStore = useUIStore()

async function handleCopy() {
  const success = await copy(props.link.short_url)
  if (success) {
    uiStore.success('Link copied')
  } else {
    uiStore.error('Copy failed')
  }
}
</script>
