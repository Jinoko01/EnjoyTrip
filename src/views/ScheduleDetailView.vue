<template>
  <div id="map-container">
    <div v-if="isAddModalOpen" class="add-modal-backdrop" @click.self="closeAddModal">
      <section class="add-modal-card">
        <h6>일정에 추가</h6>
        <p class="add-trip-name">{{ pendingTrip?.title }}</p>
        <p class="add-trip-address">{{ pendingTrip?.addr1 }}</p>
        <label
          >DAY<select v-model="addFormDay">
            <option v-for="day in dayOptions" :key="day" :value="day">DAY {{ day }}</option>
          </select></label
        ><label>방문 시간<input v-model="addFormVisitTime" placeholder="예: 15:00" /></label
        ><label
          >설명<textarea
            v-model="addFormDescription"
            placeholder="이 장소에 대한 메모를 입력하세요"
          ></textarea>
        </label>
        <div class="add-modal-actions">
          <button class="btn btn-outline-secondary" @click="closeAddModal">취소</button
          ><button class="btn btn-primary" @click="confirmAddTrip">추가하기</button>
        </div>
      </section>
    </div>
    <div id="sd-map" ref="mapEl"></div>
    <div v-if="mapLoadError" class="map-error">{{ mapLoadError }}</div>

    <div class="side-panel">
      <div class="panel-header">
        <div class="d-flex align-items-center mb-1">
          <RouterLink
            to="/schedule"
            class="text-muted me-2"
            style="font-size: 12px; text-decoration: none"
          >
            <i class="bi bi-chevron-left"></i> 목록
          </RouterLink>
          <SkeletonBox v-if="loading" width="60%" height="18px" />
          <h6 v-else class="fw-bold mb-0 text-truncate flex-grow-1">{{ schedule?.title || '' }}</h6>
        </div>
        <SkeletonBox v-if="loading" width="40%" height="13px" />
        <div v-else class="text-primary small fw-bold">
          {{ schedule?.startDate }} ~ {{ schedule?.endDate }}
        </div>
      </div>

      <div class="panel-body">
        <!-- 검색 -->
        <div class="body-section">
          <div class="section-label"><i class="bi bi-search me-1"></i>여행지 검색</div>
          <div class="position-relative">
            <div class="input-group shadow-sm mb-2">
              <span class="input-group-text bg-light border-0"
                ><i class="bi bi-search text-primary" style="font-size: 13px"></i
              ></span>
              <input
                v-model="spotKeyword"
                type="text"
                class="form-control border-0 bg-light"
                placeholder="장소명으로 검색"
                autocomplete="off"
                @input="onSpotKeywordInput"
                @keydown="onSpotKeydown"
              />
              <button
                v-if="spotKeyword"
                class="input-group-text bg-light border-0 px-2"
                @click="spotKeyword = ''"
              >
                <i class="bi bi-x text-muted" style="font-size: 16px"></i>
              </button>
            </div>
            <ul
              v-if="acList.length"
              class="list-group position-absolute w-100 shadow"
              style="
                z-index: 999;
                border-radius: 8px;
                max-height: 280px;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
              "
            >
              <li
                v-for="(item, i) in acList"
                :key="i"
                class="ac-item list-group-item list-group-item-action"
                :class="{ active: i === acActiveIndex }"
                @click="selectAcItem(item)"
              >
                <div v-html="item.highlighted"></div>
                <div class="ac-addr">{{ item.addr1 }}</div>
              </li>
            </ul>
          </div>

          <div class="row g-2">
            <div class="col-12">
              <select
                v-model="selectedAreaCode"
                class="form-select form-select-sm border-0 shadow-sm bg-light"
                @change="onSpotAreaChange"
              >
                <option value="" disabled>시/도 선택</option>
                <option
                  v-for="region in TOUR_REGIONS"
                  :key="region.areaCode"
                  :value="region.areaCode"
                >
                  {{ region.name }}
                </option>
              </select>
            </div>
            <div class="col-12">
              <select
                v-model="selectedSigunguCode"
                class="form-select form-select-sm border-0 shadow-sm bg-light"
              >
                <option value="" disabled>시/군/구 선택</option>
                <option v-for="s in sigungus" :key="s.code" :value="String(s.code)">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="col-12">
              <select
                v-model="selectedCategory"
                class="form-select form-select-sm border-0 shadow-sm bg-light"
              >
                <option value="">모든 유형</option>
                <option value="12">관광지</option>
                <option value="14">문화시설</option>
                <option value="15">축제공연행사</option>
                <option value="25">여행코스</option>
                <option value="28">레포츠</option>
                <option value="32">숙박</option>
                <option value="38">쇼핑</option>
                <option value="39">음식점</option>
              </select>
            </div>
            <div class="col-12">
              <button class="btn btn-custom btn-sm w-100" :disabled="searching" @click="doSearch">
                <span v-if="searching" class="spinner-border spinner-border-sm me-1"></span>
                <i class="bi bi-search me-1"></i>검색
              </button>
            </div>
          </div>
        </div>

        <!-- 검색 결과 -->
        <div v-if="searchResults.length > 0" class="body-section">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="section-label mb-0">검색 결과</div>
            <button class="btn btn-sm p-0 text-muted" @click="searchResults = []">
              <i class="bi bi-x" style="font-size: 18px"></i>
            </button>
          </div>
          <div
            v-for="(trip, i) in visibleSearchResults"
            :key="i"
            class="search-result-item"
            :class="{ added: isAdded(trip) }"
            @click="!isAdded(trip) && openAddModal(trip)"
          >
            <img
              :src="trip.firstimage || 'https://placehold.jp/24/cccccc/ffffff/42x42.png?text=No'"
              class="result-thumb"
              @error="
                ($event.target as HTMLImageElement).src =
                  'https://placehold.jp/24/cccccc/ffffff/42x42.png?text=No'
              "
            />
            <div class="result-info">
              <div class="r-title">{{ trip.title }}</div>
              <div class="r-addr">{{ trip.addr1 || '' }}</div>
            </div>
            <button
              class="btn-add-spot"
              :class="{ added: isAdded(trip) }"
              @click.stop="!isAdded(trip) && openAddModal(trip)"
            >
              <i v-if="isAdded(trip)" class="bi bi-check2"></i>
              <span v-else>+</span>
            </button>
          </div>
        </div>

        <!-- 담은 여행지 -->
        <div class="body-section">
          <div v-if="spotsByDay.length > 1" class="day-tabs">
            <button
              v-for="group in spotsByDay"
              :key="group.day"
              :class="{ active: activeDay === group.day }"
              @click="activeDay = group.day"
            >
              DAY {{ group.day }}
            </button>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="section-label mb-0"><i class="bi bi-geo-alt me-1"></i>담은 여행지</div>
            <span class="badge bg-light text-dark shadow-sm fw-bold" style="font-size: 11px"
              >{{ spots.length }} / 15</span
            >
          </div>
          <div v-if="loading" class="d-flex flex-column gap-2">
            <div v-for="n in 3" :key="n" class="spot-item spot-item--skeleton">
              <SkeletonBox width="14px" height="20px" />
              <SkeletonBox width="28px" height="28px" radius="8px" />
              <div class="spot-info d-flex flex-column gap-1">
                <SkeletonBox width="70%" height="14px" />
                <SkeletonBox width="50%" height="12px" />
              </div>
            </div>
          </div>
          <div v-else-if="spots.length === 0" class="spots-empty">
            <i class="bi bi-map d-block mb-1" style="font-size: 22px"></i>
            검색 후 여행지를 담아보세요.
          </div>
          <template v-else>
            <template v-for="group in visibleDayGroups" :key="group.day">
              <div
                v-for="(spot, i) in group.items"
                :key="i"
                class="spot-item"
                draggable="true"
                :data-index="i"
                @dragstart="dragStart(i)"
                @dragover.prevent
                @drop="dropOn(i)"
                @dragend="dragEnd"
              >
                <i class="bi bi-grip-vertical drag-handle"></i>
                <div class="spot-number" :class="{ optimized: routeOptimized }">{{ i + 1 }}</div>
                <div class="spot-info">
                  <div v-if="spot.visitTime" class="s-time">{{ spot.visitTime }}</div>
                  <div class="s-name">{{ spot.title }}</div>
                  <div class="s-addr">{{ spot.addr1 }}</div>
                  <div v-if="spot.description" class="s-description">{{ spot.description }}</div>
                </div>
                <button class="btn-remove-spot" @click.stop="removeSpot(spot)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </template>
          </template>
        </div>

        <!-- 최적 경로 결과 -->
        <div v-if="routeResult" class="body-section">
          <div class="section-label"><i class="bi bi-signpost-split me-1"></i>최적 경로 결과</div>
          <div class="route-result-box">
            <div class="fw-bold text-primary mb-2">
              총 이동 거리 약 {{ routeResult.totalDist.toFixed(1) }} km
            </div>
            <ol class="mb-0 ps-4">
              <li
                v-for="(s, i) in routeResult.ordered"
                :key="i"
                style="padding: 3px 0; font-size: 13px"
              >
                {{ s.title }}
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div class="panel-footer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { loadKakaoMapSdk } from '@/utils/kakaoMap'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import { TOUR_REGIONS } from '@/constants/tourRegions'

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]
const MAX_SPOTS = 15

const route = useRoute()
const router = useRouter()
const scheduleId = Number(route.params.scheduleId)

const mapEl = ref<HTMLElement | null>(null)
let sdMap: any = null
let sdMarkerOverlays: any[] = []
let sdInfoOverlay: any = null
let sdPolyline: any = null
let sdVisibleMapSpots: any[] = []

const schedule = ref<any>(null)
const loading = ref(true)
const spots = ref<any[]>([])
const sigungus = ref<any[]>([])
const searchResults = ref<any[]>([])
// 검색 결과는 최대 20개만 노출한다 (템플릿에서 매 렌더마다 slice 하지 않도록 파생값으로 분리)
const visibleSearchResults = computed(() => searchResults.value.slice(0, 20))
const spotsByDay = computed(() => {
  const groups = new Map<number, any[]>()
  spots.value.forEach((spot) => {
    const day = spot.day || 1
    groups.set(day, [...(groups.get(day) || []), spot])
  })
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, items]) => ({
      day,
      items: items
        .map((item, index) => ({ item, index }))
        .sort((a, b) => compareDayItems(a.item, b.item, a.index, b.index))
        .map(({ item }) => item),
    }))
})
const activeDay = ref(1)
const visibleDayGroups = computed(() =>
  spotsByDay.value.filter((group) => group.day === activeDay.value),
)
const dayOptions = computed<number[]>(() => {
  const scheduleDays = createDayOptions(schedule.value?.startDate, schedule.value?.endDate)
  if (scheduleDays.length) return scheduleDays

  const spotDays = [...new Set(spots.value.map(normalizeDay))].sort(
    (first, second) => first - second,
  )
  return spotDays.length ? spotDays : [1]
})

function normalizeDay(spot: any) {
  return Number(spot.day) || 1
}
function normalizeOrderNum(spot: any) {
  const value = Number(spot.orderNum ?? spot.order_num)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
function createDayOptions(startDate?: string, endDate?: string) {
  if (!isValidScheduleDate(startDate) || !isValidScheduleDate(endDate)) return []

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const travelDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1

  if (!Number.isFinite(travelDays) || travelDays < 1) return []
  return Array.from({ length: travelDays }, (_, index) => index + 1)
}
function isValidScheduleDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}
function parseVisitMinutes(value?: string | null) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return Number.POSITIVE_INFINITY
  const hour = Number(match[1]),
    minute = Number(match[2])
  return Number.isFinite(hour) && Number.isFinite(minute) && hour < 24 && minute < 60
    ? hour * 60 + minute
    : Number.POSITIVE_INFINITY
}
function compareDayItems(first: any, second: any, firstIndex = 0, secondIndex = 0) {
  const timeDiff =
    parseVisitMinutes(first.visitTime ?? first.visit_time) -
    parseVisitMinutes(second.visitTime ?? second.visit_time)
  if (timeDiff !== 0) return timeDiff

  const orderDiff = normalizeOrderNum(first) - normalizeOrderNum(second)
  if (orderDiff !== 0) return orderDiff

  return firstIndex - secondIndex
}
function reorderDayItemsByTime(day: number) {
  const ordered = spots.value
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => normalizeDay(item) === day)
    .sort((a, b) => compareDayItems(a.item, b.item, a.index, b.index))
    .map(({ item }, index) => ({ ...item, day, orderNum: index }))
  let cursor = 0
  spots.value = spots.value.map((item) => (normalizeDay(item) === day ? ordered[cursor++] : item))
}
const spotKeyword = ref('')
const selectedSidoName = ref('')
const selectedAreaCode = ref('')
const selectedSigunguCode = ref('')
const selectedCategory = ref('')
const searching = ref(false)
const routeResult = ref<any>(null)
const routeOptimized = ref(false)
const mapLoadError = ref('')
const isAddModalOpen = ref(false)
const pendingTrip = ref<any>(null)
const addFormDay = ref(1)
const addFormVisitTime = ref('')
const addFormDescription = ref('')

const acList = ref<any[]>([])
const acActiveIndex = ref(-1)
let tripTrie: any = null
let currentTrips: any[] = []
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let dragSrcIndex = -1

// ── Trie ─────────────────────────────────────────────────────────────────
class TrieNode {
  children: Record<string, TrieNode> = {}
  isEnd = false
  data: any[] | null = null
}
class Trie {
  root = new TrieNode()
  insert(word: string, data: any) {
    let node = this.root
    for (const c of word) {
      if (!node.children[c]) node.children[c] = new TrieNode()
      node = node.children[c]
    }
    node.isEnd = true
    node.data = node.data ? [...node.data, data] : [data]
  }
  search(prefix: string, limit = 8): any[] {
    let node = this.root
    for (const c of prefix) {
      if (!node.children[c]) return []
      node = node.children[c]
    }
    const results: any[] = []
    this._dfs(node, prefix, results, limit)
    return results
  }
  _dfs(node: TrieNode, cur: string, results: any[], limit: number) {
    if (results.length >= limit) return
    if (node.isEnd) results.push({ word: cur, data: node.data })
    for (const c of Object.keys(node.children)) {
      if (results.length >= limit) return
      this._dfs(node.children[c], cur + c, results, limit)
    }
  }
}

// ── API helpers ───────────────────────────────────────────────────────────
async function apiGet(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/backend'
  const base = path.startsWith('http') ? path : baseUrl + path
  const res = await fetch(base, { credentials: 'include' })
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
async function fetchSigunguCodes(c: string) {
  try {
    const d = await apiGet('/attraction?action=sigungus&sidoCode=' + c)
    return d?.response?.body?.items?.item || []
  } catch {
    return []
  }
}
function normalizeSearchCode(value: unknown) {
  const code = String(value ?? '').trim()
  return /^\d+$/.test(code) ? code : ''
}
async function fetchTripList(sidoCode: string, sigunguCode: string, contentTypeId: string) {
  const params = new URLSearchParams({ action: 'search', sidoCode })
  if (sigunguCode) params.set('gugunCode', sigunguCode)
  if (contentTypeId) params.set('contentTypeId', contentTypeId)

  const response = await apiGet(`/attraction?${params.toString()}`)
  if (response?.response?.header?.resultCode !== '0000') return []

  const items = response?.response?.body?.items?.item
  if (!items) return []
  return Array.isArray(items) ? items : [items]
}
async function fetchByKeyword(kw: string) {
  try {
    const d = await apiGet('/attraction?action=keyword&keyword=' + encodeURIComponent(kw))
    if (d?.response?.header?.resultCode === '0000') {
      const it = d.response.body.items
      return !it || it === '' ? [] : it.item || []
    }
    return []
  } catch {
    return []
  }
}

// ── Korean utils ──────────────────────────────────────────────────────────
function getChoseong(s: string) {
  return [...s]
    .map((c) => {
      const code = c.charCodeAt(0)
      return code >= 0xac00 && code <= 0xd7a3
        ? CHOSEONG[Math.floor((code - 0xac00) / (21 * 28))]
        : c
    })
    .join('')
}
function isChoseongOnly(s: string) {
  return [...s].every((c) => CHOSEONG.includes(c))
}
function searchByChoseong(q: string) {
  return currentTrips.filter((t) => t.title && getChoseong(t.title).includes(q)).slice(0, 8)
}
function searchBySubstring(kw: string) {
  const l = kw.toLowerCase()
  return currentTrips.filter((t) => t.title?.toLowerCase().includes(l)).slice(0, 8)
}
function levenshtein(a: string[], b: string[]): number {
  const m = a.length,
    n = b.length
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) {
    dp[i] = [i]
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        i === 0
          ? j
          : a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  }
  return dp[m][n]
}
function searchFuzzy(kw: string) {
  if (!currentTrips.length || kw.length < 2) return []
  const kwC = [...kw],
    kLen = kwC.length
  return currentTrips
    .filter((t) => t.title)
    .map((t) => {
      const tC = [...t.title],
        tLen = tC.length
      let minDist = Infinity
      if (tLen < kLen) {
        minDist = levenshtein(kwC, tC)
      } else {
        for (let i = 0; i <= tLen - kLen; i++) {
          const d = levenshtein(kwC, tC.slice(i, i + kLen))
          if (d < minDist) minDist = d
          if (minDist === 0) break
        }
      }
      return { trip: t, score: 1 - minDist / kLen }
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.trip)
}
function escapeHtml(s: string) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function highlightSubstring(t: string, kw: string) {
  return escapeHtml(t).replace(
    new RegExp(escapeRegex(escapeHtml(kw)), 'gi'),
    (m) => `<mark>${m}</mark>`,
  )
}
function highlightChoseong(t: string, q: string) {
  const cs = getChoseong(t)
  const idx = cs.indexOf(q)
  if (idx === -1) return escapeHtml(t)
  return (
    escapeHtml(t.slice(0, idx)) +
    '<mark>' +
    escapeHtml(t.slice(idx, idx + q.length)) +
    '</mark>' +
    escapeHtml(t.slice(idx + q.length))
  )
}

function buildTrie(trips: any[]) {
  tripTrie = new Trie()
  currentTrips = trips || []
  currentTrips.forEach((t) => {
    if (t.title) tripTrie.insert(t.title, t)
  })
}

// ── Autocomplete ──────────────────────────────────────────────────────────
function onSpotKeywordInput() {
  const kw = spotKeyword.value.trim()
  acActiveIndex.value = -1
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!kw) {
    acList.value = []
    return
  }
  if (isChoseongOnly(kw)) {
    const res = currentTrips.length ? searchByChoseong(kw) : []
    acList.value = res.length
      ? res.map((t) => ({ ...t, highlighted: highlightChoseong(t.title, kw) }))
      : searchFuzzy(kw).map((t) => ({ ...t, highlighted: escapeHtml(t.title) }))
    return
  }
  if (currentTrips.length) {
    const seen = new Set<string>()
    const sugg: any[] = []
    tripTrie?.search(kw, 6).forEach((r: any) => {
      r.data?.forEach((t: any) => {
        if (!seen.has(t.title)) {
          seen.add(t.title)
          sugg.push({ ...t, highlighted: highlightSubstring(t.title, kw) })
        }
      })
    })
    searchBySubstring(kw).forEach((t) => {
      if (!seen.has(t.title)) {
        seen.add(t.title)
        sugg.push({ ...t, highlighted: highlightSubstring(t.title, kw) })
      }
    })
    if (sugg.length) {
      acList.value = sugg.slice(0, 8)
      return
    }
    acList.value = searchFuzzy(kw).map((t) => ({ ...t, highlighted: escapeHtml(t.title) }))
    return
  }
  debounceTimer = setTimeout(async () => {
    const trips = await fetchByKeyword(kw)
    acList.value = trips
      .slice(0, 8)
      .map((t: any) => ({ ...t, highlighted: highlightSubstring(t.title, kw) }))
  }, 300)
}
function onSpotKeydown(e: KeyboardEvent) {
  if (!acList.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    acActiveIndex.value = Math.min(acActiveIndex.value + 1, acList.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    acActiveIndex.value = Math.max(acActiveIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (acActiveIndex.value >= 0) selectAcItem(acList.value[acActiveIndex.value])
    else doSearch()
  } else if (e.key === 'Escape') acList.value = []
}
function selectAcItem(item: any) {
  spotKeyword.value = item.title
  acList.value = []
  searchResults.value = [item]
}

// ── Search & Spots ────────────────────────────────────────────────────────
async function onSpotAreaChange() {
  const region = TOUR_REGIONS.find((option) => option.areaCode === selectedAreaCode.value)
  selectedSidoName.value = region?.name ?? ''
  selectedSigunguCode.value = ''
  sigungus.value = selectedAreaCode.value ? await fetchSigunguCodes(selectedAreaCode.value) : []
  searchResults.value = []
}

async function doSearch() {
  const kw = spotKeyword.value.trim()
  const areaCode = normalizeSearchCode(selectedAreaCode.value)
  const sigunguCode = normalizeSearchCode(selectedSigunguCode.value)
  const contentTypeId = normalizeSearchCode(selectedCategory.value)
  const params = {
    sidoCode: areaCode || undefined,
    gugunCode: sigunguCode || undefined,
    contentTypeId: contentTypeId || undefined,
  }
  console.warn('[SCHEDULE_DETAIL_SEARCH_REQUEST]', {
    selectedAreaCode: areaCode,
    selectedSidoName: selectedSidoName.value,
    selectedSigunguCode: selectedSigunguCode.value,
    selectedCategory: selectedCategory.value,
    params,
  })
  if (!kw && !areaCode) {
    alert('장소명을 입력하거나 지역을 선택하세요.')
    return
  }
  searching.value = true
  acList.value = []
  try {
    const trips = kw
      ? await fetchByKeyword(kw)
      : await fetchTripList(areaCode, sigunguCode, contentTypeId)
    buildTrie(trips)
    searchResults.value = trips
  } finally {
    searching.value = false
  }
}

function isAdded(trip: any) {
  return spots.value.some(
    (s) =>
      (s.contentid && trip.contentid && s.contentid === String(trip.contentid)) ||
      s.title === trip.title,
  )
}

function openAddModal(trip: any) {
  pendingTrip.value = trip
  addFormDay.value = dayOptions.value.includes(activeDay.value)
    ? activeDay.value
    : (dayOptions.value[0] ?? 1)
  addFormVisitTime.value = ''
  addFormDescription.value = ''
  isAddModalOpen.value = true
}
function closeAddModal() {
  isAddModalOpen.value = false
  pendingTrip.value = null
  addFormVisitTime.value = ''
  addFormDescription.value = ''
}
function confirmAddTrip() {
  if (!pendingTrip.value) return
  const trip = pendingTrip.value
  const requestedDay = Number(addFormDay.value)
  const targetDay =
    Number.isFinite(requestedDay) && requestedDay > 0 ? requestedDay : (dayOptions.value[0] ?? 1)
  const dayItems = spots.value.filter((spot) => normalizeDay(spot) === targetDay)
  const orders = dayItems
    .map((spot) => Number(spot.orderNum ?? spot.order_num ?? -1))
    .filter(Number.isFinite)
  const orderNum = Math.max(-1, ...orders) + 1
  if (spots.value.length >= MAX_SPOTS) {
    alert(`최대 ${MAX_SPOTS}개까지 담을 수 있습니다.`)
    return
  }
  if (isAdded(trip)) {
    alert('이미 담은 여행지입니다.')
    return
  }
  const mapx = String(trip.mapx || trip.mapX || ''),
    mapy = String(trip.mapy || trip.mapY || '')
  if (!mapx || !mapy || mapx === '0' || mapy === '0') {
    alert('해당 장소의 좌표 정보가 없어 담을 수 없습니다.')
    return
  }
  spots.value.push({
    title: trip.title,
    addr1: trip.addr1 || '',
    mapx,
    mapy,
    firstimage: trip.firstimage || '',
    contentId: String(trip.contentid || trip.contentId || ''),
    contentid: String(trip.contentid || trip.contentId || ''),
    day: targetDay,
    orderNum,
    visitTime: addFormVisitTime.value.trim() || null,
    description: addFormDescription.value.trim() || null,
  })
  reorderDayItemsByTime(targetDay)
  activeDay.value = targetDay
  closeAddModal()
  syncSpots()
  redrawMarkers()
  routeResult.value = null
  routeOptimized.value = false
}

function removeSpot(spot: any) {
  const targetIndex = spots.value.findIndex((item) => item === spot)
  if (targetIndex < 0) return

  const removed = spots.value[targetIndex]
  spots.value.splice(targetIndex, 1)
  reorderDayItemsByTime(normalizeDay(removed))
  syncSpots()
  redrawMarkers()
  routeResult.value = null
  routeOptimized.value = false
}

async function syncSpots() {
  try {
    const items = spots.value.map((spot) => ({
      contentId: spot.contentId || spot.contentid || '',
      title: spot.title,
      addr1: spot.addr1 || '',
      mapx: spot.mapx || '',
      mapy: spot.mapy || '',
      firstimage: spot.firstimage || '',
      day: Number(spot.day) || 1,
      orderNum: Number.isFinite(Number(spot.orderNum)) ? Number(spot.orderNum) : 0,
      visitTime: spot.visitTime || null,
      description: spot.description || null,
    }))
    console.warn('[SCHEDULE_DETAIL_SYNC_ITEMS]', items)
    await api.post(`/schedule/${scheduleId}/items`, { items: JSON.stringify(items) })
  } catch (e) {
    console.error('동기화 실패', e)
  }
}

// ── Drag & Drop ───────────────────────────────────────────────────────────
function dragStart(i: number) {
  dragSrcIndex = i
}
function dropOn(targetIdx: number) {
  if (dragSrcIndex === targetIdx) return
  const moved = spots.value.splice(dragSrcIndex, 1)[0]
  spots.value.splice(targetIdx, 0, moved)
  syncSpots()
  redrawMarkers()
  routeResult.value = null
  routeOptimized.value = false
}
function dragEnd() {
  dragSrcIndex = -1
}

// ── Map ────────────────────────────────────────────────────────────────────
function clearMarkers() {
  sdMarkerOverlays.forEach(({ overlay }) => overlay.setMap(null))
  sdMarkerOverlays = []
  sdVisibleMapSpots = []
  if (sdInfoOverlay) sdInfoOverlay.setMap(null)
}
function clearPolyline() {
  if (sdPolyline) {
    sdPolyline.setMap(null)
    sdPolyline = null
  }
}

function redrawMarkers(optimized = false) {
  clearMarkers()
  clearPolyline()
  const daySpots = visibleDayGroups.value.flatMap((group) => group.items)
  if (!sdMap || !daySpots.length) return
  const mapSpots = daySpots.filter((spot) => {
    const lat = Number(spot.mapy)
    const lng = Number(spot.mapx)
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  })
  if (!mapSpots.length) return

  sdVisibleMapSpots = mapSpots
  const bounds = new (window as any).kakao.maps.LatLngBounds()
  const path: any[] = []
  mapSpots.forEach((spot, i) => {
    const lat = Number(spot.mapy),
      lng = Number(spot.mapx)
    if (!lat || !lng) return
    const position = new (window as any).kakao.maps.LatLng(lat, lng)
    bounds.extend(position)
    path.push(position)
    const cls = optimized ? 'optimized' : ''
    const content = `<div class="sd-pin" onclick="window._sdShowSpotInfo(${i})"><div class="sd-pin-circle ${cls}">${i + 1}</div><div class="sd-pin-tail ${cls}"></div></div>`
    const overlay = new (window as any).kakao.maps.CustomOverlay({
      position,
      content,
      yAnchor: 1.08,
      zIndex: 3,
    })
    overlay.setMap(sdMap)
    sdMarkerOverlays.push({ overlay, spot, position })
  })
  if (path.length > 1) {
    sdPolyline = new (window as any).kakao.maps.Polyline({
      path,
      strokeWeight: 3,
      strokeColor: '#2589f5',
      strokeOpacity: 0.55,
      strokeStyle: 'solid',
    })
    sdPolyline.setMap(sdMap)
  }
  sdMap.setBounds(bounds)
}

;(window as any)._sdShowSpotInfo = (idx: number) => {
  if (!sdInfoOverlay || !sdMap) return
  const spot = sdVisibleMapSpots[idx]
  if (!spot) return
  const position = new (window as any).kakao.maps.LatLng(Number(spot.mapy), Number(spot.mapx))
  sdInfoOverlay.setContent(
    `<div class="sd-info-popup"><div class="p-name">${escapeHtml(spot.title)}</div><div class="p-addr">${escapeHtml(spot.addr1)}</div></div>`,
  )
  sdInfoOverlay.setPosition(position)
  sdInfoOverlay.setMap(sdMap)
  sdMap.panTo(position)
}

watch(activeDay, () => redrawMarkers())

// ── TSP ────────────────────────────────────────────────────────────────────
// ── Init ───────────────────────────────────────────────────────────────────
function initMap() {
  sdMap = new (window as any).kakao.maps.Map(mapEl.value!, {
    center: new (window as any).kakao.maps.LatLng(36.5, 127.5),
    level: 7,
  })
  sdInfoOverlay = new (window as any).kakao.maps.CustomOverlay({
    clickable: true,
    zIndex: 5,
    yAnchor: 1.5,
  })
  ;(window as any).kakao.maps.event.addListener(sdMap, 'click', () => sdInfoOverlay?.setMap(null))
  setTimeout(() => sdMap.relayout(), 300)
  redrawMarkers()
}

function loadKakaoMap() {
  mapLoadError.value = ''
  loadKakaoMapSdk('services')
    .then(() => {
      if (mapEl.value) initMap()
    })
    .catch((error) => {
      console.error(error)
      mapLoadError.value =
        '지도를 불러오지 못했습니다. Kakao JavaScript 키와 localhost:5173 도메인 등록을 확인해주세요.'
    })
}

onMounted(async () => {
  if (!scheduleId) {
    alert('잘못된 접근입니다.')
    router.push('/schedule')
    return
  }
  try {
    const res = await api.get(`/schedule/${scheduleId}`)
    schedule.value = res.data
    spots.value = res.data.items || []
  } catch {
    alert('스케줄을 불러오지 못했습니다.')
    router.push('/schedule')
    return
  } finally {
    loading.value = false
  }
  loadKakaoMap()
})

onUnmounted(() => {
  // 지도 자원 정리
  if (sdPolyline) sdPolyline.setMap(null)
})
</script>

<style scoped>
#map-container {
  position: relative;
  height: calc(100vh - 64px);
  width: 100%;
}
.add-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
}
.add-modal-card {
  width: 420px;
  max-width: calc(100vw - 32px);
  border-radius: 18px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.3);
}
.add-modal-card h6 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
}
.add-trip-name {
  margin: 0;
  color: #1e293b;
  font-weight: 700;
}
.add-trip-address {
  margin: 4px 0 18px;
  color: #64748b;
  font-size: 13px;
}
.add-modal-card label {
  display: block;
  margin: 14px 0 0;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}
.add-modal-card input,
.add-modal-card select,
.add-modal-card textarea {
  width: 100%;
  margin-top: 6px;
  border: 1px solid #dbe3ec;
  border-radius: 9px;
  padding: 10px;
  font: inherit;
}
.add-modal-card textarea {
  min-height: 92px;
  resize: vertical;
}
.add-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
#sd-map {
  width: 100%;
  height: 100%;
  background-color: #eaf0f2;
}
.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: var(--et-gray-50);
  color: var(--et-gray-700);
  font-weight: 600;
  z-index: 1;
}
.side-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 400px;
  max-height: calc(100% - 32px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--shadow-lg);
}
.panel-header {
  background: white;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}
.panel-body {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  background: #fff;
}
.panel-footer {
  background: white;
  padding: 12px 14px;
  border-top: 1px solid var(--border-default);
  flex-shrink: 0;
}
.body-section {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-default);
}
.body-section:last-child {
  border-bottom: none;
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--et-gray-600);
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}
.search-result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f8f8f8;
}
.search-result-item:hover {
  background: var(--et-gray-50);
}
.search-result-item.added {
  opacity: 0.5;
  cursor: not-allowed;
}
.result-thumb {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 10px;
  flex-shrink: 0;
  background: #e9ecef;
}
.result-info {
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
}
.r-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.r-addr {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-add-spot {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: white;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
}
.btn-add-spot:hover {
  border-color: var(--primary-color);
  background: var(--et-blue-wash);
  color: var(--primary-color);
}
.btn-add-spot.added {
  border-color: #94a3b8;
  color: #94a3b8;
  cursor: default;
}
.spot-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 6px;
  background: white;
  cursor: grab;
  position: relative;
}
.spot-item:active {
  cursor: grabbing;
}
.spot-item--skeleton {
  gap: 8px;
  cursor: default;
  margin-bottom: 0;
}
.drag-handle {
  color: #cbd5e1;
  margin-right: 8px;
  cursor: grab;
}
.spot-number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
}
.spot-number.optimized {
  background: var(--primary-color);
}
.spot-info {
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
}
.s-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.s-addr {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.btn-remove-spot {
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 4px;
  flex-shrink: 0;
  transition: color 0.15s;
  line-height: 1;
}
.btn-remove-spot:hover {
  color: #ef4444;
}
.spots-empty {
  text-align: center;
  padding: 18px;
  color: #94a3b8;
  font-size: 13px;
}
.route-result-box {
  background: var(--et-blue-wash);
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid var(--et-blue-100);
}
.panel-body::-webkit-scrollbar {
  width: 4px;
}
.panel-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.ac-item {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
}
.ac-item:hover,
.ac-item.active {
  background: #f0f7ff;
}
.ac-addr {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
:deep(mark) {
  background: none;
  color: var(--primary-color);
  font-weight: 700;
  padding: 0;
}
:deep(.sd-pin) {
  cursor: pointer;
  user-select: none;
  text-align: center;
  line-height: 1;
}
:deep(.sd-pin-circle) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
  margin: 0 auto;
}
:deep(.sd-pin-circle.optimized) {
  background: var(--primary-color);
}
:deep(.sd-pin-tail) {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid var(--primary-color);
  margin: 0 auto;
}
:deep(.sd-pin-tail.optimized) {
  border-top-color: var(--primary-color);
}
:deep(.sd-info-popup) {
  background: white;
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  max-width: 220px;
  position: relative;
}
:deep(.sd-info-popup .p-name) {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 2px;
}
:deep(.sd-info-popup .p-addr) {
  color: #64748b;
  font-size: 11px;
}
:deep(.sd-info-popup::after) {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid white;
}
@media (max-width: 767.98px) {
  .side-panel {
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100% - 24px);
  }
}
</style>
