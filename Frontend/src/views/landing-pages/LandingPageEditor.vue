<template>
  <DashboardLayout>
    <div class="h-[calc(100vh-64px)] flex flex-col">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <router-link to="/dashboard/links" class="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon class="h-5 w-5" />
          </router-link>
          <h1 class="text-lg font-semibold text-gray-900">Landing Page Editor</h1>
        </div>
        <div class="flex items-center space-x-2">
          <select v-model="activeTab" class="input-field w-32">
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
          <BaseButton variant="secondary" @click="loadTemplate">
            <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
            Templates
          </BaseButton>
          <BaseButton variant="primary" :loading="isSaving" @click="handleSave">
            <CheckIcon class="h-4 w-4 mr-2" />
            Save
          </BaseButton>
        </div>
      </div>

      <!-- 编辑器和预览区域 -->
      <div class="flex-1 flex">
        <!-- 代码编辑器 -->
        <div class="w-1/2 border-r border-gray-200">
          <div ref="editorContainer" class="h-full" />
        </div>

        <!-- 预览区域 -->
        <div class="w-1/2 bg-gray-100">
          <div class="h-full p-4">
            <div class="bg-white rounded-lg shadow h-full overflow-auto">
              <iframe
                ref="previewFrame"
                :srcdoc="previewContent"
                class="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Template Selection Modal -->
      <BaseModal v-model="showTemplateModal" title="Select Template" size="lg">
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="template in templates"
            :key="template.id"
            class="border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors"
            @click="selectTemplate(template)"
          >
            <div class="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
              <DocumentIcon class="h-8 w-8 text-gray-400" />
            </div>
            <h3 class="font-medium text-gray-900">{{ template.name }}</h3>
            <p class="text-sm text-gray-500">{{ template.description }}</p>
          </div>
        </div>
      </BaseModal>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { landingPageService } from '@/services/landing-page.service'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  DocumentIcon
} from '@heroicons/vue/24/outline'
import type { LandingPageTemplate } from '@/types'

// Monaco Editor 动态加载
import loader from '@monaco-editor/loader'

interface Props {
  id: string
}

const props = defineProps<Props>()
const uiStore = useUIStore()

const editorContainer = ref<HTMLElement | null>(null)
const previewFrame = ref<HTMLIFrameElement | null>(null)
const activeTab = ref<'html' | 'css'>('html')
const isSaving = ref(false)
const showTemplateModal = ref(false)

let editor: unknown = null

const content = ref({
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Landing Page</title>
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
    <p>This is your landing page content</p>
    <a href="#" class="btn">Learn More</a>
  </div>
</body>
</html>`,
  css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  text-align: center;
  color: white;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn:hover {
  transform: scale(1.05);
}`
})

const previewContent = computed(() => {
  const htmlContent = content.value.html
  const cssContent = content.value.css

  // 在 HTML 中注入 CSS
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `<style>${cssContent}</style></head>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
  <style>${cssContent}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`
})

const templates = ref<LandingPageTemplate[]>([])

async function fetchTemplates() {
  try {
    templates.value = await landingPageService.getTemplates()
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    // 如果 API 失败，使用默认模板
    templates.value = [
      {
        id: 1,
        name: 'Minimalist',
        description: 'Clean and simple single page design',
        thumbnail: '',
        html_content: content.value.html,
        css_content: content.value.css
      }
    ]
  }
}

async function initEditor() {
  const monaco = await loader.init()

  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: content.value[activeTab.value],
      language: activeTab.value,
      theme: 'vs-light',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on'
    })

    // 监听内容变化
    ;(editor as { onDidChangeModelContent: (cb: () => void) => void }).onDidChangeModelContent(() => {
      content.value[activeTab.value] = (editor as { getValue: () => string }).getValue()
    })
  }
}

watch(activeTab, (newTab) => {
  if (editor) {
    const monaco = (window as { monaco?: unknown }).monaco as { editor: { setModelLanguage: (model: unknown, lang: string) => void } }
    const model = (editor as { getModel: () => unknown }).getModel()
    monaco.editor.setModelLanguage(model, newTab)
    ;(editor as { setValue: (v: string) => void }).setValue(content.value[newTab])
  }
})

function loadTemplate() {
  showTemplateModal.value = true
}

function selectTemplate(template: LandingPageTemplate) {
  content.value.html = template.html_content
  content.value.css = template.css_content
  if (editor) {
    ;(editor as { setValue: (v: string) => void }).setValue(content.value[activeTab.value])
  }
  showTemplateModal.value = false
  uiStore.success('Template loaded')
}

async function handleSave() {
  isSaving.value = true
  try {
    await landingPageService.updateLandingPage(Number(props.id), {
      html_content: content.value.html,
      css_content: content.value.css
    })
    uiStore.success('Saved successfully')
  } catch (error) {
    console.error('Failed to save:', error)
    uiStore.error('Failed to save landing page')
  }
  isSaving.value = false
}

async function fetchLandingPage() {
  try {
    const landingPage = await landingPageService.getLandingPage(Number(props.id))
    if (landingPage) {
      content.value.html = landingPage.html_content || content.value.html
      content.value.css = landingPage.css_content || content.value.css
    }
  } catch (error) {
    // Landing page 可能不存在，使用默认内容
    console.log('No existing landing page, using defaults')
  }
}

onMounted(async () => {
  await fetchLandingPage()
  await fetchTemplates()
  initEditor()
})
</script>
