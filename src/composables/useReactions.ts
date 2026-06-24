import { ref } from 'vue'
import api from '@/api'

/** 상세 조회 응답에서 내려오는 좋아요 관련 필드 */
export interface ReactionSource {
  liked?: boolean
  likeCount?: number
}

/**
 * 게시글·핫플레이스 등의 좋아요 토글 상태와 낙관적 업데이트 로직을 담는 컴포저블.
 * UI를 먼저 갱신하고 서버 응답으로 보정하며, 요청이 실패하면 이전 상태로 되돌린다.
 *
 * @param basePath 리소스 경로 (예: '/board', '/hotplace')
 * @param id       대상 리소스 식별자
 */
export function useReactions(basePath: string, id: number) {
  const liked = ref(false)
  const likeCount = ref(0)

  /** 상세 조회 결과로 초기 상태를 채운다 */
  function syncFrom(source: ReactionSource) {
    liked.value = !!source.liked
    likeCount.value = source.likeCount ?? 0
  }

  async function toggleLike() {
    const prevActive = liked.value
    const prevCount = likeCount.value
    // 낙관적 반영
    liked.value = !prevActive
    likeCount.value = prevCount + (liked.value ? 1 : -1)
    try {
      const res = await api.post(`${basePath}/${id}/like`)
      liked.value = res.data.liked
      likeCount.value = res.data.likeCount
    } catch (e) {
      liked.value = prevActive
      likeCount.value = prevCount
      throw e
    }
  }

  return { liked, likeCount, syncFrom, toggleLike }
}
