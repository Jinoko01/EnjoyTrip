<template>
  <div class="sched-cal">
    <!-- 달력 헤더 -->
    <div class="cal-head">
      <div class="cal-head__left">
        <h3 class="cal-head__title">{{ monthLabel }}</h3>
        <div class="cal-head__nav">
          <button type="button" class="cal-navbtn" aria-label="이전 달" @click="prevMonth">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button type="button" class="cal-navbtn" aria-label="다음 달" @click="nextMonth">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      <button type="button" class="cal-navbtn cal-navbtn--today" @click="goToToday">오늘</button>
    </div>

    <!-- 요일 -->
    <div class="cal-weekdays">
      <div
        v-for="(w, i) in weekdays"
        :key="w"
        class="cal-weekday"
        :class="{ 'is-sun': i === 0, 'is-sat': i === 6 }"
      >
        {{ w }}
      </div>
    </div>

    <!-- 주 -->
    <div
      v-for="(week, wi) in weeks"
      :key="wi"
      class="cal-week"
      :class="{ 'is-last': wi === weeks.length - 1 }"
      :style="{ minHeight: weekMinHeight + 'px' }"
    >
      <div
        v-for="(day, ci) in week.days"
        :key="ci"
        class="cal-cell"
        :class="{ 'is-blank': !day, 'is-last-col': ci === 6 }"
      >
        <span
          v-if="day"
          class="cal-daynum"
          :class="{ 'is-today': isToday(day), 'is-sun': ci === 0, 'is-sat': ci === 6 }"
        >
          {{ day.getDate() }}
        </span>
      </div>

      <!-- 일정 막대 오버레이 -->
      <div class="cal-bars">
        <div v-for="(lane, li) in week.lanes" :key="li" class="cal-lane">
          <button
            v-if="lane"
            type="button"
            class="cal-bar"
            :title="lane.schedule.title"
            :style="barStyle(lane)"
            @click="emit('select', lane.schedule)"
          >
            {{ lane.startsHere ? lane.schedule.title : '⟵ ' + lane.schedule.title }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Schedule } from '@/composables/useSchedules'
import { useScheduleCalendar, type ScheduleLane } from '@/composables/useScheduleCalendar'
import { scheduleColor } from '@/utils/scheduleColors'

const props = defineProps<{ schedules: readonly Schedule[] }>()

const emit = defineEmits<{ select: [schedule: Schedule] }>()

const { monthLabel, weekdays, weeks, laneCount, isToday, prevMonth, nextMonth, goToToday } =
  useScheduleCalendar(() => props.schedules)

const LANE_TOP = 36
const LANE_ROW = 26 // 막대 높이 22 + 간격 4

// 일정 수만큼 레인 줄을 항상 확보해, 여러 주에 걸친 일정이 같은 줄을 유지하도록 한다.
const weekMinHeight = computed(() => Math.max(96, LANE_TOP + laneCount.value * LANE_ROW + 8))

function barStyle(lane: ScheduleLane) {
  const color = scheduleColor(lane.colorIndex)
  return {
    gridColumn: `${lane.startCol} / ${lane.endCol + 1}`,
    background: color.bar,
    borderTopLeftRadius: lane.startsHere ? '6px' : '0',
    borderBottomLeftRadius: lane.startsHere ? '6px' : '0',
    borderTopRightRadius: lane.endsHere ? '6px' : '0',
    borderBottomRightRadius: lane.endsHere ? '6px' : '0',
  }
}
</script>

<style scoped>
.sched-cal {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 헤더 */
.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
}
.cal-head__left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.cal-head__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--et-gray-900);
  letter-spacing: -0.02em;
}
.cal-head__nav {
  display: flex;
  gap: 4px;
}
.cal-navbtn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cal-navbtn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.cal-navbtn--today {
  width: auto;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--et-gray-700);
}

/* 요일 행 */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.cal-weekday {
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-default);
}
.cal-weekday.is-sun {
  color: var(--et-sale-500);
}
.cal-weekday.is-sat {
  color: var(--primary-color);
}

/* 주 */
.cal-week {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-default);
}
.cal-week.is-last {
  border-bottom: none;
}
.cal-cell {
  padding: 8px 8px 4px;
  border-right: 1px solid var(--border-default);
}
.cal-cell.is-last-col {
  border-right: none;
}
.cal-cell.is-blank {
  background: var(--et-gray-50);
}
.cal-daynum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 500;
  color: var(--et-gray-700);
}
.cal-daynum.is-sun {
  color: var(--et-sale-500);
}
.cal-daynum.is-sat {
  color: var(--primary-color);
}
.cal-daynum.is-today {
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
}

/* 일정 막대 오버레이 */
.cal-bars {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  pointer-events: none;
}
.cal-lane {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 22px;
}
.cal-bar {
  pointer-events: auto;
  height: 22px;
  margin: 0 3px;
  padding: 0 8px;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  opacity: 0.95;
  transition: opacity 0.15s ease;
}
.cal-bar:hover {
  opacity: 1;
}
</style>
