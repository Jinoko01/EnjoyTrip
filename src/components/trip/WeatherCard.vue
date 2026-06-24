<template>
  <section class="weather-card">
    <h6 class="card-title"><i class="bi bi-cloud-sun me-2"></i>날씨</h6>

    <div v-if="loading" class="card-state text-muted">날씨 정보를 불러오는 중…</div>
    <div v-else-if="error || !weather" class="card-state text-muted">
      날씨 정보를 불러오지 못했습니다.
    </div>
    <template v-else>
      <div class="current">
        <img
          :src="iconUrl(weather.current.icon)"
          :alt="weather.current.desc"
          class="current-icon"
        />
        <div class="current-main">
          <span class="temp">{{ Math.round(weather.current.temp) }}°</span>
          <span class="desc">{{ weather.current.desc }}</span>
        </div>
        <dl class="current-meta">
          <div>
            <dt>체감</dt>
            <dd>{{ Math.round(weather.current.feelsLike) }}°</dd>
          </div>
          <div>
            <dt>습도</dt>
            <dd>{{ weather.current.humidity }}%</dd>
          </div>
          <div>
            <dt>바람</dt>
            <dd>{{ weather.current.windSpeed }}m/s</dd>
          </div>
        </dl>
      </div>

      <ul class="forecast">
        <li v-for="day in weather.daily" :key="day.date">
          <span class="day">{{ formatDay(day.date) }}</span>
          <img :src="iconUrl(day.icon)" :alt="day.desc" class="forecast-icon" />
          <span class="range">{{ Math.round(day.min) }}° / {{ Math.round(day.max) }}°</span>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { SpotWeather } from '@/api/tripInfo'

defineProps<{
  weather: SpotWeather | null
  loading: boolean
  error: boolean
}>()

function iconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function formatDay(date: string) {
  const weekday = ['일', '월', '화', '수', '목', '금', '토']
  const d = new Date(`${date}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()} (${weekday[d.getDay()]})`
}
</script>

<style scoped>
.weather-card {
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
.current {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.current-icon {
  width: 56px;
  height: 56px;
}
.current-main {
  display: flex;
  flex-direction: column;
}
.temp {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}
.desc {
  color: var(--et-gray-500);
  font-size: 13px;
}
.current-meta {
  display: flex;
  gap: 14px;
  margin: 0 0 0 auto;
}
.current-meta div {
  text-align: center;
}
.current-meta dt {
  color: var(--et-gray-500);
  font-size: 11px;
  font-weight: 600;
}
.current-meta dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}
.forecast {
  display: flex;
  gap: 6px;
  margin: 14px 0 0;
  padding: 12px 0 0;
  list-style: none;
  border-top: 1px solid var(--border-default);
}
.forecast li {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.forecast .day {
  font-size: 12px;
  font-weight: 600;
}
.forecast-icon {
  width: 34px;
  height: 34px;
}
.forecast .range {
  font-size: 12px;
  color: var(--et-gray-700);
}
</style>
