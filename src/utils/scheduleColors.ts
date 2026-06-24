/**
 * 일정마다 부여하는 색상 레인 팔레트.
 * 일정 목록 카드(왼쪽 색 바)와 달력의 일정 바가 같은 색을 쓰도록,
 * 일정 배열에서의 순서(index)를 기준으로 색을 매긴다. (4개를 초과하면 순환)
 */
export interface ScheduleColor {
  /** 카드 좌측 바 · 달력 막대 배경색 */
  bar: string
  /** 연한 배경(washed) 색 */
  soft: string
  /** 진한 글자색(ink) */
  ink: string
}

export const SCHEDULE_PALETTE: readonly ScheduleColor[] = [
  { bar: '#0085ff', soft: '#eef6ff', ink: '#005bb8' },
  { bar: '#00b894', soft: '#e3f8f2', ink: '#067a63' },
  { bar: '#ff3848', soft: '#ffe9eb', ink: '#e01f30' },
  { bar: '#ffb400', soft: '#fff7e6', ink: '#9a6a00' },
]

export function scheduleColor(index: number): ScheduleColor {
  return SCHEDULE_PALETTE[index % SCHEDULE_PALETTE.length]
}

/**
 * "2026-07-04" / "2026.07.04" / "2026-07-04 00:00:00" 등에서 연·월·일만 떼어
 * 로컬 자정 기준 Date를 만든다. (시간대 보정으로 날짜가 밀리지 않도록 직접 파싱)
 */
export function parseScheduleDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split(/[-.]/).map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}
