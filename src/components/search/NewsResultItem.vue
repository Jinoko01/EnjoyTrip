<script setup lang="ts">
import HighlightText from './HighlightText.vue'
import type { NewsResult } from '@/composables/useUnifiedSearch'

interface Props {
  item: NewsResult
  keyword: string
}

defineProps<Props>()
</script>

<template>
  <a class="result-row" :href="item.link" target="_blank" rel="noopener noreferrer">
    <div class="row-thumb">
      <i class="bi bi-newspaper" aria-hidden="true"></i>
    </div>
    <div class="row-main">
      <span class="row-tag">여행뉴스</span>
      <strong class="row-title">
        <HighlightText :text="item.title" :keyword="keyword" />
      </strong>
      <span v-if="item.description" class="row-sub">{{ item.description }}</span>
    </div>
    <span class="row-date">{{ item.pubDate }}</span>
  </a>
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

.row-thumb {
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 22px;
}

.row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-tag {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 700;
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
  overflow: hidden;
  color: var(--et-gray-500);
  font-size: 12px;
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
