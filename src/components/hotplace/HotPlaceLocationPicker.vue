<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { loadKakaoMapSdk } from '@/utils/kakaoMap'

export interface HotPlaceLocation {
  location: string
  placeName: string | null
  latitude: number
  longitude: number
  kakaoPlaceId: string | null
}

interface KakaoPlaceResult {
  id: string
  place_name: string
  category_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}

const props = defineProps<{
  modelValue: HotPlaceLocation | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HotPlaceLocation | null]
}>()

const KOREA_CENTER = { latitude: 36.5, longitude: 127.8 }
const PLACE_MAP_LEVEL = 4
const KOREA_MAP_LEVEL = 13

const keyword = ref('')
const results = ref<KakaoPlaceResult[]>([])
const sdkLoading = ref(true)
const sdkError = ref('')
const searching = ref(false)
const searchMessage = ref('')
const mapVisible = ref(false)
const adjustEnabled = ref(false)
const locationError = ref('')
const mapEl = ref<HTMLElement | null>(null)

let kakao: any = null
let places: any = null
let geocoder: any = null
let map: any = null
let marker: any = null
let lastValidPosition: { latitude: number; longitude: number } | null = null

function displayAddress(place: KakaoPlaceResult) {
  return place.road_address_name || place.address_name
}

async function initializeSdk() {
  sdkLoading.value = true
  sdkError.value = ''
  try {
    await loadKakaoMapSdk('services')
    kakao = window.kakao
    places = new kakao.maps.services.Places()
    geocoder = new kakao.maps.services.Geocoder()
  } catch {
    sdkError.value = '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    sdkLoading.value = false
  }
}

function searchPlaces() {
  const query = keyword.value.trim()
  if (!query) {
    searchMessage.value = '검색할 장소명을 입력해 주세요.'
    return
  }
  if (!places) {
    searchMessage.value = '지도를 먼저 불러와 주세요.'
    return
  }

  searching.value = true
  searchMessage.value = ''
  places.keywordSearch(query, (data: KakaoPlaceResult[], status: string) => {
    searching.value = false
    if (status === kakao.maps.services.Status.OK) {
      results.value = data
      return
    }
    results.value = []
    searchMessage.value =
      status === kakao.maps.services.Status.ZERO_RESULT
        ? '검색 결과가 없습니다. 다른 검색어를 입력하거나 지도에서 직접 선택해 주세요.'
        : '장소 검색에 실패했습니다. 다시 시도해 주세요.'
  })
}

async function selectPlace(place: KakaoPlaceResult) {
  const latitude = Number(place.y)
  const longitude = Number(place.x)
  const location = displayAddress(place)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !location) {
    searchMessage.value = '이 장소의 위치 정보를 사용할 수 없습니다.'
    return
  }

  emit('update:modelValue', {
    location,
    placeName: place.place_name,
    latitude,
    longitude,
    kakaoPlaceId: String(place.id),
  })
  results.value = []
  keyword.value = place.place_name
  adjustEnabled.value = false
  locationError.value = ''
  mapVisible.value = true
  await nextTick()
  initializeMap(latitude, longitude, PLACE_MAP_LEVEL)
}

async function startDirectSelection() {
  if (!kakao) return
  emit('update:modelValue', null)
  lastValidPosition = null
  adjustEnabled.value = true
  locationError.value = ''
  results.value = []
  mapVisible.value = true
  await nextTick()
  initializeMap(KOREA_CENTER.latitude, KOREA_CENTER.longitude, KOREA_MAP_LEVEL, false)
}

function initializeMap(latitude: number, longitude: number, level: number, showMarker = true) {
  if (!mapEl.value || !kakao) return

  const position = new kakao.maps.LatLng(latitude, longitude)
  if (!map) {
    map = new kakao.maps.Map(mapEl.value, { center: position, level })
    kakao.maps.event.addListener(map, 'click', (event: any) => {
      if (!adjustEnabled.value) return
      updateLocationFromCoordinates(event.latLng.getLat(), event.latLng.getLng())
    })
  } else {
    map.setCenter(position)
    map.setLevel(level)
    map.relayout()
  }

  if (showMarker) {
    setMarkerPosition(latitude, longitude)
    lastValidPosition = { latitude, longitude }
  } else if (marker) {
    marker.setMap(null)
  }
}

function setMarkerPosition(latitude: number, longitude: number) {
  const position = new kakao.maps.LatLng(latitude, longitude)
  if (!marker) {
    marker = new kakao.maps.Marker({
      map,
      position,
      draggable: adjustEnabled.value,
    })
    kakao.maps.event.addListener(marker, 'dragend', () => {
      const nextPosition = marker.getPosition()
      updateLocationFromCoordinates(nextPosition.getLat(), nextPosition.getLng())
    })
  } else {
    marker.setMap(map)
    marker.setPosition(position)
    marker.setDraggable(adjustEnabled.value)
  }
}

function toggleAdjustment() {
  adjustEnabled.value = !adjustEnabled.value
  marker?.setDraggable(adjustEnabled.value)
}

function updateLocationFromCoordinates(latitude: number, longitude: number) {
  if (!geocoder) return
  locationError.value = ''

  geocoder.coord2Address(longitude, latitude, (data: any[], status: string) => {
    const addressResult = data[0]
    const address =
      addressResult?.road_address?.address_name || addressResult?.address?.address_name || ''

    if (status !== kakao.maps.services.Status.OK || !address) {
      locationError.value = '선택한 위치의 주소를 확인하지 못했습니다. 다른 지점을 선택해 주세요.'
      if (lastValidPosition) {
        setMarkerPosition(lastValidPosition.latitude, lastValidPosition.longitude)
      }
      return
    }

    setMarkerPosition(latitude, longitude)
    lastValidPosition = { latitude, longitude }
    emit('update:modelValue', {
      location: address,
      placeName: props.modelValue?.placeName ?? null,
      latitude,
      longitude,
      kakaoPlaceId: props.modelValue?.kakaoPlaceId ?? null,
    })
  })
}

onMounted(initializeSdk)
</script>

<template>
  <div class="location-picker">
    <label for="hotplace-location-search" class="form-label fw-semibold">장소</label>
    <div class="location-search">
      <input
        id="hotplace-location-search"
        v-model="keyword"
        type="search"
        class="form-control"
        placeholder="예: 롯데월드, 광안리 수변공원"
        :disabled="sdkLoading || !!sdkError"
        @keydown.enter.prevent="searchPlaces"
      />
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="sdkLoading || !!sdkError || searching"
        @click="searchPlaces"
      >
        <span v-if="searching" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span v-else>검색</span>
      </button>
    </div>

    <div v-if="sdkLoading" class="location-status text-muted">
      <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
      지도를 준비하고 있습니다.
    </div>
    <div v-else-if="sdkError" class="location-status location-status--error">
      <span>{{ sdkError }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="initializeSdk">
        다시 시도
      </button>
    </div>

    <ul v-if="results.length" class="place-results" aria-label="장소 검색 결과">
      <li v-for="place in results" :key="place.id">
        <button type="button" class="place-result" @click="selectPlace(place)">
          <span class="place-result__name">{{ place.place_name }}</span>
          <span class="place-result__address">{{ displayAddress(place) }}</span>
          <span v-if="place.category_name" class="place-result__category">
            {{ place.category_name }}
          </span>
        </button>
      </li>
    </ul>

    <div v-if="searchMessage" class="location-status text-muted">{{ searchMessage }}</div>

    <button
      v-if="!sdkLoading && !sdkError"
      type="button"
      class="direct-select"
      @click="startDirectSelection"
    >
      <i class="bi bi-geo-alt"></i>
      검색 대신 지도에서 직접 선택
    </button>

    <div v-if="mapVisible" class="location-map-panel">
      <div class="location-map-toolbar">
        <div v-if="modelValue" class="selected-location">
          <strong>{{ modelValue.placeName || '선택한 위치' }}</strong>
          <span>{{ modelValue.location }}</span>
        </div>
        <div v-else class="selected-location">
          <strong>지도에서 위치를 선택해 주세요.</strong>
          <span>지도를 이동·확대한 뒤 원하는 지점을 클릭하세요.</span>
        </div>
        <button
          v-if="modelValue"
          type="button"
          class="btn btn-sm"
          :class="adjustEnabled ? 'btn-primary' : 'btn-outline-primary'"
          @click="toggleAdjustment"
        >
          {{ adjustEnabled ? '위치 조정 완료' : '지도에서 위치 조정' }}
        </button>
      </div>
      <div ref="mapEl" class="location-map" aria-label="핫플레이스 위치 선택 지도"></div>
      <p v-if="adjustEnabled && modelValue" class="location-help">
        마커를 드래그하거나 지도를 클릭해 위치를 보정할 수 있습니다.
      </p>
      <p v-if="locationError" class="location-error">{{ locationError }}</p>
    </div>
  </div>
</template>

<style scoped>
.location-picker {
  position: relative;
}

.location-search {
  display: flex;
  gap: 0.5rem;
}

.location-search .btn {
  min-width: 74px;
}

.location-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.6rem;
  font-size: 0.875rem;
}

.location-status--error,
.location-error {
  color: #c0392b;
}

.place-results {
  max-height: 240px;
  padding: 0.35rem;
  margin: 0.5rem 0 0;
  overflow-y: auto;
  list-style: none;
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 12px;
}

.place-result {
  display: grid;
  width: 100%;
  padding: 0.7rem 0.75rem;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 9px;
}

.place-result:hover,
.place-result:focus-visible {
  background: #f0f7ff;
  outline: none;
}

.place-result__name {
  font-weight: 700;
  color: #172033;
}

.place-result__address,
.place-result__category {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: #687386;
}

.direct-select {
  padding: 0;
  margin-top: 0.65rem;
  font-size: 0.86rem;
  color: #52606f;
  background: transparent;
  border: 0;
}

.direct-select:hover {
  color: #087cff;
}

.location-map-panel {
  margin-top: 0.75rem;
  overflow: hidden;
  border: 1px solid #dfe5ec;
  border-radius: 14px;
}

.location-map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
}

.selected-location {
  display: grid;
  min-width: 0;
}

.selected-location strong,
.selected-location span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-location strong {
  font-size: 0.9rem;
  color: #172033;
}

.selected-location span {
  margin-top: 0.15rem;
  font-size: 0.78rem;
  color: #687386;
}

.location-map {
  width: 100%;
  height: 260px;
}

.location-help,
.location-error {
  padding: 0.6rem 0.75rem;
  margin: 0;
  font-size: 0.8rem;
  background: #f8fafc;
}

@media (max-width: 576px) {
  .location-map-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
