<template>
  <div class="sched-strip">
    <div
      v-for="(sche, i) in schedules"
      :key="sche.scheduleId"
      class="sched-chip"
      role="button"
      tabindex="0"
      @click="emit('select', sche)"
      @keydown.enter="emit('select', sche)"
    >
      <span class="sched-chip__bar" :style="{ background: scheduleColor(i).bar }"></span>
      <span class="sched-chip__body">
        <span class="sched-chip__title">{{ sche.title }}</span>
        <span class="sched-chip__date">
          <i class="bi bi-calendar-event"></i>
          {{ toDotYmd(sche.startDate) }} ~ {{ toDotYmd(sche.endDate) }}
        </span>
        <span class="sched-chip__count"
          >여행지 {{ sche.itemCount ?? sche.items?.length ?? 0 }}곳</span
        >
      </span>
      <button
        type="button"
        class="sched-chip__del"
        aria-label="일정 삭제"
        @click.stop="emit('delete', sche.scheduleId)"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <button type="button" class="sched-new" @click="emit('create')">
      <i class="bi bi-plus-circle"></i>
      <span>새 일정</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Schedule } from '@/composables/useSchedules'
import { scheduleColor } from '@/utils/scheduleColors'
import { toDotYmd } from '@/utils/date'

defineProps<{ schedules: readonly Schedule[] }>()

const emit = defineEmits<{
  select: [schedule: Schedule]
  create: []
  delete: [scheduleId: number]
}>()
</script>

<style scoped>
.sched-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 4px;
}

.sched-chip {
  position: relative;
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sched-chip:hover {
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.sched-chip__bar {
  width: 4px;
  flex-shrink: 0;
}

.sched-chip__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  min-width: 0;
}

.sched-chip__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--et-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sched-chip__date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.sched-chip__count {
  font-size: 11px;
  color: var(--et-gray-400);
}

.sched-chip__del {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--et-gray-400);
  font-size: 13px;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}
.sched-chip:hover .sched-chip__del {
  opacity: 1;
}
.sched-chip__del:hover {
  background: var(--et-gray-100);
  color: var(--et-sale-500);
}

.sched-new {
  flex: 0 0 auto;
  width: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--et-gray-50);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sched-new:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.sched-new i {
  font-size: 20px;
}
.sched-new span {
  font-size: 13px;
  font-weight: 600;
}
</style>
