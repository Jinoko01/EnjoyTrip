<template>
  <header class="custom-page-header hotplace-page-header border-bottom">
    <div class="container header-content">
      <div class="d-flex align-items-center gap-3 mb-2">
        <i class="bi bi-fire display-4 d-inline-block"></i>
        <h1 class="fw-bold mb-0">핫플레이스</h1>
      </div>
      <p class="lead text-muted mb-0">여행자들이 직접 추천하는 숨은 명소를 만나보세요.</p>
    </div>
  </header>

  <main class="hotplace-page">
    <div class="container hotplace-content">
      <div class="hotplace-toolbar">
        <div class="d-flex align-items-center flex-wrap gap-2">
          <form class="hotplace-search" role="search" @submit.prevent>
            <i class="bi bi-search" aria-hidden="true"></i>
            <input
              v-model="searchKeyword"
              type="search"
              placeholder="이름·지역·설명 검색"
              aria-label="핫플레이스 검색"
            />
          </form>

          <div class="sort-chips" aria-label="핫플레이스 정렬">
            <button
              type="button"
              class="sort-chip"
              :class="{ active: sortMode === 'popular' }"
              @click="sortMode = 'popular'"
            >
              인기순
            </button>
            <button
              type="button"
              class="sort-chip"
              :class="{ active: sortMode === 'latest' }"
              @click="sortMode = 'latest'"
            >
              최신순
            </button>
            <button
              type="button"
              class="sort-chip"
              :class="{ active: sortMode === 'rating' }"
              @click="sortMode = 'rating'"
            >
              평점순
            </button>
          </div>

          <details class="rating-filter">
            <summary><i class="bi bi-funnel me-1"></i>평점 범위</summary>
            <div class="rating-filter-panel">
              <div class="input-group input-group-sm">
                <select v-model="filterMin" class="form-select" aria-label="최소 평점">
                  <option v-for="v in ratingOptions" :key="v" :value="v">{{ v }}</option>
                </select>
                <span class="input-group-text">~</span>
                <select v-model="filterMax" class="form-select" aria-label="최대 평점">
                  <option v-for="v in ratingOptions" :key="v" :value="v">{{ v }}</option>
                </select>
              </div>
              <button type="button" class="btn btn-sm btn-primary" @click="loadHotplaces">
                검색
              </button>
              <button type="button" class="btn btn-sm btn-light" @click="resetFilter">
                전체보기
              </button>
              <span class="rating-filter-count">{{ hotplaces.length }} / {{ totalCount }}</span>
            </div>
          </details>
        </div>

        <button
          v-if="auth.user"
          class="btn btn-custom register-button"
          @click="showAddModal = true"
        >
          <i class="bi bi-camera me-1"></i> 핫플 등록
        </button>
        <RouterLink v-else to="/login" class="btn btn-custom register-button">
          <i class="bi bi-camera me-1"></i> 핫플 등록
        </RouterLink>
      </div>

      <div v-if="loading" class="hotplace-grid">
        <article v-for="n in 6" :key="n" class="hotplace-card hotplace-card--skeleton">
          <div class="hotplace-image-wrap">
            <SkeletonBox width="100%" height="100%" radius="0" />
          </div>
          <div class="hotplace-card-body">
            <div class="hotplace-badges">
              <SkeletonBox width="64px" height="20px" />
              <SkeletonBox width="46px" height="20px" />
            </div>
            <SkeletonBox width="70%" height="22px" />
            <SkeletonBox width="100%" height="14px" />
            <SkeletonBox width="85%" height="14px" />
            <div class="hotplace-meta">
              <div class="author-info">
                <SkeletonBox width="34px" height="34px" circle />
                <SkeletonBox width="80px" height="14px" />
              </div>
              <SkeletonBox width="40px" height="12px" />
            </div>
          </div>
        </article>
      </div>
      <div v-else-if="sortedHotplaces.length === 0" class="hotplace-empty text-center text-muted">
        <i class="bi bi-images display-1 mb-3"></i>
        <h5 v-if="searchKeyword.trim()">'{{ searchKeyword }}'에 대한 검색 결과가 없습니다.</h5>
        <h5 v-else>아직 등록된 핫플레이스가 없습니다.</h5>
      </div>
      <div v-else class="hotplace-grid">
        <article
          v-for="hp in pagedHotplaces"
          :key="hp.hotPlaceId"
          class="hotplace-card animate-fade-in-up"
          role="link"
          tabindex="0"
          @click="goDetail(hp.hotPlaceId)"
          @keydown.enter="goDetail(hp.hotPlaceId)"
        >
          <div class="hotplace-image-wrap">
            <img :src="cardImage(hp)" class="hotplace-img" :alt="hp.title" />
            <span class="hotplace-heart" aria-hidden="true"><i class="bi bi-heart"></i></span>
          </div>

          <div class="hotplace-card-body">
            <div class="hotplace-badges">
              <span class="location-badge">
                <i class="bi bi-geo-alt-fill"></i>{{ hp.location }}
              </span>
              <span class="rating-badge"> <i class="bi bi-star-fill"></i>{{ hp.rating }} </span>
            </div>

            <h2 class="hotplace-title">{{ hp.title }}</h2>
            <p class="hotplace-description">{{ hp.description }}</p>

            <div class="hotplace-meta">
              <div class="author-info">
                <span class="hotplace-avatar" :style="{ backgroundColor: avatarColor(hp) }">
                  {{ hp.authorName?.charAt(0) || '여' }}
                </span>
                <div>
                  <div class="author-name">{{ hp.authorName }}</div>
                  <div class="registration-date">
                    {{ hp.registrationDate?.substring(0, 10) }}
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <span class="saved-count">
                  <i class="bi bi-heart-fill"></i>{{ formatCount(hp.likeCount) }}
                </span>
                <button
                  v-if="auth.user?.userId === hp.userId"
                  type="button"
                  class="delete-button"
                  aria-label="핫플레이스 삭제"
                  @click.stop="deleteHotplace(hp.hotPlaceId)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <Pagination v-if="!loading" v-model:current-page="currentPage" :total-pages="totalPages" />
    </div>
  </main>

  <!-- 핫플 등록 모달 -->
  <div
    v-if="showAddModal"
    class="modal show d-block"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="showAddModal = false"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div
        class="modal-content"
        style="border-radius: 20px; border: none; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1)"
      >
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold">새 핫플레이스 등록</h5>
          <button type="button" class="btn-close" @click="showAddModal = false"></button>
        </div>
        <form enctype="multipart/form-data" @submit.prevent="submitHotplace">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold"
                >사진
                <span class="text-muted fw-normal">(선택, 최대 {{ MAX_IMAGES }}장)</span></label
              >
              <input
                type="file"
                class="form-control"
                accept="image/*"
                multiple
                :disabled="imageFiles.length >= MAX_IMAGES"
                @change="onImageChange"
              />
              <div v-if="imagePreviews.length" class="image-preview-grid mt-2">
                <div v-for="(src, i) in imagePreviews" :key="i" class="image-preview-item">
                  <img :src="src" alt="미리보기" />
                  <span v-if="i === 0" class="image-preview-badge">대표</span>
                  <button
                    type="button"
                    class="image-preview-remove"
                    aria-label="사진 제거"
                    @click="removeImage(i)"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <p class="text-muted small mt-1 mb-0">첫 번째 사진이 대표 이미지로 사용됩니다.</p>
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">사진 없을 경우 테마 선택</label>
              <div class="btn-group w-100" role="group">
                <input
                  id="th1"
                  v-model="addForm.theme"
                  type="radio"
                  class="btn-check"
                  value="nature"
                />
                <label class="btn btn-outline-primary" for="th1">자연풍경</label>
                <input
                  id="th2"
                  v-model="addForm.theme"
                  type="radio"
                  class="btn-check"
                  value="city"
                />
                <label class="btn btn-outline-primary" for="th2">도시야경</label>
                <input
                  id="th3"
                  v-model="addForm.theme"
                  type="radio"
                  class="btn-check"
                  value="food"
                />
                <label class="btn btn-outline-primary" for="th3">맛집탐방</label>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">장소 이름</label>
                <input
                  v-model="addForm.title"
                  type="text"
                  class="form-control"
                  placeholder="예: 광안리 수변공원"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">평점</label>
                <select v-model="addForm.rating" class="form-select" required>
                  <option v-for="v in ratingOptionsDesc" :key="v" :value="v">
                    {{ v }}
                  </option>
                </select>
              </div>
              <div class="col-12 mb-3">
                <HotPlaceLocationPicker v-model="selectedLocation" />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">상세 설명</label>
              <textarea
                v-model="addForm.desc"
                class="form-control"
                rows="4"
                placeholder="어떤 점이 좋았는지 생생하게 알려주세요!"
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-light" @click="showAddModal = false">취소</button>
            <button
              type="submit"
              class="btn btn-custom"
              :disabled="submitting || !selectedLocation"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/usePagination'
import HotPlaceLocationPicker, {
  type HotPlaceLocation,
} from '@/components/hotplace/HotPlaceLocationPicker.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)

// 헤더 통합검색에서 넘어온 키워드를 검색창에 미리 채워 둔다.
const searchKeyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')

function goDetail(hotPlaceId: number) {
  router.push(`/hotplace/${hotPlaceId}`)
}
const hotplaces = ref<any[]>([])
const totalCount = ref(0)
const showAddModal = ref(false)
const submitting = ref(false)
const MAX_IMAGES = 5
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const filterMin = ref('1.0')
const filterMax = ref('5.0')
const sortMode = ref<'popular' | 'latest' | 'rating'>('popular')
const ratingOptions = ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0']
const ratingOptionsDesc = [...ratingOptions].reverse()
const addForm = ref({ title: '', desc: '', theme: 'nature', rating: '5.0' })
const selectedLocation = ref<HotPlaceLocation | null>(null)

const filteredHotplaces = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return hotplaces.value
  return hotplaces.value.filter((hp) =>
    [hp.title, hp.location, hp.description].some(
      (field) => typeof field === 'string' && field.toLowerCase().includes(keyword),
    ),
  )
})

const sortedHotplaces = computed(() => {
  const items = [...filteredHotplaces.value]

  if (sortMode.value === 'latest') {
    return items.sort(
      (a, b) =>
        new Date(b.registrationDate || 0).getTime() - new Date(a.registrationDate || 0).getTime(),
    )
  }

  if (sortMode.value === 'rating') {
    return items.sort((a, b) => Number(b.rating) - Number(a.rating))
  }

  // 인기순 — 좋아요가 많은 순
  return items.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
})

const HOTPLACES_PER_PAGE = 9
const {
  currentPage,
  totalPages,
  pagedItems: pagedHotplaces,
} = usePagination(sortedHotplaces, HOTPLACES_PER_PAGE)

function cardImage(hp: any) {
  if (hp.imageUrl) return hp.imageUrl
  const themeMap: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1597132690870-ea2cfbd20cc0?q=80',
    city: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
    food: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  }
  return (
    themeMap[hp.theme] || 'https://images.unsplash.com/photo-1506744626753-eda814117282?w=800&q=80'
  )
}

function avatarColor(hp: any) {
  const colors = ['#00b894', '#ff9f0a', '#0087ff', '#7c5cff']
  return colors[Math.abs(Number(hp.hotPlaceId) || 0) % colors.length]
}

function formatCount(value: number) {
  return value.toLocaleString('ko-KR')
}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 입력값을 비운다.
  input.value = ''
  for (const file of files) {
    if (imageFiles.value.length >= MAX_IMAGES) break
    imageFiles.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  }
}

function removeImage(index: number) {
  URL.revokeObjectURL(imagePreviews.value[index])
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

function resetImages() {
  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
  imageFiles.value = []
  imagePreviews.value = []
}

async function loadHotplaces() {
  loading.value = true
  try {
    const res = await api.get('/hotplace', {
      params: { min: filterMin.value, max: filterMax.value },
    })
    hotplaces.value = res.data
    if (!filterMin.value && !filterMax.value) totalCount.value = res.data.length
  } finally {
    loading.value = false
  }
}

async function resetFilter() {
  filterMin.value = '1.0'
  filterMax.value = '5.0'
  loading.value = true
  try {
    const res = await api.get('/hotplace')
    hotplaces.value = res.data
    totalCount.value = res.data.length
  } finally {
    loading.value = false
  }
}

async function submitHotplace() {
  if (!selectedLocation.value) {
    alert('핫플레이스 위치를 선택해 주세요.')
    return
  }

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('title', addForm.value.title)
    fd.append('location', selectedLocation.value.location)
    fd.append('latitude', String(selectedLocation.value.latitude))
    fd.append('longitude', String(selectedLocation.value.longitude))
    if (selectedLocation.value.placeName) {
      fd.append('placeName', selectedLocation.value.placeName)
    }
    if (selectedLocation.value.kakaoPlaceId) {
      fd.append('kakaoPlaceId', selectedLocation.value.kakaoPlaceId)
    }
    fd.append('desc', addForm.value.desc)
    fd.append('theme', addForm.value.theme)
    fd.append('rating', addForm.value.rating)
    imageFiles.value.forEach((file) => fd.append('images', file))
    await api.post('/hotplace', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    showAddModal.value = false
    addForm.value = { title: '', desc: '', theme: 'nature', rating: '5.0' }
    selectedLocation.value = null
    resetImages()
    await resetFilter()
  } finally {
    submitting.value = false
  }
}

async function deleteHotplace(id: number) {
  if (!confirm('이 핫플레이스를 삭제하시겠습니까?')) return
  await api.delete(`/hotplace/${id}`)
  await loadHotplaces()
}

onMounted(async () => {
  try {
    const res = await api.get('/hotplace')
    hotplaces.value = res.data
    totalCount.value = res.data.length
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hotplace-page-header {
  padding: 42px 0 40px;
}

.hotplace-page-header h1 {
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.hotplace-page-header .display-4 {
  font-size: 2rem;
}

.hotplace-page-header .lead {
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}

.hotplace-page {
  min-height: 620px;
  padding: 24px 0 80px;
  background: #fff;
}

.hotplace-content {
  max-width: 1060px;
}

.hotplace-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.hotplace-search {
  position: relative;
  display: flex;
  align-items: center;
}

.hotplace-search > i {
  position: absolute;
  left: 12px;
  color: #8694a5;
  font-size: 0.9rem;
  pointer-events: none;
}

.hotplace-search input {
  width: 240px;
  max-width: 100%;
  padding: 8px 14px 8px 34px;
  border: 1px solid #d4dce6;
  border-radius: 999px;
  font-size: 0.875rem;
  background: #fff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.hotplace-search input:focus {
  outline: none;
  border-color: #087ff5;
  box-shadow: 0 0 0 3px rgb(8 127 245 / 12%);
}

.sort-chips {
  display: flex;
  gap: 8px;
}

.sort-chip {
  min-width: 70px;
  padding: 7px 16px;
  border: 1px solid #d4dce6;
  border-radius: 999px;
  color: #485568;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.sort-chip:hover,
.sort-chip.active {
  color: #087ff5;
  border-color: #087ff5;
  background: #f2f8ff;
}

.rating-filter {
  position: relative;
}

.rating-filter summary {
  padding: 7px 12px;
  color: #66768a;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  list-style: none;
}

.rating-filter summary::-webkit-details-marker {
  display: none;
}

.rating-filter-panel {
  position: absolute;
  z-index: 10;
  top: calc(100% + 10px);
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  padding: 12px;
  border: 1px solid #dce3eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 30px rgb(15 38 68 / 12%);
}

.rating-filter-panel .input-group {
  width: 190px;
}

.rating-filter-count {
  color: #8694a5;
  font-size: 0.75rem;
  white-space: nowrap;
}

.register-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.hotplace-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.hotplace-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.hotplace-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.hotplace-card:hover {
  transform: translateY(-2px);
  border-color: #cfd8e3;
  box-shadow: 0 10px 26px rgb(22 50 82 / 10%);
}

.hotplace-image-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.hotplace-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.hotplace-card:hover .hotplace-img {
  transform: scale(1.025);
}

.hotplace-heart {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #fff;
  font-size: 1.55rem;
  line-height: 1;
  filter: drop-shadow(0 1px 3px rgb(0 0 0 / 35%));
}

.hotplace-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 14px 16px 16px;
}

.hotplace-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.location-badge,
.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.25;
}

.location-badge {
  max-width: 72%;
  overflow: hidden;
  color: #087ff5;
  background: #eef7ff;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating-badge {
  color: #a66b00;
  background: #fff7e4;
}

.hotplace-title {
  margin: 0 0 6px;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.45;
}

.hotplace-description {
  display: -webkit-box;
  min-height: 42px;
  margin: 0 0 14px;
  overflow: hidden;
  color: #7b899a;
  font-size: 0.83rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hotplace-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 13px;
  border-top: 1px solid #e4e9ef;
}

.author-info,
.card-actions,
.saved-count {
  display: flex;
  align-items: center;
}

.author-info {
  gap: 10px;
}

.hotplace-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
}

.author-name {
  color: #263446;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.3;
}

.registration-date {
  margin-top: 2px;
  color: #9aa7b6;
  font-size: 0.7rem;
}

.card-actions {
  gap: 10px;
}

.saved-count {
  gap: 4px;
  color: #8493a4;
  font-size: 0.75rem;
  white-space: nowrap;
}

.delete-button {
  padding: 2px;
  border: 0;
  color: #dc3545;
  background: transparent;
  line-height: 1;
}

.hotplace-empty {
  padding: 90px 0;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 8px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 10px;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 1px 6px;
  border-radius: 5px;
  background: rgb(0 0 0 / 60%);
  color: #fff;
  font-size: 0.66rem;
  font-weight: 700;
}

.image-preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 55%);
  color: #fff;
  font-size: 0.9rem;
  line-height: 1;
}

.image-preview-remove:hover {
  background: rgb(0 0 0 / 75%);
}

.hotplace-card--skeleton {
  cursor: default;
}

.hotplace-card--skeleton:hover {
  transform: none;
  border-color: var(--border-default);
  box-shadow: none;
}

.hotplace-card--skeleton .hotplace-card-body {
  gap: 10px;
}

@media (max-width: 991.98px) {
  .hotplace-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .hotplace-page-header {
    padding: 32px 0;
  }

  .hotplace-page-header h1 {
    font-size: 1.7rem;
  }

  .hotplace-toolbar {
    align-items: flex-start;
  }

  .rating-filter-panel {
    position: fixed;
    top: auto;
    right: 16px;
    bottom: 16px;
    left: 16px;
    flex-wrap: wrap;
    width: auto;
  }

  /* 모바일: 카드 그리드를 가로형 리스트로 전환 */
  .hotplace-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hotplace-card {
    flex-direction: row;
    align-items: stretch;
  }

  .hotplace-image-wrap {
    width: 118px;
    height: auto;
    flex: 0 0 118px;
  }

  .hotplace-card-body {
    min-width: 0;
    padding: 11px 13px;
  }

  .hotplace-badges {
    margin-bottom: 6px;
  }

  .hotplace-title {
    margin-bottom: 4px;
    font-size: 0.97rem;
  }

  .hotplace-description {
    min-height: 0;
    margin-bottom: 10px;
    -webkit-line-clamp: 2;
    font-size: 0.8rem;
  }

  .hotplace-heart {
    top: 8px;
    right: 8px;
    font-size: 1.2rem;
  }

  .hotplace-meta {
    padding-top: 10px;
  }
}

@media (max-width: 479.98px) {
  .hotplace-toolbar {
    flex-direction: column-reverse;
  }

  .register-button {
    align-self: flex-end;
  }

  .sort-chip {
    min-width: 64px;
    padding-inline: 13px;
  }
}
</style>
