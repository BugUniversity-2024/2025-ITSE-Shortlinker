<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="flex items-center p-4 rounded-lg shadow-lg max-w-sm"
        :class="toastClasses(toast.type)"
      >
        <component :is="toastIcon(toast.type)" class="h-5 w-5 mr-3 flex-shrink-0" />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="uiStore.removeToast(toast.id)"
          class="ml-3 flex-shrink-0 text-current opacity-70 hover:opacity-100"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useUIStore, type ToastType } from '@/stores/ui'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const uiStore = useUIStore()

function toastClasses(type: ToastType) {
  const classes = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-blue-50 text-blue-800'
  }
  return classes[type]
}

function toastIcon(type: ToastType) {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type]
}
</script>
