<template>
  <div class="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Name and Status -->
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-medium text-gray-900">{{ apiKey.name }}</h3>
          <span
            class="px-2 py-0.5 text-xs font-medium rounded"
            :class="apiKey.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'"
          >
            {{ apiKey.is_active ? 'Active' : 'Revoked' }}
          </span>
        </div>

        <!-- Key Prefix -->
        <div class="flex items-center gap-2 mb-2">
          <KeyIcon class="h-4 w-4 text-gray-400" />
          <code class="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
            {{ apiKey.key_prefix }}
          </code>
          <span class="text-sm text-gray-500">
            <ClockIcon class="h-4 w-4 inline mr-1" />
            Created {{ formatDate(apiKey.created_at) }}
          </span>
        </div>

        <!-- Rate Limit and Last Used -->
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>
            <BoltIcon class="h-4 w-4 inline mr-1" />
            {{ apiKey.rate_limit }} requests/hour
          </span>
          <span v-if="apiKey.last_used_at">
            <ArrowPathIcon class="h-4 w-4 inline mr-1" />
            Last used: {{ formatRelativeTime(apiKey.last_used_at) }}
          </span>
          <span v-if="apiKey.expires_at">
            <CalendarIcon class="h-4 w-4 inline mr-1" />
            Expires: {{ formatDate(apiKey.expires_at) }}
          </span>
        </div>

        <!-- Permissions -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="permission in apiKey.permissions"
            :key="permission"
            class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
          >
            {{ permission }}
          </span>
        </div>
      </div>

      <!-- Delete Button -->
      <button
        v-if="apiKey.is_active"
        @click="$emit('delete', apiKey)"
        class="p-2 text-gray-400 hover:text-red-600 transition-colors"
        title="Revoke API Key"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiKey } from '@/services/apikey.service'
import {
  KeyIcon,
  ClockIcon,
  BoltIcon,
  ArrowPathIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  apiKey: ApiKey
}

defineProps<Props>()

defineEmits<{
  delete: [key: ApiKey]
}>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateString)
}
</script>
