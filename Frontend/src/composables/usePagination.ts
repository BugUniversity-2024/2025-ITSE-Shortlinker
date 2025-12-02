import { ref, computed } from 'vue'

export interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 10 } = options

  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const total = ref(0)
  const totalPages = computed(() => Math.ceil(total.value / limit.value))

  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  function setPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
    }
  }

  function nextPage() {
    if (hasNextPage.value) {
      page.value++
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      page.value--
    }
  }

  function setTotal(newTotal: number) {
    total.value = newTotal
    // 如果当前页超出范围，调整到最后一页
    if (page.value > totalPages.value && totalPages.value > 0) {
      page.value = totalPages.value
    }
  }

  function reset() {
    page.value = initialPage
    total.value = 0
  }

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    nextPage,
    prevPage,
    setTotal,
    reset
  }
}
