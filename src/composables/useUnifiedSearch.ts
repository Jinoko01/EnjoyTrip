import { shallowRef, watch, toValue, readonly, type MaybeRefOrGetter } from 'vue'
import api from '@/api'

export interface HotPlaceResult {
  hotPlaceId: number
  title: string
  location: string
  imageUrl: string | null
  registrationDate: string
}

export interface BoardResult {
  boardNo: number
  title: string
  authorName: string
  hit: number
  registerTime: string
}

export interface NewsResult {
  title: string
  link: string
  description: string
  pubDate: string
}

export interface NoticeResult {
  noticeNo: number
  title: string
  registerTime: string
}

export interface UnifiedSearchResult {
  keyword: string
  total: number
  hotplaces: HotPlaceResult[]
  boards: BoardResult[]
  news: NewsResult[]
  notices: NoticeResult[]
}

const EMPTY_RESULT: UnifiedSearchResult = {
  keyword: '',
  total: 0,
  hotplaces: [],
  boards: [],
  news: [],
  notices: [],
}

/**
 * 키워드가 바뀔 때마다 통합 검색 API(/api/search)를 호출한다.
 * 검색어가 비어 있으면 빈 결과를 유지하고, 마지막 요청 결과만 반영한다.
 */
export function useUnifiedSearch(keyword: MaybeRefOrGetter<string>) {
  const result = shallowRef<UnifiedSearchResult>(EMPTY_RESULT)
  const loading = shallowRef(false)
  const error = shallowRef(false)

  let latestRequestId = 0

  async function runSearch(rawKeyword: string) {
    const trimmed = rawKeyword.trim()
    if (!trimmed) {
      result.value = EMPTY_RESULT
      loading.value = false
      error.value = false
      return
    }

    const requestId = ++latestRequestId
    loading.value = true
    error.value = false
    try {
      const res = await api.get<UnifiedSearchResult>('/search', { params: { keyword: trimmed } })
      if (requestId !== latestRequestId) return
      result.value = res.data
    } catch {
      if (requestId !== latestRequestId) return
      error.value = true
      result.value = EMPTY_RESULT
    } finally {
      if (requestId === latestRequestId) loading.value = false
    }
  }

  watch(
    () => toValue(keyword),
    (kw) => runSearch(kw),
    { immediate: true },
  )

  return {
    result: readonly(result),
    loading: readonly(loading),
    error: readonly(error),
  }
}
