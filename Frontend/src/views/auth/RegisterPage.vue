<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <LinkIcon class="h-12 w-12 text-primary-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Create a New Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <BaseInput
            v-model="form.username"
            label="Username"
            placeholder="Enter your username"
            :error="errors.username"
            required
          />

          <BaseInput
            v-model="form.email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            :error="errors.email"
            required
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password (min 8 characters)"
                required
                class="input-field pr-10"
                :class="{ 'border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="agree-terms"
            v-model="form.agreeTerms"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
            I agree to the
            <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
            and
            <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </label>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isLoading"
          :disabled="!form.agreeTerms"
          class="w-full"
        >
          Sign Up
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  LinkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

function validateForm(): boolean {
  let isValid = true
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  if (!form.username) {
    errors.username = 'Please enter username'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Please enter email'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Please enter password'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

async function handleRegister() {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await userStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })

    if (result.success) {
      uiStore.success('Registration successful, please sign in')
      router.push('/login')
    } else {
      errorMessage.value = result.message || 'Registration failed, please try again'
    }
  } catch {
    errorMessage.value = 'Network error, please try again later'
  } finally {
    isLoading.value = false
  }
}
</script>
