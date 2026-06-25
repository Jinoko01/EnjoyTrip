// 커뮤니티(게시판) 화면 표시용 헬퍼.
//
// 카테고리는 백엔드 board.category 컬럼에 저장된다. 썸네일 이미지가 없는 글은
// 색상 플레이스홀더로 대체한다(글 번호에서 "결정적으로" 파생 — 같은 글은 항상 같은 색).

export const BOARD_CATEGORIES = ['여행후기', '질문', '추천', '자유'] as const
export type BoardCategory = (typeof BOARD_CATEGORIES)[number]

export type BoardCategoryFilter = '전체' | BoardCategory

// 목록 상단 필터 탭 (디자인과 동일하게 '자유'는 탭에 노출하지 않고 '전체'에 포함)
export const BOARD_CATEGORY_TABS: BoardCategoryFilter[] = ['전체', '여행후기', '질문', '추천']

// 글쓰기에서 선택 가능한 카테고리
export const BOARD_WRITE_CATEGORIES: BoardCategory[] = ['여행후기', '질문', '추천', '자유']

/** 응답의 카테고리 값을 검증한다. 비거나 알 수 없는 값은 기본값(자유)으로 보정한다. */
export function normalizeBoardCategory(value: string | undefined | null): BoardCategory {
  return (BOARD_CATEGORIES as readonly string[]).includes(value ?? '')
    ? (value as BoardCategory)
    : '자유'
}

export interface BadgeStyle {
  color: string
  background: string
}

/** 카테고리별 뱃지 색상 (디자인의 boardCatColor 매핑을 따른다) */
export function categoryBadge(category: BoardCategory): BadgeStyle {
  switch (category) {
    case '질문':
      return { color: 'var(--et-sale-500)', background: 'rgba(255, 56, 72, 0.1)' }
    case '추천':
      return { color: '#067a63', background: '#e3f8f2' }
    case '자유':
      return { color: 'var(--et-gray-600)', background: 'var(--et-gray-100)' }
    default:
      return { color: 'var(--primary-color)', background: 'var(--et-blue-wash)' }
  }
}

const AVATAR_COLORS = ['#00b894', '#ff9f0a', '#0087ff', '#7c5cff', '#e84393']

/** 이름으로부터 결정적인 아바타 배경색을 고른다. */
export function avatarColor(seed: string): string {
  let sum = 0
  for (const ch of seed) sum += ch.charCodeAt(0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

/** 아바타에 표시할 첫 글자 (없으면 '익') */
export function avatarInitial(name?: string): string {
  return name?.charAt(0) || '익'
}

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #0085ff, #00c2ff)',
  'linear-gradient(135deg, #7c5cff, #b18cff)',
  'linear-gradient(135deg, #00b894, #4fd1b5)',
  'linear-gradient(135deg, #ff9f0a, #ffd166)',
  'linear-gradient(135deg, #ff3848, #ff7a85)',
]

/** 이미지가 없는 글의 썸네일/커버 자리에 쓸 결정적 그라데이션 */
export function placeholderGradient(seed: number): string {
  return PLACEHOLDER_GRADIENTS[Math.abs(seed) % PLACEHOLDER_GRADIENTS.length]
}

/** 본문을 카드용 한 줄 요약으로 정리한다. */
export function toExcerpt(content: string | undefined, max = 120): string {
  if (!content) return ''
  const flat = content.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

/** 'YYYY-MM-DD HH:mm:ss' 형태의 등록시각에서 날짜만 추출한다. */
export function toDateOnly(registerTime?: string): string {
  return registerTime?.substring(0, 10) ?? ''
}
