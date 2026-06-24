import { onMounted, ref } from 'vue'
import api from '@/api'

export interface Schedule {
  scheduleId: number
  title: string
  startDate: string
  endDate: string
  memo?: string
  itemCount?: number
  items?: unknown[]
}

export interface NewSchedule {
  title: string
  startDate: string
  endDate: string
  memo: string
}

function emptyDraft(): NewSchedule {
  return { title: '', startDate: '', endDate: '', memo: '' }
}

/**
 * 내 여행 일정 목록의 조회·생성·삭제를 담당하는 컴포저블.
 * 상태는 읽기 전용으로 노출하고, 변경은 명시적 액션으로만 일어나게 한다.
 */
export function useSchedules() {
  const schedules = ref<Schedule[]>([])
  const loading = ref(true)

  async function loadSchedules() {
    loading.value = true
    try {
      const res = await api.get<Schedule[]>('/schedule')
      schedules.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createSchedule(draft: NewSchedule) {
    await api.post('/schedule', draft)
    await loadSchedules()
  }

  async function deleteSchedule(scheduleId: number) {
    await api.delete(`/schedule/${scheduleId}`)
    await loadSchedules()
  }

  onMounted(loadSchedules)

  return {
    schedules,
    loading,
    loadSchedules,
    createSchedule,
    deleteSchedule,
  }
}

export { emptyDraft }
