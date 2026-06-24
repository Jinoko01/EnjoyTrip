<script setup lang="ts">
import { computed } from 'vue'
import HighlightText from './HighlightText.vue'
import type { HotPlaceResult } from '@/composables/useUnifiedSearch'
import { toYmd } from '@/utils/date'

interface Props {
  item: HotPlaceResult
  keyword: string
}

const props = defineProps<Props>()

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const imageSrc = computed(() => {
  const url = props.item.imageUrl
  if (!url) return ''
  return url.startsWith('http') ? url : `${apiBaseUrl}${url}`
})
</script>

<template>
  <RouterLink class="result-row" to="/hotplace">
    <div class="row-thumb">
      <img v-if="imageSrc" :src="imageSrc" :alt="item.title" />
      <i v-else class="bi bi-fire" aria-hidden="true"></i>
    </div>
    <div class="row-main">
      <span class="row-location">
        <i class="bi bi-geo-alt-fill" aria-hidden="true"></i>{{ item.location }}
      </span>
      <strong class="row-title">
        <HighlightText :text="item.title" :keyword="keyword" />
      </strong>
    </div>
    <span class="row-date">{{ toYmd(item.registrationDate) }}</span>
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

.row-thumb {
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: var(--et-gray-100);
  color: var(--et-gray-400);
  font-size: 22px;
}

.row-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 600;
}

.row-title {
  min-width: 0;
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
  .row-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .row-date {
    display: none;
  }
}
</style>
