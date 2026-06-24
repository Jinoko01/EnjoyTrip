<template>
  <div class="spot-detail">
    <button type="button" class="back-btn" @click="emit('close')">
      <i class="bi bi-arrow-left me-1"></i>목록으로
    </button>

    <header class="spot-header">
      <img
        :src="image || 'https://placehold.jp/24/cccccc/ffffff/80x80.png?text=No+Image'"
        class="spot-image"
        alt=""
      />
      <div class="spot-text">
        <h5 class="spot-title">{{ title }}</h5>
        <p class="spot-addr">{{ addr }}</p>
      </div>
    </header>

    <div class="spot-cards">
      <WeatherCard :weather="weather" :loading="weatherLoading" :error="weatherError" />
      <ChargerList :chargers="chargers" :loading="chargersLoading" :error="chargersError" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import WeatherCard from './WeatherCard.vue'
import ChargerList from './ChargerList.vue'
import { useSpotWeather } from '@/composables/useSpotWeather'
import { useNearbyChargers } from '@/composables/useNearbyChargers'
import type { NearbyCharger } from '@/api/tripInfo'

const props = defineProps<{
  title: string
  image?: string
  addr: string
  lat: number
  lng: number
}>()

const emit = defineEmits<{
  close: []
  'chargers-loaded': [chargers: NearbyCharger[]]
}>()

const {
  weather,
  loading: weatherLoading,
  error: weatherError,
  load: loadWeather,
} = useSpotWeather()
const {
  chargers,
  loading: chargersLoading,
  error: chargersError,
  load: loadChargers,
} = useNearbyChargers()

async function loadAll() {
  loadWeather(props.lat, props.lng)
  await loadChargers(props.lat, props.lng, props.addr)
  emit('chargers-loaded', chargers.value)
}

onMounted(loadAll)
watch(() => [props.lat, props.lng], loadAll)
</script>

<style scoped>
.spot-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
}
.back-btn {
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--et-gray-700);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.spot-header {
  display: flex;
  gap: 12px;
  align-items: center;
}
.spot-image {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--et-gray-100);
}
.spot-title {
  margin: 0;
  font-weight: 800;
  font-size: 17px;
}
.spot-addr {
  margin: 4px 0 0;
  color: var(--et-gray-500);
  font-size: 13px;
}
.spot-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
