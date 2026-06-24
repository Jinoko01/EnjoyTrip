import { ref } from 'vue'
import { fetchNearbyChargers, type NearbyCharger } from '@/api/tripInfo'

/** 선택한 관광지 주변 전기차 충전소를 조회하고 로딩/에러 상태를 관리하는 컴포저블. */
export function useNearbyChargers() {
  const chargers = ref<NearbyCharger[]>([])
  const loading = ref(false)
  const error = ref(false)

  async function load(lat: number, lng: number, sido: string) {
    loading.value = true
    error.value = false
    chargers.value = []
    try {
      chargers.value = await fetchNearbyChargers(lat, lng, sido)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { chargers, loading, error, load }
}
