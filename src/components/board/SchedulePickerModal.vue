<script setup lang="ts">
import { placeholderGradient } from '@/utils/boardPresentation'
import type { Schedule } from '@/composables/useSchedules'

// 글에 공유할 내 일정을 고르는 모달. 목록/로딩은 부모가 소유하고 선택만 위임한다.
defineProps<{ open: boolean; schedules: Schedule[]; loading: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', schedule: Schedule): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="sp-overlay" @click.self="emit('close')">
      <div class="sp-modal" role="dialog" aria-modal="true" aria-label="공유할 일정 선택">
        <header class="sp-header">
          <h2 class="sp-title">공유할 일정 선택</h2>
          <button type="button" class="sp-close" aria-label="닫기" @click="emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </header>

        <div class="sp-body">
          <p v-if="loading" class="sp-empty">일정을 불러오는 중…</p>
          <p v-else-if="schedules.length === 0" class="sp-empty">
            공유할 수 있는 일정이 없습니다. 먼저 일정을 만들어보세요.
          </p>
          <div v-else class="sp-list">
            <button
              v-for="s in schedules"
              :key="s.scheduleId"
              type="button"
              class="sp-item"
              @click="emit('select', s)"
            >
              <span class="sp-thumb" :style="{ background: placeholderGradient(s.scheduleId) }">
                <i class="bi bi-map" aria-hidden="true"></i>
              </span>
              <span class="sp-info">
                <span class="sp-item-title">{{ s.title }}</span>
                <span class="sp-item-sub">
                  {{ s.startDate }} ~ {{ s.endDate }} · 여행지 {{ s.itemCount ?? 0 }}곳
                </span>
              </span>
              <i class="bi bi-chevron-right sp-chevron" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sp-overlay {
  position: fixed;
  inset: 0;
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(25, 31, 40, 0.55);
}
.sp-modal {
  width: 100%;
  max-width: 460px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
.sp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
}
.sp-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--et-gray-900);
}
.sp-close {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1;
}
.sp-close:hover {
  color: var(--et-gray-900);
}

.sp-body {
  padding: 4px 24px 24px;
  overflow-y: auto;
}
.sp-empty {
  padding: 28px 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
}
.sp-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.sp-item:hover {
  border-color: var(--primary-color);
  background: var(--et-blue-wash);
}
.sp-thumb {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 48px;
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
}
.sp-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sp-item-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--et-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-item-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.sp-chevron {
  flex-shrink: 0;
  color: var(--et-gray-400);
}
</style>
