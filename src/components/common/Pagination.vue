<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 현재 페이지(1부터 시작) */
  currentPage: number
  /** 전체 페이지 수 */
  totalPages: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:currentPage', page: number): void }>()

/** 양끝 생략(…) 없이 모든 페이지를 그대로 보여줄 임계값 */
const SIMPLE_THRESHOLD = 7
/** 현재 페이지 좌우로 함께 노출할 페이지 수 */
const SIBLING_COUNT = 1

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const pageItems = computed<PageItem[]>(() => {
  const { totalPages, currentPage } = props
  if (totalPages <= SIMPLE_THRESHOLD) return range(1, totalPages)

  const left = Math.max(currentPage - SIBLING_COUNT, 2)
  const right = Math.min(currentPage + SIBLING_COUNT, totalPages - 1)

  const items: PageItem[] = [1]
  if (left > 2) items.push('ellipsis-start')
  items.push(...range(left, right))
  if (right < totalPages - 1) items.push('ellipsis-end')
  items.push(totalPages)
  return items
})

const isFirstPage = computed(() => props.currentPage <= 1)
const isLastPage = computed(() => props.currentPage >= props.totalPages)

function goToPage(page: number) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return
  emit('update:currentPage', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 이동">
    <button
      type="button"
      class="page-btn page-arrow"
      :disabled="isFirstPage"
      aria-label="이전 페이지"
      @click="goToPage(currentPage - 1)"
    >
      <i class="bi bi-chevron-left" aria-hidden="true"></i>
    </button>

    <template v-for="(item, idx) in pageItems" :key="idx">
      <span v-if="typeof item !== 'number'" class="page-ellipsis" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        class="page-btn"
        :class="{ active: item === currentPage }"
        :aria-current="item === currentPage ? 'page' : undefined"
        :aria-label="`${item} 페이지`"
        @click="goToPage(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      class="page-btn page-arrow"
      :disabled="isLastPage"
      aria-label="다음 페이지"
      @click="goToPage(currentPage + 1)"
    >
      <i class="bi bi-chevron-right" aria-hidden="true"></i>
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: #fff;
  color: var(--text-muted, #485568);
  font-size: 0.9rem;
  font-weight: 700;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  color: var(--primary-color, #087ff5);
  border-color: var(--primary-color, #087ff5);
  background: #f2f8ff;
}

.page-btn.active {
  color: #fff;
  border-color: var(--primary-color, #087ff5);
  background: var(--primary-color, #087ff5);
  cursor: default;
}

.page-btn:disabled {
  color: #c2cbd6;
  cursor: not-allowed;
}

.page-arrow {
  font-size: 0.8rem;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 38px;
  color: #9aa7b6;
  user-select: none;
}
</style>
