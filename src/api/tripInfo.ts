/** 여행지 상세용 날씨·전기차 충전소 조회 API. 백엔드 프록시(/weather, /charger)를 호출한다. */

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL || '/backend'

export interface CurrentWeather {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  icon: string
  desc: string
}

export interface DailyForecast {
  date: string
  min: number
  max: number
  icon: string
  desc: string
}

export interface SpotWeather {
  current: CurrentWeather
  daily: DailyForecast[]
}

export interface NearbyCharger {
  statNm: string
  addr: string
  lat: number
  lng: number
  distanceKm: number
  chgerType: string
  stat: string
}

async function backendGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_BASE}${path}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

export function fetchSpotWeather(lat: number, lng: number): Promise<SpotWeather> {
  return backendGet<SpotWeather>(`/weather?lat=${lat}&lng=${lng}`)
}

export function fetchNearbyChargers(
  lat: number,
  lng: number,
  sido: string,
  radius = 3,
  limit = 10,
): Promise<NearbyCharger[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    sido,
    radius: String(radius),
    limit: String(limit),
  })
  return backendGet<NearbyCharger[]>(`/charger?${params.toString()}`)
}
