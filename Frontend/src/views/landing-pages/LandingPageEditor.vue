<template>
  <DashboardLayout>
    <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      <!-- Header Toolbar -->
      <div class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <router-link to="/dashboard/links" class="text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon class="h-5 w-5" />
          </router-link>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Landing Page Editor</h1>
            <p class="text-sm text-gray-500">Create a custom landing page for short link {{ shortCode }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Device Preview Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              v-for="device in devices"
              :key="device.id"
              @click="previewDevice = device.id"
              :class="[
                'p-2 rounded-md transition-colors',
                previewDevice === device.id ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <component :is="device.icon" class="h-4 w-4" />
            </button>
          </div>
          <div class="h-6 w-px bg-gray-200" />
          <!-- Action Buttons -->
          <BaseButton variant="secondary" @click="handleReset">
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Reset
          </BaseButton>
          <BaseButton variant="secondary" :loading="isSavingDraft" @click="handleSaveDraft">
            <DocumentIcon class="h-4 w-4 mr-2" />
            Save Draft
          </BaseButton>
          <BaseButton variant="primary" :loading="isPublishing" @click="handlePublish">
            <CloudArrowUpIcon class="h-4 w-4 mr-2" />
            Publish
          </BaseButton>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel - Editor -->
        <div class="w-[420px] bg-white border-r border-gray-200 flex flex-col">
          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex-1 flex flex-col items-center py-3 px-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              <component :is="tab.icon" class="h-5 w-5 mb-1" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Template Tab -->
            <div v-if="activeTab === 'template'">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Choose a Template</h3>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="template in templates"
                  :key="template.id"
                  @click="selectTemplate(template)"
                  :class="[
                    'relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
                    selectedTemplate?.id === template.id
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <div
                    class="aspect-[4/3] flex items-center justify-center"
                    :style="{ background: template.preview_bg }"
                  >
                    <div class="text-center text-white/90 transform scale-75">
                      <div class="w-8 h-1 bg-white/60 rounded mx-auto mb-1" />
                      <div class="w-12 h-1 bg-white/40 rounded mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Tab -->
            <div v-else-if="activeTab === 'content'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  v-model="pageContent.title"
                  type="text"
                  class="input-field"
                  placeholder="Welcome"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  v-model="pageContent.subtitle"
                  type="text"
                  class="input-field"
                  placeholder="You are being redirected"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="pageContent.description"
                  class="input-field"
                  rows="2"
                  placeholder="Click the button below to continue to the destination page."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  v-model="pageContent.buttonText"
                  type="text"
                  class="input-field"
                  placeholder="Continue"
                />
              </div>
            </div>

            <!-- Style Tab -->
            <div v-else-if="activeTab === 'style'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="pageStyle.bgColor"
                    type="color"
                    class="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    v-model="pageStyle.bgColor"
                    type="text"
                    class="input-field flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="pageStyle.buttonColor"
                    type="color"
                    class="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    v-model="pageStyle.buttonColor"
                    type="text"
                    class="input-field flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="pageStyle.textColor"
                    type="color"
                    class="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                  />
                  <input
                    v-model="pageStyle.textColor"
                    type="text"
                    class="input-field flex-1"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>

            <!-- Options Tab -->
            <div v-else-if="activeTab === 'options'" class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Auto Redirect</label>
                  <p class="text-xs text-gray-500">Automatically redirect after countdown</p>
                </div>
                <input
                  v-model="pageOptions.autoRedirect"
                  type="checkbox"
                  class="toggle"
                />
              </div>
              <div v-if="pageOptions.autoRedirect">
                <label class="block text-sm font-medium text-gray-700 mb-1">Countdown (seconds)</label>
                <input
                  v-model.number="pageOptions.countdown"
                  type="number"
                  min="1"
                  max="60"
                  class="input-field"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Show Link Icon</label>
                  <p class="text-xs text-gray-500">Display link icon at the top</p>
                </div>
                <input
                  v-model="pageOptions.showIcon"
                  type="checkbox"
                  class="toggle"
                />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Show Branding</label>
                  <p class="text-xs text-gray-500">Display "Powered by TinyBridge"</p>
                </div>
                <input
                  v-model="pageOptions.showBranding"
                  type="checkbox"
                  class="toggle"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Preview -->
        <div class="flex-1 p-8 flex items-center justify-center overflow-auto">
          <div
            :class="[
              'bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300',
              previewWidthClass
            ]"
          >
            <!-- Browser Chrome -->
            <div class="bg-gray-100 px-4 py-3 flex items-center space-x-2">
              <div class="flex space-x-1.5">
                <div class="w-3 h-3 rounded-full bg-red-400" />
                <div class="w-3 h-3 rounded-full bg-yellow-400" />
                <div class="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div class="flex-1 flex justify-center">
                <div class="bg-white rounded-md px-4 py-1.5 text-sm text-gray-500 flex items-center space-x-2 min-w-[300px]">
                  <span class="truncate">https://tinybridge.link/{{ shortCode }}</span>
                  <ArrowTopRightOnSquareIcon class="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            </div>

            <!-- Page Content Preview -->
            <div
              class="p-8 min-h-[400px] flex flex-col items-center justify-center text-center"
              :style="{ backgroundColor: pageStyle.bgColor }"
            >
              <!-- Link Icon -->
              <div v-if="pageOptions.showIcon" class="mb-4">
                <LinkIcon class="h-10 w-10" :style="{ color: pageStyle.textColor }" />
              </div>

              <!-- Countdown -->
              <div
                v-if="pageOptions.autoRedirect"
                class="flex items-center space-x-2 text-sm mb-4"
                :style="{ color: pageStyle.textColor, opacity: 0.7 }"
              >
                <ClockIcon class="h-4 w-4" />
                <span>Redirecting in {{ pageOptions.countdown }} seconds...</span>
              </div>

              <!-- Title -->
              <h1
                class="text-3xl font-bold mb-2"
                :style="{ color: pageStyle.textColor }"
              >
                {{ pageContent.title || 'Welcome' }}
              </h1>

              <!-- Subtitle -->
              <p
                class="text-lg mb-2"
                :style="{ color: pageStyle.textColor }"
              >
                {{ pageContent.subtitle || 'You are being redirected' }}
              </p>

              <!-- Description -->
              <p
                class="text-sm max-w-md mb-6"
                :style="{ color: pageStyle.textColor, opacity: 0.8 }"
              >
                {{ pageContent.description || 'Click the button below to continue to the destination page.' }}
              </p>

              <!-- Button -->
              <button
                class="px-6 py-3 rounded-lg font-medium text-white flex items-center space-x-2 transition-transform hover:scale-105"
                :style="{ backgroundColor: pageStyle.buttonColor }"
              >
                <span>{{ pageContent.buttonText || 'Continue' }}</span>
                <ArrowRightIcon class="h-4 w-4" />
              </button>

              <!-- Branding -->
              <p
                v-if="pageOptions.showBranding"
                class="mt-8 text-xs"
                :style="{ color: pageStyle.textColor, opacity: 0.5 }"
              >
                Powered by TinyBridge
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { landingPageService } from '@/services/landing-page.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  LinkIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  ArrowTopRightOnSquareIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  SwatchIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

interface Props {
  id: string
}

const props = defineProps<Props>()
const route = useRoute()
const uiStore = useUIStore()

const shortCode = computed(() => route.query.code as string || 'aB3xY9')

// Device preview
const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const devices = [
  { id: 'desktop' as const, icon: markRaw(ComputerDesktopIcon) },
  { id: 'tablet' as const, icon: markRaw(DeviceTabletIcon) },
  { id: 'mobile' as const, icon: markRaw(DevicePhoneMobileIcon) }
]

const previewWidthClass = computed(() => {
  switch (previewDevice.value) {
    case 'mobile': return 'w-[375px]'
    case 'tablet': return 'w-[768px]'
    default: return 'w-full max-w-[900px]'
  }
})

// Tabs
const activeTab = ref<'template' | 'content' | 'style' | 'options'>('template')
const tabs = [
  { id: 'template' as const, label: 'Template', icon: markRaw(Squares2X2Icon) },
  { id: 'content' as const, label: 'Content', icon: markRaw(DocumentTextIcon) },
  { id: 'style' as const, label: 'Style', icon: markRaw(SwatchIcon) },
  { id: 'options' as const, label: 'Options', icon: markRaw(Cog6ToothIcon) }
]

// Templates
const templates = ref([
  { id: 1, name: 'Minimal', preview_bg: '#ffffff', bgColor: '#ffffff', buttonColor: '#3b82f6', textColor: '#1f2937' },
  { id: 2, name: 'Purple Gradient', preview_bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', bgColor: '#7c3aed', buttonColor: '#ffffff', textColor: '#ffffff' },
  { id: 3, name: 'Dark', preview_bg: '#1f2937', bgColor: '#1f2937', buttonColor: '#3b82f6', textColor: '#ffffff' },
  { id: 4, name: 'Coral', preview_bg: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', bgColor: '#f97316', buttonColor: '#ffffff', textColor: '#ffffff' },
  { id: 5, name: 'Ocean', preview_bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', bgColor: '#3b82f6', buttonColor: '#ffffff', textColor: '#ffffff' },
  { id: 6, name: 'Forest', preview_bg: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', bgColor: '#10b981', buttonColor: '#ffffff', textColor: '#ffffff' },
  { id: 7, name: 'Sunset', preview_bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', bgColor: '#fbbf24', buttonColor: '#1f2937', textColor: '#1f2937' },
  { id: 8, name: 'Lavender', preview_bg: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', bgColor: '#a78bfa', buttonColor: '#ffffff', textColor: '#ffffff' }
])

const selectedTemplate = ref(templates.value[0])

// Page content
const pageContent = ref({
  title: 'Welcome',
  subtitle: 'You are being redirected',
  description: 'Click the button below to continue to the destination page.',
  buttonText: 'Continue'
})

// Page style
const pageStyle = ref({
  bgColor: '#ffffff',
  buttonColor: '#3b82f6',
  textColor: '#1f2937'
})

// Page options
const pageOptions = ref({
  autoRedirect: true,
  countdown: 5,
  showIcon: true,
  showBranding: true
})

// Loading states
const isSavingDraft = ref(false)
const isPublishing = ref(false)

function selectTemplate(template: typeof templates.value[0]) {
  selectedTemplate.value = template
  pageStyle.value = {
    bgColor: template.bgColor,
    buttonColor: template.buttonColor,
    textColor: template.textColor
  }
}

function handleReset() {
  selectTemplate(templates.value[0])
  pageContent.value = {
    title: 'Welcome',
    subtitle: 'You are being redirected',
    description: 'Click the button below to continue to the destination page.',
    buttonText: 'Continue'
  }
  pageOptions.value = {
    autoRedirect: true,
    countdown: 5,
    showIcon: true,
    showBranding: true
  }
  uiStore.success('Reset to default')
}

function generateHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageContent.value.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      background-color: ${pageStyle.value.bgColor};
      color: ${pageStyle.value.textColor};
    }
    .icon { margin-bottom: 1rem; }
    .countdown { font-size: 0.875rem; opacity: 0.7; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .subtitle { font-size: 1.125rem; margin-bottom: 0.5rem; }
    .description { font-size: 0.875rem; opacity: 0.8; max-width: 400px; margin-bottom: 1.5rem; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: ${pageStyle.value.buttonColor};
      color: ${pageStyle.value.bgColor === '#ffffff' ? '#ffffff' : pageStyle.value.bgColor};
      border: none; border-radius: 0.5rem;
      font-size: 1rem; font-weight: 500;
      cursor: pointer; text-decoration: none;
      transition: transform 0.2s;
    }
    .btn:hover { transform: scale(1.05); }
    .branding { margin-top: 2rem; font-size: 0.75rem; opacity: 0.5; }
  </style>
</head>
<body>
  ${pageOptions.value.showIcon ? '<div class="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>' : ''}
  ${pageOptions.value.autoRedirect ? `<div class="countdown"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span id="countdown">Redirecting in ${pageOptions.value.countdown} seconds...</span></div>` : ''}
  <h1>${pageContent.value.title}</h1>
  <p class="subtitle">${pageContent.value.subtitle}</p>
  <p class="description">${pageContent.value.description}</p>
  <a href="{{TARGET_URL}}" class="btn">${pageContent.value.buttonText} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
  ${pageOptions.value.showBranding ? '<p class="branding">Powered by TinyBridge</p>' : ''}
  ${pageOptions.value.autoRedirect ? `<script>
    let seconds = ${pageOptions.value.countdown};
    const el = document.getElementById('countdown');
    const interval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(interval);
        window.location.href = '{{TARGET_URL}}';
      } else {
        el.textContent = 'Redirecting in ' + seconds + ' seconds...';
      }
    }, 1000);
  <\/script>` : ''}
</body>
</html>`
}

async function handleSaveDraft() {
  isSavingDraft.value = true
  try {
    await landingPageService.updateLandingPage(Number(props.id), {
      html_content: generateHtml(),
      css_content: '',
      is_published: false
    })
    uiStore.success('Draft saved')
  } catch (error) {
    console.error('Failed to save draft:', error)
    uiStore.error('Failed to save draft')
  }
  isSavingDraft.value = false
}

async function handlePublish() {
  isPublishing.value = true
  try {
    await landingPageService.updateLandingPage(Number(props.id), {
      html_content: generateHtml(),
      css_content: '',
      is_published: true
    })
    uiStore.success('Published successfully!')
  } catch (error) {
    console.error('Failed to publish:', error)
    uiStore.error('Failed to publish')
  }
  isPublishing.value = false
}

async function fetchLandingPage() {
  try {
    const landingPage = await landingPageService.getLandingPage(Number(props.id))
    if (landingPage?.html_content) {
      // 可以尝试解析已保存的内容来恢复状态
      // 这里简化处理，直接使用默认值
    }
  } catch (error) {
    console.log('No existing landing page, using defaults')
  }
}

onMounted(() => {
  fetchLandingPage()
})
</script>

<style scoped>
.toggle {
  width: 2.5rem;
  height: 1.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  appearance: none;
}
.toggle:checked {
  background-color: #2563eb;
}
.toggle::before {
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 9999px;
  top: 0.25rem;
  left: 0.25rem;
  transition: transform 0.2s;
}
.toggle:checked::before {
  transform: translateX(1rem);
}
</style>
