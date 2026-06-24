<template>
  <div id="map-container">
    <AiPlanAssistant
      v-if="!aiPlan"
      :candidates="tripList"
      :initial-region="selectedRegionName"
      :initial-sigungu-code="selectedSigungu"
      :initial-sigungu-name="selectedSigunguName"
      :sigungu-options="sigungus"
      :is-candidates-loading="isAiCandidateLoading"
      @plan-created="setAiPlan"
      @region-selected="handleAiRegionSelected"
    />
    <div id="map" ref="mapEl"></div>
    <div v-if="mapLoadError" class="map-error">{{ mapLoadError }}</div>

    <div v-if="!aiPlan" class="side-panel">
      <div class="search-header">
        <h5 class="fw-bold mb-3">
          <i class="bi bi-geo-alt-fill text-primary me-2"></i>관광지 검색
        </h5>

        <div id="autocomplete-section" class="position-relative">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-light border-0">
              <i class="bi bi-search text-primary"></i>
            </span>
            <input
              v-model="keyword"
              type="text"
              class="form-control border-0 bg-light"
              placeholder="장소명 검색"
              autocomplete="off"
              @input="onKeywordInput"
              @keydown="onKeydown"
            />
            <button
              v-if="keyword"
              type="button"
              class="input-group-text bg-light border-0 px-2"
              @click="clearKeyword"
            >
              <i class="bi bi-x text-muted" style="font-size: 16px"></i>
            </button>
          </div>
          <ul
            v-if="acList.length > 0"
            id="autocomplete-list"
            class="list-group position-absolute w-100 shadow"
            style="
              z-index: 999;
              border-radius: 8px;
              overflow-y: auto;
              max-height: 280px;
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

        <div class="region-divider">지역으로 범위 지정</div>

        <div class="row g-2">
          <div class="col-12">
            <select
              v-model="selectedArea"
              class="form-select border-0 shadow-sm bg-light"
              @change="onAreaChange"
            >
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
              v-model="selectedSigungu"
              class="form-select border-0 shadow-sm bg-light"
              @change="onSigunguChange"
            >
              <option value="">시/군/구 (법정동) 선택</option>
              <option v-for="s in sigungus" :key="s.code" :value="String(s.code)">
                {{ s.name }}
              </option>
            </select>
          </div>
          <div class="col-12">
            <select v-model="selectedContentType" class="form-select border-0 shadow-sm">
              <option value="0">모든 유형 카테고리</option>
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
          <div class="col-9">
            <button class="btn btn-custom w-100" :disabled="searching" @click="handleSearch">
              <span v-if="searching" class="spinner-border spinner-border-sm me-1"></span>
              조회
            </button>
          </div>
          <div class="col-3">
            <button class="btn btn-outline-secondary w-100" title="초기화" @click="resetSearch">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <div id="trip-list" class="result-list">
        <template v-if="searchState === 'idle'">
          <div class="text-center p-5 text-muted">
            <i class="bi bi-search display-4 d-block mb-3"></i>
            조건을 선택하고 조회를 눌러주세요.
          </div>
        </template>
        <template v-else-if="searchState === 'loading'">
          <div v-for="n in 7" :key="n" class="result-item result-item--skeleton">
            <SkeletonBox width="72px" height="72px" radius="8px" />
            <div class="d-flex flex-column justify-content-center w-100 ms-3 gap-2">
              <SkeletonBox width="70%" height="16px" />
              <SkeletonBox width="50%" height="13px" />
            </div>
          </div>
        </template>
        <template v-else-if="searchState === 'empty'">
          <div class="text-center p-5 text-muted">
            <i class="bi bi-exclamation-circle display-4 d-block mb-3"></i
            >{{ searchErrorMessage || '결과가 없습니다.' }}
          </div>
        </template>
        <template v-else>
          <p v-if="searchErrorMessage" class="text-center small text-muted p-3 mb-0">
            {{ searchErrorMessage }}
          </p>
          <div
            v-for="(trip, i) in tripList"
            :key="i"
            class="result-item"
            @click="focusTripOnMap(trip)"
          >
            <img
              :src="
                trip.firstimage || 'https://placehold.jp/24/cccccc/ffffff/80x80.png?text=No+Image'
              "
              class="result-img"
              @error="
                ($event.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No'
              "
            />
            <div class="d-flex flex-column justify-content-center w-100 overflow-hidden">
              <h6 class="fw-bold mb-1 text-truncate">{{ trip.title }}</h6>
              <p class="text-muted small mb-0 text-truncate">{{ trip.addr1 || '' }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
    <aside v-else class="side-panel ai-timeline-panel">
      <div class="search-header">
        <h5 class="fw-bold mb-1"><i class="bi bi-stars text-primary me-2"></i>AI 일정</h5>
        <p class="ai-plan-summary">{{ aiPlan.summary }}</p>
        <div class="ai-day-tabs">
          <button
            v-for="day in aiPlan.days"
            :key="day.day"
            type="button"
            :class="{ active: activeAiDay === day.day }"
            @click="activeAiDay = day.day"
          >
            DAY {{ day.day }}
          </button>
        </div>
      </div>
      <div class="result-list ai-timeline-list">
        <article
          v-for="(item, index) in activeAiDayItems"
          :id="`ai-place-${item.contentId}`"
          :key="`${item.time}-${item.title}`"
          class="ai-timeline-card"
          :class="{ active: selectedAiPlace === item.contentId }"
          @click="selectAiPlace(item)"
        >
          <span class="ai-order">{{ Number(index) + 1 }}</span>
          <div class="ai-card-content">
            <time>{{ item.time }}</time>
            <h6>{{ item.title }}</h6>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </div>
      <button
        class="btn btn-primary w-100 mt-3"
        :disabled="isSavingAiPlan"
        @click="handleSaveAiPlan"
      >
        {{ isSavingAiPlan ? '일정 저장 중...' : '이 일정 저장하기' }}
      </button>
      <button class="btn btn-outline-secondary w-100 mt-2" @click="resetAiPlan">
        다른 일정 추천받기
      </button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadKakaoMapSdk } from '@/utils/kakaoMap'
import AiPlanAssistant from '@/components/ai/AiPlanAssistant.vue'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import { saveAiPlan } from '@/composables/useAiPlanSave'
import { DEFAULT_TOUR_REGION, TOUR_REGIONS } from '@/constants/tourRegions'

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

const route = useRoute()
const router = useRouter()
const mapEl = ref<HTMLElement | null>(null)
let map: any = null
let markers: any[] = []
let aiMarkers: any[] = []
let customOverlay: any = null
let aiPolyline: any = null
let loadedAreaCode = '0'
let loadedSigunguCode = ''
let loadedAiTheme = ''

const AI_THEME_CONTENT_TYPES: Record<string, string[]> = {
  맛집: ['39'],
  '관광·명소': ['12', '25'],
  '문화·역사': ['14', '12'],
  '자연·힐링': ['12', '25'],
  '레포츠·액티비티': ['28'],
  쇼핑: ['38'],
  '축제·공연': ['15'],
  '카페·핫플': ['39', '12'],
}
const AI_THEME_MIN_CANDIDATES = 12

const keyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')
const selectedSidoName = ref<string>(DEFAULT_TOUR_REGION.name)
const selectedArea = ref<string>(DEFAULT_TOUR_REGION.areaCode)
const selectedSigungu = ref('')
const selectedSigunguName = ref('')
const selectedContentType = ref(
  typeof route.query.contentType === 'string' ? route.query.contentType : '0',
)
const sigungus = ref<any[]>([])
const tripList = ref<any[]>([])
const searching = ref(false)
const searchState = ref<'idle' | 'loading' | 'empty' | 'results'>('idle')
const searchErrorMessage = ref('')
const mapLoadError = ref('')
const aiPlan = ref<any | null>(null)
const activeAiDay = ref(1)
const activeAiDayItems = computed(
  () => aiPlan.value?.days.find((day: any) => day.day === activeAiDay.value)?.items ?? [],
)
const selectedAiPlace = ref<string | null>(null)
const isSavingAiPlan = ref(false)
const isAiCandidateLoading = ref(false)
const isInitializingRegion = ref(false)
const hasInitializedRegion = ref(false)
const selectedRegionName = computed(() => selectedSidoName.value || DEFAULT_TOUR_REGION.name)

const acList = ref<any[]>([])
const acActiveIndex = ref(-1)
let tripTrie: any = null
let currentTrips: any[] = []
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// ── Trie ────────────────────────────────────────────────────────────────
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

// ── Kakao API helpers ────────────────────────────────────────────────────
async function apiGet(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/backend'
  const base = path.startsWith('http') ? path : baseUrl + path
  const res = await fetch(base, { credentials: 'include' })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function fetchSigunguCodes(areaCode: string) {
  try {
    const d = await apiGet('/attraction?action=sigungus&sidoCode=' + areaCode)
    return d?.response?.body?.items?.item || []
  } catch {
    return []
  }
}
function normalizeCode(value: unknown) {
  const code = String(value ?? '').trim()
  return /^\d+$/.test(code) && code !== '0' ? code : ''
}

async function fetchTripList(areaCode: string, sigunguCode: string, contentTypeId: string) {
  const params = new URLSearchParams({ action: 'search', sidoCode: areaCode })
  if (sigunguCode) params.set('gugunCode', sigunguCode)
  if (contentTypeId) params.set('contentTypeId', contentTypeId)

  const response = await apiGet(`/attraction?${params.toString()}`)
  const resultCode = response?.response?.header?.resultCode
  if (resultCode !== '0000') {
    throw new Error(response?.response?.header?.resultMsg ?? 'TourAPI 지역 조회에 실패했습니다.')
  }

  const rawItems = response?.response?.body?.items?.item
  if (!rawItems) return []
  return Array.isArray(rawItems) ? rawItems : [rawItems]
}

function mergeUniqueTrips(target: any[], source: any[]) {
  const known = new Set(
    target.map((item) => String(item.contentid ?? item.contentId ?? item.title)),
  )
  source.forEach((item) => {
    const key = String(item.contentid ?? item.contentId ?? item.title)
    if (!known.has(key)) {
      known.add(key)
      target.push(item)
    }
  })
}

async function fetchAiThemeCandidates(areaCode: string, sigunguCode: string, theme: string) {
  const candidates: any[] = []
  const preferredTypes = AI_THEME_CONTENT_TYPES[theme] ?? []
  for (const contentTypeId of preferredTypes) {
    const themedTrips = await fetchTripList(areaCode, sigunguCode, contentTypeId)
    mergeUniqueTrips(candidates, themedTrips.slice(0, 20))
  }
  if (candidates.length < AI_THEME_MIN_CANDIDATES) {
    mergeUniqueTrips(candidates, await fetchTripList(areaCode, sigunguCode, ''))
  }
  return candidates.slice(0, 60)
}
async function fetchTripsByKeyword(kw: string) {
  try {
    const d = await apiGet('/attraction?action=keyword&keyword=' + encodeURIComponent(kw.trim()))
    if (d?.response?.header?.resultCode === '0000') {
      const items = d.response.body.items
      if (!items || items === '') return []
      return items.item || []
    }
    return []
  } catch {
    return []
  }
}

// ── Korean utils ─────────────────────────────────────────────────────────
function getChoseong(str: string) {
  return [...str]
    .map((c) => {
      const code = c.charCodeAt(0)
      return code >= 0xac00 && code <= 0xd7a3
        ? CHOSEONG[Math.floor((code - 0xac00) / (21 * 28))]
        : c
    })
    .join('')
}
function isChoseongOnly(str: string) {
  return [...str].every((c) => CHOSEONG.includes(c))
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
  const kwChars = [...kw],
    kLen = kwChars.length
  return currentTrips
    .filter((t) => t.title)
    .map((trip) => {
      const tChars = [...trip.title],
        tLen = tChars.length
      let minDist = Infinity
      if (tLen < kLen) {
        minDist = levenshtein(kwChars, tChars)
      } else {
        for (let i = 0; i <= tLen - kLen; i++) {
          const d = levenshtein(kwChars, tChars.slice(i, i + kLen))
          if (d < minDist) minDist = d
          if (minDist === 0) break
        }
      }
      return { trip, score: 1 - minDist / kLen }
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score || a.trip.title.length - b.trip.title.length)
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
function highlightSubstring(title: string, kw: string) {
  return escapeHtml(title).replace(
    new RegExp(escapeRegex(escapeHtml(kw)), 'gi'),
    (m) => `<mark>${m}</mark>`,
  )
}
function highlightChoseong(title: string, q: string) {
  const cs = getChoseong(title)
  const idx = cs.indexOf(q)
  if (idx === -1) return escapeHtml(title)
  return (
    escapeHtml(title.slice(0, idx)) +
    '<mark>' +
    escapeHtml(title.slice(idx, idx + q.length)) +
    '</mark>' +
    escapeHtml(title.slice(idx + q.length))
  )
}

// ── Autocomplete ─────────────────────────────────────────────────────────
function onKeywordInput() {
  const kw = keyword.value.trim()
  acActiveIndex.value = -1
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!kw) {
    acList.value = []
    return
  }

  if (isChoseongOnly(kw)) {
    const res = currentTrips.length ? searchByChoseong(kw) : []
    if (res.length) {
      acList.value = res.map((t) => ({ ...t, highlighted: highlightChoseong(t.title, kw) }))
    } else {
      const fuzzy = searchFuzzy(kw)
      acList.value = fuzzy.map((t) => ({ ...t, highlighted: escapeHtml(t.title) }))
    }
    return
  }

  if (currentTrips.length) {
    const seen = new Set<string>()
    const suggestions: any[] = []
    tripTrie?.search(kw, 6).forEach((r: any) => {
      seen.add(r.word)
      r.data?.forEach((t: any) => {
        if (!seen.has(t.title)) {
          seen.add(t.title)
          suggestions.push({
            ...t,
            highlighted: highlightSubstring(t.title, kw),
            matchType: 'prefix',
          })
        }
      })
    })
    searchBySubstring(kw).forEach((t) => {
      if (!seen.has(t.title)) {
        seen.add(t.title)
        suggestions.push({
          ...t,
          highlighted: highlightSubstring(t.title, kw),
          matchType: 'substring',
        })
      }
    })
    if (suggestions.length) {
      acList.value = suggestions.slice(0, 8)
      return
    }
    const fuzzy = searchFuzzy(kw)
    acList.value = fuzzy.map((t) => ({ ...t, highlighted: escapeHtml(t.title) }))
    return
  }

  acList.value = [{ title: '검색 중...', highlighted: '검색 중...', addr1: '', _loading: true }]
  debounceTimer = setTimeout(async () => {
    const trips = await fetchTripsByKeyword(kw)
    acList.value = trips
      .slice(0, 8)
      .map((t: any) => ({ ...t, highlighted: highlightSubstring(t.title, kw) }))
  }, 300)
}

function onKeydown(e: KeyboardEvent) {
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
  } else if (e.key === 'Escape') {
    acList.value = []
  }
}

function selectAcItem(item: any) {
  keyword.value = item.title
  acList.value = []
  focusTripOnMap(item)
}
function clearKeyword() {
  keyword.value = ''
  acList.value = []
}

// ── Map & Search ──────────────────────────────────────────────────────────
function buildTrie(trips: any[]) {
  tripTrie = new Trie()
  currentTrips = trips || []
  currentTrips.forEach((t) => {
    if (t.title) tripTrie.insert(t.title, t)
  })
  keyword.value = ''
  acList.value = []
}

async function onAreaChange() {
  const region = TOUR_REGIONS.find((option) => option.areaCode === String(selectedArea.value))
  selectedSidoName.value = region?.name ?? ''
  selectedSigungu.value = ''
  selectedSigunguName.value = ''
  sigungus.value = []
  if (selectedArea.value !== '0') sigungus.value = await fetchSigunguCodes(selectedArea.value)
}

function onSigunguChange() {
  selectedSigunguName.value =
    sigungus.value.find((option) => String(option.code) === selectedSigungu.value)?.name ?? ''
}

async function handleSearch() {
  const areaCode = String(selectedArea.value ?? '').trim()
  if (!areaCode || areaCode === '0') {
    await applyRegion(DEFAULT_TOUR_REGION.name)
    return
  }

  const sigunguCode = normalizeCode(selectedSigungu.value)
  const contentTypeId = normalizeCode(selectedContentType.value)
  const params = {
    sidoCode: areaCode,
    gugunCode: sigunguCode || undefined,
    contentTypeId: contentTypeId || undefined,
  }
  console.warn('[TRIP_SEARCH_REQUEST]', {
    selectedSidoName: selectedSidoName.value,
    selectedAreaCode: areaCode,
    selectedSigungu: selectedSigungu.value,
    selectedCategory: selectedContentType.value,
    keyword: keyword.value.trim(),
    params,
  })

  if (!TOUR_REGIONS.some((region) => region.areaCode === areaCode)) {
    searchErrorMessage.value = '시/도를 선택해주세요.'
    searchState.value = 'idle'
    return
  }

  searching.value = true
  searchState.value = 'loading'
  searchErrorMessage.value = ''
  try {
    const trips = await fetchTripList(areaCode, sigunguCode, contentTypeId)
    makeListAndMarkers(trips)
    loadedAreaCode = areaCode
    loadedSigunguCode = sigunguCode
    loadedAiTheme = ''
  } catch (error) {
    console.warn('[TRIP_SEARCH_ERROR]', { params, error })
    clearSearchMarkers()
    searchErrorMessage.value = '관광지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    searchState.value = 'empty'
  } finally {
    searching.value = false
  }
}

async function handleAiRegionSelected(selection: {
  regionName: string
  sigunguCode?: string
  sigunguName?: string
  theme: string
  pace: string
}) {
  const applied = await applyRegion(selection.regionName, {
    sigunguCode: selection.sigunguCode,
    sigunguName: selection.sigunguName,
    theme: selection.theme,
    skipIfLoaded: true,
  })
  if (!applied) {
    alert('선택한 지역의 관광지 정보를 찾지 못했습니다. 다른 지역을 선택해주세요.')
  }
}

async function applyRegion(
  regionName: string,
  { sigunguCode = '', sigunguName = '', theme = '', skipIfLoaded = false } = {},
) {
  const region = TOUR_REGIONS.find((option) => option.name === regionName)
  if (!region) return false

  const normalizedSigunguCode = normalizeCode(sigunguCode)
  const hasCurrentRegionCandidates =
    selectedArea.value === region.areaCode &&
    loadedAreaCode === region.areaCode &&
    loadedSigunguCode === normalizedSigunguCode &&
    loadedAiTheme === theme &&
    tripList.value.length > 0
  if (skipIfLoaded && hasCurrentRegionCandidates) return true

  console.warn('[TRIP_REGION_APPLY]', {
    regionName: region.name,
    areaCode: region.areaCode,
    sigunguCode: normalizedSigunguCode || undefined,
    theme: theme || undefined,
    fetch: true,
  })
  selectedSidoName.value = region.name
  selectedArea.value = region.areaCode
  selectedSigungu.value = ''
  selectedSigunguName.value = ''
  sigungus.value = []
  clearSearchMarkers()
  tripList.value = []
  searchState.value = 'loading'
  searchErrorMessage.value = ''
  loadedAreaCode = '0'

  isAiCandidateLoading.value = true
  try {
    await onAreaChange()
    if (normalizedSigunguCode) {
      selectedSigungu.value = normalizedSigunguCode
      selectedSigunguName.value =
        sigunguName ||
        sigungus.value.find((option) => String(option.code) === normalizedSigunguCode)?.name ||
        ''
    }
    if (theme) {
      const trips = await fetchAiThemeCandidates(region.areaCode, normalizedSigunguCode, theme)
      makeListAndMarkers(trips)
      loadedAreaCode = region.areaCode
      loadedSigunguCode = normalizedSigunguCode
      loadedAiTheme = theme
    } else {
      await handleSearch()
    }
  } finally {
    isAiCandidateLoading.value = false
  }
  return true
}

function clearSearchMarkers() {
  markers.forEach((marker) => marker.setMap(null))
  markers = []
  if (customOverlay) customOverlay.setMap(null)
}

function getTripCoordinates(trip: any) {
  const rawLatitude = trip?.mapy ?? trip?.mapY
  const rawLongitude = trip?.mapx ?? trip?.mapX
  if (
    rawLatitude === null ||
    rawLatitude === undefined ||
    rawLongitude === null ||
    rawLongitude === undefined
  ) {
    console.warn('[TRIP_INVALID_COORD]', {
      title: trip?.title,
      mapx: rawLongitude,
      mapy: rawLatitude,
      lat: null,
      lng: null,
    })
    return null
  }
  if (!String(rawLatitude).trim() || !String(rawLongitude).trim()) {
    console.warn('[TRIP_INVALID_COORD]', {
      title: trip?.title,
      mapx: rawLongitude,
      mapy: rawLatitude,
      lat: null,
      lng: null,
    })
    return null
  }

  const lat = Number(rawLatitude)
  const lng = Number(rawLongitude)
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < 33 ||
    lat > 39 ||
    lng < 124 ||
    lng > 132
  ) {
    console.warn('[TRIP_INVALID_COORD]', {
      title: trip?.title,
      mapx: rawLongitude,
      mapy: rawLatitude,
      lat,
      lng,
    })
    return null
  }

  return { lat, lng }
}

function makeListAndMarkers(trips: any[]) {
  clearSearchMarkers()
  if (!trips || trips.length === 0) {
    tripList.value = []
    searchState.value = 'empty'
    return
  }

  tripList.value = trips
  searchState.value = 'results'
  if (!map) {
    buildTrie(trips)
    return
  }

  const validCoords: Array<{ trip: any; lat: number; lng: number; position: any }> = []
  trips.forEach((trip) => {
    const coordinates = getTripCoordinates(trip)
    if (!coordinates) return

    const position = new (window as any).kakao.maps.LatLng(coordinates.lat, coordinates.lng)
    validCoords.push({ trip, ...coordinates, position })
    const marker = new (window as any).kakao.maps.Marker({ position, map, title: trip.title })
    markers.push(marker)
    ;(window as any).kakao.maps.event.addListener(marker, 'click', () =>
      displayOverlay(marker, trip.title),
    )
  })

  console.warn(
    '[TRIP_VALID_COORDS]',
    validCoords.map(({ trip, lat, lng }) => ({ title: trip.title, lat, lng })),
  )
  console.warn('[TRIP_SET_BOUNDS_COUNT]', validCoords.length)
  if (validCoords.length === 1) {
    map.relayout()
    map.setCenter(validCoords[0].position)
    map.setLevel(5)
  } else if (validCoords.length > 1) {
    const bounds = new (window as any).kakao.maps.LatLngBounds()
    validCoords.forEach(({ position }) => bounds.extend(position))
    map.relayout()
    map.setBounds(bounds)
  } else {
    searchErrorMessage.value = '검색 결과에 지도에 표시할 수 있는 좌표가 없습니다.'
  }
  buildTrie(trips)
}

function focusTripOnMap(trip: any) {
  if (!map) return
  const coordinates = getTripCoordinates(trip)
  if (!coordinates) return

  const position = new (window as any).kakao.maps.LatLng(coordinates.lat, coordinates.lng)
  map.panTo(position)
  map.setLevel(4)
  let marker = markers.find((m) => m.getTitle() === trip.title)
  if (!marker) {
    marker = new (window as any).kakao.maps.Marker({ position, map, title: trip.title })
    markers.push(marker)
  }
  displayOverlay(marker, trip.title)
}

function showAiRoute(plan: any) {
  const selected = (plan.places || []).filter((place: any) => place.day === activeAiDay.value)
  if (!map) return
  if (customOverlay) customOverlay.setMap(null)
  aiMarkers.forEach((marker) => marker.setMap(null))
  aiMarkers = []
  if (aiPolyline) aiPolyline.setMap(null)
  if (selected.length === 0) return
  const validSelected: Array<{ trip: any; coordinates: { lat: number; lng: number } }> = []
  selected.forEach((trip: any) => {
    const coordinates = getTripCoordinates(trip)
    if (coordinates) validSelected.push({ trip, coordinates })
  })
  if (validSelected.length === 0) return

  const path = validSelected.map(({ trip, coordinates }, index) => {
    const position = new (window as any).kakao.maps.LatLng(coordinates.lat, coordinates.lng)
    const markerElement = document.createElement('button')
    markerElement.type = 'button'
    markerElement.className = `ai-route-marker ${selectedAiPlace.value === trip.contentId ? 'selected' : ''}`
    markerElement.innerHTML = `<span>${index + 1}</span>`
    markerElement.addEventListener('click', () => {
      const dayItem = activeAiDayItems.value.find((item: any) => item.contentId === trip.contentId)
      if (dayItem) selectAiPlace(dayItem)
      requestAnimationFrame(() =>
        document
          .getElementById(`ai-place-${trip.contentId}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      )
    })
    const marker = new (window as any).kakao.maps.CustomOverlay({
      position,
      map,
      yAnchor: 1,
      content: markerElement,
    })
    aiMarkers.push(marker)
    return position
  })
  if (path.length > 1) {
    aiPolyline = new (window as any).kakao.maps.Polyline({
      path,
      strokeWeight: 3,
      strokeColor: '#2377b8',
      strokeOpacity: 0.55,
    })
    aiPolyline.setMap(map)
    const bounds = new (window as any).kakao.maps.LatLngBounds()
    path.forEach((position: any) => bounds.extend(position))
    map.relayout()
    map.setBounds(bounds)
  } else {
    map.relayout()
    map.setCenter(path[0])
    map.setLevel(5)
  }
}

function setAiPlan(plan: any) {
  aiPlan.value = plan
  activeAiDay.value = plan.days?.[0]?.day ?? 1
  selectedAiPlace.value = plan.days?.[0]?.items?.[0]?.contentId ?? null
  markers.forEach((marker) => marker.setMap(null))
  markers = []
  showAiRoute(plan)
}

async function handleSaveAiPlan() {
  if (!aiPlan.value || isSavingAiPlan.value) return
  isSavingAiPlan.value = true
  try {
    await router.push(`/schedule-detail/${await saveAiPlan(aiPlan.value, '', '')}`)
  } catch (error: any) {
    alert(error.message || '일정을 저장하지 못했습니다.')
  } finally {
    isSavingAiPlan.value = false
  }
}

function resetAiPlan() {
  aiPlan.value = null
  activeAiDay.value = 1
  selectedAiPlace.value = null
  aiMarkers.forEach((marker) => marker.setMap(null))
  aiMarkers = []
  if (aiPolyline) aiPolyline.setMap(null)
  aiPolyline = null
  if (customOverlay) customOverlay.setMap(null)
}

watch(activeAiDay, () => {
  selectedAiPlace.value = activeAiDayItems.value[0]?.contentId ?? null
  if (aiPlan.value) showAiRoute(aiPlan.value)
})

function selectAiPlace(item: any) {
  selectedAiPlace.value = item.contentId
  if (!aiPlan.value) return
  showAiRoute(aiPlan.value)
  const place = aiPlan.value.places?.find((value: any) => value.contentId === item.contentId)
  if (place && customOverlay && map) {
    const coordinates = getTripCoordinates(place)
    if (!coordinates) return
    const position = new (window as any).kakao.maps.LatLng(coordinates.lat, coordinates.lng)
    customOverlay.setContent(
      `<div class="customoverlay"><span class="title">${escapeHtml(place.title)}</span></div>`,
    )
    customOverlay.setPosition(position)
    customOverlay.setMap(map)
    map.panTo(position)
  }
}

function displayOverlay(marker: any, title: string) {
  const content = `<div class="customoverlay"><a href="https://map.kakao.com/link/to/${title},${marker.getPosition().getLat()},${marker.getPosition().getLng()}" target="_blank"><span class="title">${title}</span></a></div>`
  customOverlay.setContent(content)
  customOverlay.setPosition(marker.getPosition())
  customOverlay.setMap(map)
}

function resetSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  keyword.value = ''
  acList.value = []
  selectedSidoName.value = ''
  selectedArea.value = '0'
  selectedSigungu.value = ''
  selectedSigunguName.value = ''
  selectedContentType.value = '0'
  sigungus.value = []
  clearSearchMarkers()
  tripList.value = []
  searchState.value = 'idle'
  loadedAreaCode = '0'
  loadedSigunguCode = ''
  loadedAiTheme = ''
  tripTrie = null
  currentTrips = []
  if (map) {
    map.setCenter(new (window as any).kakao.maps.LatLng(37.5012743, 127.039585))
    map.setLevel(7)
  }
}

function initMap() {
  customOverlay = new (window as any).kakao.maps.CustomOverlay({
    clickable: true,
    xAnchor: 0.5,
    yAnchor: 1,
    zIndex: 3,
  })
  map = new (window as any).kakao.maps.Map(mapEl.value!, {
    center: new (window as any).kakao.maps.LatLng(37.5012743, 127.039585),
    level: 5,
  })
  setTimeout(() => {
    map.relayout()
    if (tripList.value.length > 0) {
      makeListAndMarkers(tripList.value)
    } else {
      map.setCenter(new (window as any).kakao.maps.LatLng(37.5012743, 127.039585))
    }
  }, 300)
}

async function loadKakaoMap() {
  mapLoadError.value = ''
  try {
    await loadKakaoMapSdk('services,clusterer')
    if (mapEl.value) initMap()
  } catch (error) {
    console.error(error)
    mapLoadError.value =
      '지도를 불러오지 못했습니다. Kakao JavaScript 키와 localhost:5173 도메인 등록을 확인해주세요.'
  }
}

function normalizeRegionName(value?: string | null) {
  if (!value) return null
  const normalized = value.trim()
  const directMatch = TOUR_REGIONS.find((region) => region.name === normalized)
  if (directMatch) return directMatch.name

  const aliases: Record<string, string> = {
    서울: '서울특별시',
    부산: '부산광역시',
    대구: '대구광역시',
    인천: '인천광역시',
    광주: '광주광역시',
    대전: '대전광역시',
    울산: '울산광역시',
    세종: '세종특별자치시',
    제주: '제주특별자치도',
    강원도: '강원특별자치도',
    전북: '전라북도',
    전남: '전라남도',
    충북: '충청북도',
    충남: '충청남도',
    경북: '경상북도',
    경남: '경상남도',
  }
  return aliases[normalized] ?? null
}

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation is unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300_000,
    })
  })
}

async function resolveCurrentRegion() {
  const kakao = (window as any).kakao
  if (!kakao?.maps?.services?.Geocoder) return null

  try {
    const position = await getCurrentPosition()
    const lat = position.coords.latitude
    const lng = position.coords.longitude
    console.warn('[TRIP_REGION_GEOLOCATION_SUCCESS]', { lat, lng })
    if (map) map.setCenter(new kakao.maps.LatLng(lat, lng))

    const regionName = await new Promise<string | null>((resolve) => {
      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.coord2RegionCode(lng, lat, (result: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK) {
          resolve(null)
          return
        }
        resolve(
          result.find((item) => item.region_type === 'H')?.region_1depth_name ??
            result[0]?.region_1depth_name ??
            null,
        )
      })
    })
    const normalizedRegionName = normalizeRegionName(regionName)
    console.warn('[TRIP_REGION_GEOCODER_RESULT]', { regionName, normalizedRegionName })
    return normalizedRegionName
  } catch {
    return null
  }
}

function moveMapToDefaultRegion() {
  if (!map) return
  map.setCenter(new (window as any).kakao.maps.LatLng(35.1796, 129.0756))
  map.setLevel(7)
}

async function initializeRegionOnce() {
  if (isInitializingRegion.value || hasInitializedRegion.value) return

  isInitializingRegion.value = true
  console.warn('[TRIP_REGION_INIT_START]')
  try {
    const currentRegionName = await resolveCurrentRegion()
    if (currentRegionName && (await applyRegion(currentRegionName))) {
      hasInitializedRegion.value = true
      return
    }

    if (hasInitializedRegion.value) return
    console.warn('[TRIP_REGION_FALLBACK]', { regionName: DEFAULT_TOUR_REGION.name })
    moveMapToDefaultRegion()
    await applyRegion(DEFAULT_TOUR_REGION.name)
    hasInitializedRegion.value = true
  } finally {
    isInitializingRegion.value = false
  }
}

function handleDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#autocomplete-section')) acList.value = []
}

onMounted(async () => {
  await loadKakaoMap()
  document.addEventListener('click', handleDocClick)

  if (keyword.value.trim()) {
    searching.value = true
    searchState.value = 'loading'
    try {
      makeListAndMarkers(await fetchTripsByKeyword(keyword.value.trim()))
    } finally {
      searching.value = false
    }
  } else {
    await initializeRegionOnce()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
})
</script>

<style scoped>
#map-container {
  position: relative;
  height: calc(100vh - 64px);
  width: 100%;
}
#map {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #eaf0f2;
}
:deep(.ai-route-marker) {
  transform: translateY(-4px);
}
.ai-route-marker span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #0788f5;
  color: #fff;
  font-weight: 800;
  box-shadow: 0 3px 9px #00599c66;
}
.ai-timeline-card.active {
  background: #eaf5ff;
  border-left: 3px solid #0788f5;
}
.ai-route-marker.selected span {
  width: 38px;
  height: 38px;
  background: #ff6b35;
  border: 3px solid #fff;
  box-shadow: 0 0 0 3px #ff6b3566;
}
.ai-timeline-panel {
  width: 420px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  background: #fbfdff;
  border: 1px solid #e1eaf3;
  border-radius: 20px;
  box-shadow: 0 18px 45px #18334d1a;
}
.ai-timeline-panel .search-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eef5;
}
.ai-plan-summary {
  margin: 7px 0 14px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}
.ai-day-tabs {
  display: flex;
  gap: 7px;
}
.ai-day-tabs button {
  border: 0;
  border-radius: 999px;
  padding: 8px 13px;
  background: #edf2f7;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}
.ai-day-tabs button.active {
  background: #0788f5;
  color: #fff;
  box-shadow: 0 5px 12px #0788f544;
}
.ai-timeline-list {
  position: relative;
  flex: 1;
  margin-top: 12px;
  padding: 4px 2px 18px;
}
.ai-timeline-list::before {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 17px;
  width: 2px;
  background: #dbeafe;
  content: '';
}
.ai-timeline-card {
  position: relative;
  display: flex;
  gap: 14px;
  margin: 0 0 12px;
  padding: 16px 14px;
  border: 1px solid #e4ebf3;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: 0.18s ease;
}
.ai-timeline-card:hover {
  transform: translateX(2px);
  box-shadow: 0 8px 18px #274c7712;
}
.ai-timeline-card.active {
  border-color: #8ac8ff;
  border-left: 4px solid #0788f5;
  background: #f0f8ff;
  box-shadow: 0 9px 22px #0788f51c;
}
.ai-order {
  z-index: 1;
  display: grid;
  flex: 0 0 31px;
  place-items: center;
  width: 31px;
  height: 31px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #dbeafe;
  color: #156fb7;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 2px 7px #154d7b22;
}
.ai-timeline-card.active .ai-order {
  background: #0788f5;
  color: #fff;
}
.ai-card-content {
  min-width: 0;
}
.ai-card-content time {
  display: block;
  margin-bottom: 4px;
  color: #0788f5;
  font-size: 12px;
  font-weight: 800;
}
.ai-card-content h6 {
  margin: 0;
  color: #1d2e40;
  font-size: 15px;
  font-weight: 800;
}
.ai-card-content p {
  margin: 5px 0 0;
  color: #718096;
  font-size: 13px;
  line-height: 1.5;
}
.ai-timeline-panel .btn {
  flex: 0 0 auto;
  border-radius: 11px;
  font-weight: 800;
}
.ai-route-marker {
  border: 0;
  background: transparent;
  padding: 0;
}
.ai-route-marker span {
  width: 30px;
  height: 30px;
  border: 2px solid #1677c8;
  background: #fff;
  color: #1677c8;
  box-shadow: 0 3px 10px #0d4f7d2e;
}
.ai-route-marker.selected span {
  width: 36px;
  height: 36px;
  background: #1677c8;
  color: #fff;
  box-shadow: 0 0 0 3px #1677c833;
}
.ai-timeline-panel .btn-outline-secondary {
  background: transparent;
  border-color: #d3dfea;
  color: #607286;
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
  width: 380px;
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
.search-header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
}
.result-list {
  background: #fff;
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}
.result-item {
  display: flex;
  padding: 10px;
  border-bottom: 0;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 8px;
}
.result-item:hover {
  background-color: var(--et-gray-100);
  transform: none;
}
.result-item--skeleton {
  cursor: default;
}
.result-item--skeleton:hover {
  background-color: transparent;
}
.result-img {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
  background-color: var(--et-gray-100);
}
.region-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--et-gray-500);
  letter-spacing: 0.05em;
}
.region-divider::before,
.region-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-default);
}
.result-list::-webkit-scrollbar {
  width: 6px;
}
.result-list::-webkit-scrollbar-thumb {
  background: var(--et-gray-300);
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
  background: var(--et-blue-wash);
}
.ac-addr {
  font-size: 12px;
  color: var(--et-gray-500);
  margin-top: 2px;
}
:deep(mark) {
  background: none;
  color: var(--primary-color);
  font-weight: 700;
  padding: 0;
}
@media (max-width: 767.98px) {
  .side-panel {
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100% - 24px);
  }
}
:deep(.customoverlay) {
  position: relative;
  bottom: 40px;
  border-radius: 6px;
  border: 0;
  box-shadow: 0px 1px 2px #888;
  float: left;
}
:deep(.customoverlay a) {
  display: block;
  text-decoration: none;
  color: #000;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  overflow: hidden;
  background: #d95050 url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png)
    no-repeat right 14px center;
}
:deep(.customoverlay .title) {
  display: block;
  text-align: center;
  background: #fff;
  margin-right: 35px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
}
:deep(.customoverlay::after) {
  content: '';
  position: absolute;
  margin-left: -12px;
  left: 50%;
  bottom: -12px;
  width: 22px;
  height: 12px;
  background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png');
}
</style>
