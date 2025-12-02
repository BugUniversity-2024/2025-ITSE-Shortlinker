<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <svg
      class="animate-spin"
      :class="[sizeClasses, colorClasses]"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span v-if="text" class="ml-2" :class="textClasses">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  fullScreen: false
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-400'
  }
  return colors[props.color]
})

const textClasses = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  return [sizes[props.size], colorClasses.value]
})

const containerClass = computed(() => {
  return props.fullScreen ? 'min-h-screen' : ''
})
</script>
