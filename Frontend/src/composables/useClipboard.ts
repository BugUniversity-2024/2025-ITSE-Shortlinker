import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const error = ref<Error | null>(null)

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      error.value = null

      // Reset state after 2 seconds
      setTimeout(() => {
        copied.value = false
      }, 2000)

      return true
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Copy failed')
      copied.value = false
      return false
    }
  }

  return {
    copied,
    error,
    copy
  }
}
