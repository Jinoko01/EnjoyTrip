import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import { usePagination } from '@/composables/usePagination'
import { normalizeBoardCategory, type BoardCategoryFilter } from '@/utils/boardPresentation'
import type { Board, BoardListItem } from '@/types/board'

const BOARDS_PER_PAGE = 8

/**
 * 커뮤니티 목록의 조회·검색·카테고리 필터·인기글 선정·페이지네이션을 담당하는 컴포저블.
 * 원본 목록은 한 번만 받아 두고, 검색어/카테고리에 따라 파생 목록을 계산한다.
 *
 * @param initialKeyword 헤더 통합검색에서 넘어온 초기 검색어
 */
export function useBoardList(initialKeyword = '') {
  const loading = ref(true)
  const searchKeyword = ref(initialKeyword)
  const activeCategory = ref<BoardCategoryFilter>('전체')

  // 카테고리를 정규화해 더한 목록 (백엔드 값 검증용)
  const items = ref<BoardListItem[]>([])

  // 카테고리 → 검색어 순으로 좁혀 나간다.
  const byCategory = computed(() =>
    activeCategory.value === '전체'
      ? items.value
      : items.value.filter((b) => b.category === activeCategory.value),
  )

  const filteredBoards = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    if (!keyword) return byCategory.value
    return byCategory.value.filter((b) =>
      [b.title, b.authorName].some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(keyword),
      ),
    )
  })

  // 이번 주 인기글: 전체 글 중 좋아요가 가장 많은 글 (검색·필터와 무관하게 고정)
  const featured = computed<BoardListItem | null>(() => {
    if (items.value.length === 0) return null
    return items.value.reduce((top, b) => (b.likeCount > top.likeCount ? b : top), items.value[0])
  })

  // 검색·필터를 적용하지 않은 기본 상태에서만 인기글 배너를 노출한다.
  const showFeatured = computed(
    () => !searchKeyword.value.trim() && activeCategory.value === '전체' && featured.value !== null,
  )

  const {
    currentPage,
    totalPages,
    pagedItems: pagedBoards,
  } = usePagination(filteredBoards, BOARDS_PER_PAGE)

  async function loadBoards() {
    loading.value = true
    try {
      const res = await api.get<Board[]>('/board')
      items.value = res.data.map((b) => ({ ...b, category: normalizeBoardCategory(b.category) }))
    } finally {
      loading.value = false
    }
  }

  onMounted(loadBoards)

  return {
    loading,
    searchKeyword,
    activeCategory,
    filteredBoards,
    featured,
    showFeatured,
    pagedBoards,
    currentPage,
    totalPages,
    loadBoards,
  }
}
