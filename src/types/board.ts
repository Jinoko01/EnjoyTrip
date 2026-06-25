import type { BoardCategory } from '@/utils/boardPresentation'

/** 게시글에 연결된 여행 일정 요약 (상세 조회 응답에 포함) */
export interface LinkedSchedule {
  scheduleId: number
  title: string
  startDate: string
  endDate: string
  itemCount?: number
}

/** 백엔드 /board 응답 형태 */
export interface Board {
  boardNo: number
  title: string
  content?: string
  category?: string // 백엔드 board.category — 여행후기/질문/추천/자유
  userId?: string
  authorName: string
  hit: number
  registerTime?: string
  likeCount: number
  liked?: boolean
  scheduleId?: number | null
  linkedSchedule?: LinkedSchedule | null
  coverImage?: string | null // 대표(첫) 사진 — 목록 썸네일용
  imageUrls?: string[] // 상세 조회 시의 전체 사진 목록
}

/** 화면 표시용 파생 카테고리를 더한 게시글 */
export interface BoardListItem extends Board {
  category: BoardCategory
}
