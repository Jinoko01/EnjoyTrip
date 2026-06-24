<script setup lang="ts">
import HighlightText from './HighlightText.vue'
import type { NoticeResult } from '@/composables/useUnifiedSearch'
import { toYmd } from '@/utils/date'

interface Props {
  item: NoticeResult
  keyword: string
}

defineProps<Props>()
</script>

<template>
  <RouterLink class="result-row" to="/notice">
    <span class="row-tag">공지</span>
    <div class="row-main">
      <strong class="row-title">
        <HighlightText :text="item.title" :keyword="keyword" />
      </strong>
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
  background: var(--et-sale-50, #fff1f0);
  color: var(--et-sale-500);
  font-size: 12px;
  font-weight: 700;
}

.row-main {
  min-width: 0;
  flex: 1;
}

.row-title {
  display: block;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: var(--et-gray-900);
  text-overflow: ellipsis;
  white-space: nowrap;
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
