<script setup lang="ts">
import HighlightText from './HighlightText.vue'
import type { BoardResult } from '@/composables/useUnifiedSearch'
import { toYmd } from '@/utils/date'

interface Props {
  item: BoardResult
  keyword: string
}

defineProps<Props>()
</script>

<template>
  <RouterLink class="result-row" to="/board">
    <span class="row-tag">커뮤니티</span>
    <div class="row-main">
      <strong class="row-title">
        <HighlightText :text="item.title" :keyword="keyword" />
      </strong>
      <span class="row-sub">{{ item.authorName }} · 조회 {{ item.hit }}</span>
    </div>
    <span class="row-date">{{ toYmd(item.registerTime) }}</span>
  </RouterLink>
</template>

<style scoped>
.result-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
  color: inherit;
  text-decoration: none;
}

.result-row:last-child {
  border-bottom: 0;
}

.result-row:hover {
  background: var(--et-gray-50);
}

.row-tag {
  flex: 0 0 auto;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--et-gray-100);
  color: var(--et-gray-600);
  font-size: 12px;
  font-weight: 700;
}

.row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-title {
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: var(--et-gray-900);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-sub {
  color: var(--et-gray-500);
  font-size: 12px;
}

.row-date {
  flex: 0 0 auto;
  color: var(--et-gray-400);
  font-size: 13px;
}

@media (max-width: 575.98px) {
  .row-date {
    display: none;
  }
}
</style>
