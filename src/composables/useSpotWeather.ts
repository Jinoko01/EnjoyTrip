import { ref } from 'vue'
import { fetchSpotWeather, type SpotWeather } from '@/api/tripInfo'

/** 선택한 관광지 좌표의 날씨를 조회하고 로딩/에러 상태를 관리하는 컴포저블. */
export function useSpotWeather() {
  const weather = ref<SpotWeather | null>(null)
  const loading = ref(false)
  const error = ref(false)

  async function load(lat: number, lng: number) {
    loading.value = true
    error.value = false
    weather.value = null
    try {
      weather.value = await fetchSpotWeather(lat, lng)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { weather, loading, error, load }
}
