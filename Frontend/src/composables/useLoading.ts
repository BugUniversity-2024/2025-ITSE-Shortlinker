import { ref } from 'vue'

export function useLoading(initialState: boolean = false) {
  const loading = ref(initialState)
  const error = ref<Error | null>(null)

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw e
    } finally {
      loading.value = false
    }
  }

  function start() {
    loading.value = true
    error.value = null
  }

  function stop() {
    loading.value = false
  }

  function setError(e: Error | string) {
    error.value = e instanceof Error ? e : new Error(e)
  }

  return {
    loading,
    error,
    withLoading,
    start,
    stop,
    setError
  }
}
