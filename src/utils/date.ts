/**
 * "2026-05-28 12:00:00" 같은 DB 타임스탬프 문자열에서 날짜(yyyy-MM-dd)만 추출한다.
 * 형식이 다르거나 비어 있으면 앞 10글자를 그대로 반환한다.
 */
export function toYmd(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}

/**
 * "2026-07-04" 같은 날짜 문자열을 "2026.07.04"처럼 점 구분 표기로 바꾼다.
 * 디자인 시안의 일정 날짜 표기(YYYY.MM.DD)에 맞추기 위한 표시용 포매터.
 */
export function toDotYmd(value: string | null | undefined): string {
  return toYmd(value).replace(/-/g, '.')
}
