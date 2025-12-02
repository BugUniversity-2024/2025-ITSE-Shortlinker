<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id?: string
  type?: string
  modelValue?: string | number
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `input-${Math.random().toString(36).slice(2, 9)}`,
  type: 'text',
  modelValue: '',
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputClasses = computed(() => {
  const base = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200'

  const state = props.error
    ? 'border-red-300 focus:ring-red-500'
    : 'border-gray-300 focus:ring-primary-500'

  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return [base, state, disabled]
})
</script>
