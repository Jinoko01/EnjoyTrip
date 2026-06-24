import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { parseScheduleDate } from '@/utils/scheduleColors'
import type { Schedule } from '@/composables/useSchedules'

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 한 주(week) 안에서 일정 하나가 차지하는 가로 막대 정보. */
export interface ScheduleLane {
  schedule: Schedule
  colorIndex: number
  /** CSS grid 시작 칼럼(1-based) */
  startCol: number
  /** CSS grid 끝 칼럼(1-based, 포함) */
  endCol: number
  /** 이 주에서 일정이 시작하는가(왼쪽 끝 둥글게) */
  startsHere: boolean
  /** 이 주에서 일정이 끝나는가(오른쪽 끝 둥글게) */
  endsHere: boolean
}

export interface CalendarWeek {
  /** 7칸(앞뒤 빈칸은 null) */
  days: (Date | null)[]
  /** 일정별 레인(겹치지 않으면 null) — 여러 주에 걸친 일정이 같은 줄을 유지하도록 일정 수만큼 유지 */
  lanes: (ScheduleLane | null)[]
}

const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.toDateString() === b.toDateString()

/**
 * 일정 목록으로 "여러 날에 걸친 일정 막대"가 있는 월간 달력을 구성하는 컴포저블.
 * 월 이동 상태와 주/레인 계산만 책임지고, 표현(스타일/색)은 컴포넌트가 담당한다.
 */
export function useScheduleCalendar(source: MaybeRefOrGetter<readonly Schedule[]>) {
  const today = new Date()
  const cursor = ref({ year: today.getFullYear(), month: today.getMonth() })
  // 사용자가 직접 월을 옮기기 전까지는 가장 이른 일정의 달을 따라가게 한다.
  const userNavigated = ref(false)

  const events = computed(() =>
    toValue(source).map((schedule, index) => ({
      schedule,
      colorIndex: index,
      start: parseScheduleDate(schedule.startDate),
      end: parseScheduleDate(schedule.endDate),
    })),
  )

  // 첫 로드 시(사용자 조작 전) 가장 이른 일정이 있는 달로 이동.
  watch(
    events,
    (list) => {
      if (userNavigated.value || list.length === 0) return
      const earliest = list.reduce((a, e) => (e.start < a ? e.start : a), list[0].start)
      cursor.value = { year: earliest.getFullYear(), month: earliest.getMonth() }
    },
    { immediate: true },
  )

  const monthLabel = computed(() => `${cursor.value.year}년 ${cursor.value.month + 1}월`)

  const weeks = computed<CalendarWeek[]>(() => {
    const { year, month } = cursor.value
    const lead = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: (Date | null)[] = []
    for (let i = 0; i < lead; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7) cells.push(null)

    const result: CalendarWeek[] = []
    for (let i = 0; i < cells.length; i += 7) {
      const days = cells.slice(i, i + 7)
      const weekStart = days.find(Boolean) ?? null
      const weekEnd = [...days].reverse().find(Boolean) ?? null

      const lanes = events.value.map<ScheduleLane | null>((e) => {
        if (!weekStart || !weekEnd || e.end < weekStart || e.start > weekEnd) return null
        let startCol = days.findIndex((c) => c && c >= e.start)
        if (startCol === -1) startCol = 0
        let endCol = 0
        for (let c = 0; c < 7; c++) if (days[c] && days[c]! <= e.end) endCol = c
        return {
          schedule: e.schedule,
          colorIndex: e.colorIndex,
          startCol: startCol + 1,
          endCol: endCol + 1,
          startsHere: e.start >= weekStart && e.start <= weekEnd,
          endsHere: e.end >= weekStart && e.end <= weekEnd,
        }
      })

      result.push({ days, lanes })
    }
    return result
  })

  /** 이 달에 그려야 할 레인 줄 수(주 높이 계산용) */
  const laneCount = computed(() => events.value.length)

  function shiftMonth(delta: number) {
    userNavigated.value = true
    let { year, month } = cursor.value
    month += delta
    while (month < 0) {
      month += 12
      year--
    }
    while (month > 11) {
      month -= 12
      year++
    }
    cursor.value = { year, month }
  }

  function goToToday() {
    userNavigated.value = true
    cursor.value = { year: today.getFullYear(), month: today.getMonth() }
  }

  const isToday = (date: Date | null) => sameDay(date, today)

  return {
    monthLabel,
    weekdays: WEEKDAYS,
    weeks,
    laneCount,
    isToday,
    prevMonth: () => shiftMonth(-1),
    nextMonth: () => shiftMonth(1),
    goToToday,
  }
}
