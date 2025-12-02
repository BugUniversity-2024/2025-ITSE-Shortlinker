<template>
  <div class="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <LinkIcon class="h-12 w-12 text-primary-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to Your Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
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
                placeholder="Enter your password"
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
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>
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
          class="w-full"
        >
          Sign In
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  LinkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

function validateForm(): boolean {
  let isValid = true
  errors.email = ''
  errors.password = ''

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
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await userStore.login({
      username: form.email,
      password: form.password
    })

    if (result.success) {
      const redirect = route.query.redirect as string
      router.push(redirect || '/dashboard')
    } else {
      errorMessage.value = result.message || 'Login failed, please try again'
    }
  } catch {
    errorMessage.value = 'Network error, please try again later'
  } finally {
    isLoading.value = false
  }
}
</script>
