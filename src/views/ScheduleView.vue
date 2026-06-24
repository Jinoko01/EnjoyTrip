<template>
  <header class="custom-page-header border-bottom">
    <div class="container header-content">
      <i class="bi bi-map text-primary display-4 mb-3 d-inline-block"></i>
      <h1 class="fw-bold">내 여행 일정</h1>
      <p class="lead text-muted mb-0">여행지를 담아 나만의 코스를 만들고 동선을 최적화하세요.</p>
    </div>
  </header>

  <main class="container mb-5 pb-5">
    <div class="schedule-toolbar">
      <span class="schedule-toolbar__count">총 {{ schedules.length }}개의 일정</span>
      <button class="btn btn-custom" @click="showCreateModal = true">
        <i class="bi bi-plus-lg me-1"></i> 새 일정 만들기
      </button>
    </div>

    <template v-if="loading">
      <div class="sched-strip-skeleton">
        <SkeletonBox v-for="n in 4" :key="n" width="210px" height="68px" />
      </div>
      <SkeletonBox width="100%" height="460px" />
    </template>

    <template v-else>
      <ScheduleStrip
        :schedules="schedules"
        @select="goDetail"
        @create="showCreateModal = true"
        @delete="onDelete"
      />
      <ScheduleCalendar :schedules="schedules" @select="goDetail" />
    </template>
  </main>

  <ScheduleCreateModal v-model="showCreateModal" @submit="onCreate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSchedules, type NewSchedule, type Schedule } from '@/composables/useSchedules'
import ScheduleStrip from '@/components/schedule/ScheduleStrip.vue'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue'
import ScheduleCreateModal from '@/components/schedule/ScheduleCreateModal.vue'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'

const router = useRouter()
const { schedules, loading, createSchedule, deleteSchedule } = useSchedules()

const showCreateModal = ref(false)

function goDetail(schedule: Schedule) {
  router.push(`/schedule-detail/${schedule.scheduleId}`)
}

async function onCreate(draft: NewSchedule) {
  if (!isValidDateString(draft.startDate)) {
    alert('출발일은 YYYY-MM-DD 형식의 올바른 날짜로 입력해주세요.')
    return
  }

  if (!isValidDateString(draft.endDate)) {
    alert('도착일은 YYYY-MM-DD 형식의 올바른 날짜로 입력해주세요.')
    return
  }

  if (draft.startDate > draft.endDate) {
    alert('도착일은 출발일보다 빠를 수 없습니다.')
    return
  }

  await createSchedule(draft)
  showCreateModal.value = false
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

async function onDelete(scheduleId: number) {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return
  await deleteSchedule(scheduleId)
}
</script>

<style scoped>
.schedule-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.schedule-toolbar__count {
  font-size: 14px;
  color: var(--text-muted);
}

.sched-strip-skeleton {
  display: flex;
  gap: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}
</style>
