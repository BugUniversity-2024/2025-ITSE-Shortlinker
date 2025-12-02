import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

export interface ModalConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

let toastIdCounter = 0

export const useUIStore = defineStore('ui', () => {
  // Toast 状态
  const toasts = ref<Toast[]>([])

  // Modal 状态
  const showModal = ref(false)
  const modalConfig = ref<ModalConfig | null>(null)

  // 侧边栏状态
  const sidebarOpen = ref(true)

  // 全局加载状态
  const globalLoading = ref(false)

  // Toast 方法
  function addToast(message: string, type: ToastType = 'info', duration: number = 3000): number {
    const id = ++toastIdCounter
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  // 快捷方法
  function success(message: string, duration?: number) {
    return addToast(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return addToast(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    return addToast(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    return addToast(message, 'info', duration)
  }

  // Modal 方法
  function openModal(config: ModalConfig) {
    modalConfig.value = config
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    modalConfig.value = null
  }

  async function confirmModal() {
    if (modalConfig.value?.onConfirm) {
      await modalConfig.value.onConfirm()
    }
    closeModal()
  }

  function cancelModal() {
    if (modalConfig.value?.onCancel) {
      modalConfig.value.onCancel()
    }
    closeModal()
  }

  // 侧边栏方法
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(open: boolean) {
    sidebarOpen.value = open
  }

  // 全局加载
  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  return {
    // Toast
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,

    // Modal
    showModal,
    modalConfig,
    openModal,
    closeModal,
    confirmModal,
    cancelModal,

    // Sidebar
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,

    // Global loading
    globalLoading,
    setGlobalLoading
  }
})
