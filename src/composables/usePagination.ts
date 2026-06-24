import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

/**
 * 클라이언트에서 받아 둔 전체 목록을 페이지 단위로 잘라 보여주기 위한 컴포저블.
 * 원본(source)이 바뀌면(검색·정렬·재조회 등) 현재 페이지를 1로 되돌려
 * "사라진 페이지에 머무는" 혼란을 막는다.
 *
 * @param source   페이지네이션할 전체 목록 (ref / computed / getter)
 * @param pageSize 한 페이지에 보여줄 개수
 */
export function usePagination<T>(source: MaybeRefOrGetter<T[]>, pageSize: number) {
  const currentPage = ref(1)

  const totalCount = computed(() => toValue(source).length)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize)
  const pagedItems = computed(() =>
    toValue(source).slice(startIndex.value, startIndex.value + pageSize),
  )

  // 원본 목록이 바뀌면(검색어·정렬·데이터 재조회) 첫 페이지부터 다시 본다.
  watch(
    () => toValue(source),
    () => {
      currentPage.value = 1
    },
  )

  function goToPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  return { currentPage, totalPages, totalCount, startIndex, pagedItems, goToPage }
}
