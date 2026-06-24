<template>
  <section class="charger-card">
    <h6 class="card-title"><i class="bi bi-ev-station me-2"></i>주변 전기차 충전소</h6>

    <div v-if="loading" class="card-state text-muted">충전소 정보를 불러오는 중…</div>
    <div v-else-if="error" class="card-state text-muted">충전소 정보를 불러오지 못했습니다.</div>
    <div v-else-if="chargers.length === 0" class="card-state text-muted">
      주변 충전소가 없습니다.
    </div>
    <ul v-else class="charger-list">
      <li v-for="(charger, i) in chargers" :key="i" class="charger-item">
        <div class="charger-head">
          <span class="charger-name text-truncate">{{ charger.statNm }}</span>
          <span class="charger-distance">{{ charger.distanceKm }}km</span>
        </div>
        <p class="charger-addr text-truncate">{{ charger.addr }}</p>
        <div class="charger-tags">
          <span class="tag">{{ charger.chgerType }}</span>
          <span class="tag tag--stat">{{ charger.stat }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { NearbyCharger } from '@/api/tripInfo'

defineProps<{
  chargers: NearbyCharger[]
  loading: boolean
  error: boolean
}>()
</script>

<style scoped>
.charger-card {
  padding: 14px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #fff;
}
.card-title {
  margin: 0 0 12px;
  font-weight: 700;
}
.card-state {
  padding: 12px 0;
  font-size: 13px;
}
.charger-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.charger-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-default);
}
.charger-item:last-child {
  border-bottom: 0;
}
.charger-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.charger-name {
  font-weight: 700;
  font-size: 14px;
}
.charger-distance {
  flex-shrink: 0;
  color: var(--primary-color);
  font-size: 13px;
  font-weight: 700;
}
.charger-addr {
  margin: 2px 0 6px;
  color: var(--et-gray-500);
  font-size: 12px;
}
.charger-tags {
  display: flex;
  gap: 6px;
}
.tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--et-gray-100);
  color: var(--et-gray-700);
  font-size: 11px;
  font-weight: 600;
}
.tag--stat {
  background: var(--et-blue-wash);
  color: var(--primary-color);
}
</style>
