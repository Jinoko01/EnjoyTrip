<script setup lang="ts">
import api from '@/api'
import CommentSection, { type CommentItem } from '@/components/CommentSection.vue'
import ImagePlaceholder from '@/components/common/ImagePlaceholder.vue'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import { useReactions } from '@/composables/useReactions'
import { useAuthStore } from '@/stores/auth'
import { loadKakaoMapSdk } from '@/utils/kakaoMap'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const THEME_LABELS: Record<string, string> = { nature: '자연', city: '도시', food: '맛집' }
const AVATAR_COLORS = ['#00b894', '#ff9f0a', '#0087ff', '#7c5cff']

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const hotPlaceId = Number(route.params.hotPlaceId)

const hotplace = ref<any>(null)
const loading = ref(true)
const activeImage = ref(0)

// 좋아요 — 영속 상태 + 낙관적 업데이트
const { liked, likeCount, syncFrom, toggleLike } = useReactions('/hotplace', hotPlaceId)

const mapEl = ref<HTMLElement | null>(null)
const mapError = ref(false)

// 댓글은 영속화 백엔드가 아직 없어 화면 세션 동안만 유지되는 로컬 상태로 둔다.
const comments = ref<CommentItem[]>([])
let commentSeq = 0

const categoryLabel = computed(() => THEME_LABELS[hotplace.value?.theme] ?? '관광지')

// 사용자가 실제로 등록한 사진만 노출한다. (없으면 빈 배열 → 자리표시 컴포넌트 표시)
// 다중 이미지(imageUrls)를 우선 사용하고, 없으면 대표 이미지(imageUrl) 한 장으로 폴백한다.
const gallery = computed<string[]>(() => {
  const urls = hotplace.value?.imageUrls
  if (Array.isArray(urls) && urls.length > 0) return urls
  const imageUrl = hotplace.value?.imageUrl
  return imageUrl ? [imageUrl] : []
})

function prevImage() {
  const count = gallery.value.length
  activeImage.value = (activeImage.value - 1 + count) % count
}

function nextImage() {
  activeImage.value = (activeImage.value + 1) % gallery.value.length
}

const authorInitial = computed(() => hotplace.value?.authorName?.charAt(0) || '여')
const authorColor = computed(() => AVATAR_COLORS[Math.abs(hotPlaceId) % AVATAR_COLORS.length])

function requireLogin(): boolean {
  if (auth.user) return true
  if (confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
  }
  return false
}

async function onLike() {
  if (!requireLogin()) return
  try {
    await toggleLike()
  } catch {
    alert('좋아요 처리에 실패했습니다.')
  }
}

async function shareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('링크가 복사되었습니다.')
  } catch {
    alert('링크 복사에 실패했습니다.')
  }
}

function addComment(content: string) {
  if (!auth.user) return
  comments.value.push({
    id: ++commentSeq,
    authorName: auth.user.userName,
    userId: auth.user.userId,
    content,
    createdAt: new Date().toISOString().substring(0, 10),
  })
}

function removeComment(id: number) {
  comments.value = comments.value.filter((c) => c.id !== id)
}

function storedCoordinates() {
  const latitudeValue = hotplace.value?.latitude
  const longitudeValue = hotplace.value?.longitude
  if (latitudeValue === null || latitudeValue === undefined) return null
  if (longitudeValue === null || longitudeValue === undefined) return null

  const latitude = Number(latitudeValue)
  const longitude = Number(longitudeValue)
  const validLatitude = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
  const validLongitude = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
  return validLatitude && validLongitude ? { latitude, longitude } : null
}

function renderLocationMap(kakao: any, latitude: number, longitude: number) {
  if (!mapEl.value) return
  const coords = new kakao.maps.LatLng(latitude, longitude)
  const map = new kakao.maps.Map(mapEl.value, { center: coords, level: 4 })
  new kakao.maps.Marker({ map, position: coords })
}

function initLocationMap() {
  if (!mapEl.value) return
  mapError.value = false
  loadKakaoMapSdk('services')
    .then(() => {
      const kakao = (window as any).kakao
      const coordinates = storedCoordinates()
      if (coordinates) {
        renderLocationMap(kakao, coordinates.latitude, coordinates.longitude)
        return
      }

      if (!hotplace.value?.location) {
        mapError.value = true
        return
      }

      const query = hotplace.value.location.replace(/·/g, ' ').trim()
      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(query, (result: any[], status: string) => {
        if (status !== kakao.maps.services.Status.OK || !result.length) {
          mapError.value = true
          return
        }
        renderLocationMap(kakao, Number(result[0].y), Number(result[0].x))
      })
    })
    .catch(() => {
      mapError.value = true
    })
}

onMounted(async () => {
  if (!hotPlaceId) {
    router.replace('/hotplace')
    return
  }
  try {
    const res = await api.get(`/hotplace/${hotPlaceId}`)
    hotplace.value = res.data
    syncFrom(res.data)
  } catch {
    alert('핫플레이스를 불러오지 못했습니다.')
    router.replace('/hotplace')
    return
  } finally {
    loading.value = false
  }
  // hotplace가 채워진 뒤 v-if 블록이 실제로 렌더된 다음에야 지도 컨테이너(mapEl)가 존재한다.
  await nextTick()
  initLocationMap()
})
</script>

<template>
  <div class="hp-topbar">
    <div class="container">
      <RouterLink to="/hotplace" class="hp-back">
        <i class="bi bi-chevron-left"></i> 핫플레이스
      </RouterLink>
    </div>
  </div>

  <main v-if="hotplace" class="container hp-detail">
    <div class="hp-grid">
      <!-- 좌측: 이미지 갤러리 + 추천 사유 -->
      <div class="hp-col">
        <div class="hp-gallery">
          <template v-if="gallery.length">
            <div class="hp-carousel">
              <img :src="gallery[activeImage]" :alt="hotplace.title" class="hp-main-img" />
              <template v-if="gallery.length > 1">
                <button
                  type="button"
                  class="hp-arrow hp-arrow--prev"
                  aria-label="이전 사진"
                  @click="prevImage"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button
                  type="button"
                  class="hp-arrow hp-arrow--next"
                  aria-label="다음 사진"
                  @click="nextImage"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
                <span class="hp-count">{{ activeImage + 1 }} / {{ gallery.length }}</span>
              </template>
            </div>
            <div v-if="gallery.length > 1" class="hp-thumbs">
              <button
                v-for="(img, i) in gallery"
                :key="i"
                type="button"
                class="hp-thumb"
                :class="{ active: i === activeImage }"
                @click="activeImage = i"
              >
                <img :src="img" :alt="`${hotplace.title} ${i + 1}`" />
              </button>
            </div>
          </template>
          <ImagePlaceholder v-else />
        </div>

        <section class="hp-block">
          <h2 class="hp-block-title">이 곳을 추천하는 이유</h2>
          <p class="hp-recommend">{{ hotplace.description }}</p>
        </section>
      </div>

      <!-- 우측: 정보 패널 + 위치 -->
      <div class="hp-col">
        <div class="hp-badges">
          <span class="hp-badge location"
            ><i class="bi bi-geo-alt-fill"></i>{{ hotplace.location }}</span
          >
          <span class="hp-badge category">{{ categoryLabel }}</span>
          <span class="hp-badge rating"><i class="bi bi-star-fill"></i>{{ hotplace.rating }}</span>
        </div>

        <h1 class="hp-title">{{ hotplace.title }}</h1>

        <div class="hp-actions">
          <button type="button" class="hp-action" :class="{ on: liked }" @click="onLike">
            <i :class="liked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i> 좋아요
            <span v-if="likeCount > 0" class="hp-action-count">{{ likeCount }}</span>
          </button>
          <button type="button" class="hp-action" @click="shareLink">
            <i class="bi bi-share"></i> 공유
          </button>
        </div>

        <div class="hp-author">
          <span class="hp-author-avatar" :style="{ backgroundColor: authorColor }">
            {{ authorInitial }}
          </span>
          <div class="hp-author-info">
            <div class="hp-author-name">{{ hotplace.authorName }}</div>
            <div class="hp-author-date">{{ hotplace.registrationDate?.substring(0, 10) }} 등록</div>
          </div>
        </div>

        <section class="hp-block">
          <h2 class="hp-block-title">위치</h2>
          <div v-if="mapError" class="hp-map-fallback">
            <i class="bi bi-geo-alt me-1"></i>{{ hotplace.location }}
          </div>
          <div v-else ref="mapEl" class="hp-map"></div>
          <div class="hp-infobox">
            <div class="hp-info-row">
              <i class="bi bi-geo-alt"></i><span>{{ hotplace.location }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <CommentSection
      :comments="comments"
      :can-comment="!!auth.user"
      :current-user-id="auth.user?.userId"
      @submit="addComment"
      @delete="removeComment"
    />
  </main>

  <main v-else-if="loading" class="container hp-detail">
    <div class="hp-grid">
      <div class="hp-col">
        <div class="hp-gallery">
          <SkeletonBox width="100%" height="360px" radius="var(--radius-lg)" />
          <div class="hp-thumbs">
            <SkeletonBox
              v-for="n in 4"
              :key="n"
              width="64px"
              height="64px"
              radius="var(--radius-md)"
            />
          </div>
        </div>
        <section class="hp-block">
          <SkeletonBox width="40%" height="22px" />
          <div class="mt-3 d-flex flex-column gap-2">
            <SkeletonBox width="100%" height="14px" />
            <SkeletonBox width="92%" height="14px" />
            <SkeletonBox width="70%" height="14px" />
          </div>
        </section>
      </div>

      <div class="hp-col">
        <div class="hp-badges">
          <SkeletonBox width="92px" height="26px" />
          <SkeletonBox width="60px" height="26px" />
          <SkeletonBox width="56px" height="26px" />
        </div>
        <div class="mb-3"><SkeletonBox width="75%" height="30px" /></div>
        <div class="mb-4 d-flex flex-column gap-2">
          <SkeletonBox width="100%" height="14px" />
          <SkeletonBox width="85%" height="14px" />
        </div>
        <SkeletonBox width="100%" height="56px" radius="var(--radius-md)" />
        <div class="hp-actions mt-3">
          <SkeletonBox width="100%" height="44px" radius="var(--radius-md)" />
          <SkeletonBox width="100%" height="44px" radius="var(--radius-md)" />
        </div>
        <section class="hp-block">
          <SkeletonBox width="30%" height="22px" />
          <div class="mt-3">
            <SkeletonBox width="100%" height="240px" radius="var(--radius-lg)" />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.hp-topbar {
  background: var(--surface-section);
  border-bottom: 1px solid var(--border-default);
}

.hp-topbar .container {
  max-width: 1080px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.hp-back {
  color: var(--et-gray-600);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.hp-back:hover {
  color: var(--primary-color);
}

.hp-detail {
  max-width: 1080px;
  padding-top: 32px;
  padding-bottom: 80px;
}

.hp-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 40px;
}

.hp-col {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

/* 갤러리 */
.hp-carousel {
  position: relative;
}

.hp-main-img {
  display: block;
  width: 100%;
  height: 360px;
  object-fit: cover;
  border-radius: var(--radius-lg);
}

.hp-arrow {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 45%);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.15s ease;
}

.hp-arrow:hover {
  background: rgb(0 0 0 / 65%);
}

.hp-arrow:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.hp-arrow--prev {
  left: 12px;
}

.hp-arrow--next {
  right: 12px;
}

.hp-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: rgb(0 0 0 / 55%);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.hp-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.hp-thumb {
  width: 64px;
  height: 64px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.hp-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hp-thumb.active {
  border-color: var(--primary-color);
}

/* 배지 */
.hp-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.hp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
}

.hp-badge.location {
  color: var(--primary-color);
  background: var(--et-blue-wash);
}

.hp-badge.category {
  color: var(--et-gray-700);
  background: var(--et-gray-100);
}

.hp-badge.rating {
  color: #a66b00;
  background: #fff7e4;
}

.hp-title {
  margin: 0 0 12px;
  color: var(--et-gray-900);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.35;
}

.hp-desc {
  margin: 0 0 20px;
  color: var(--et-gray-600);
  font-size: 1rem;
  line-height: 1.6;
}

.hp-infobox {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  background: var(--et-gray-50);
  margin-bottom: 20px;
}

.hp-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--et-gray-700);
  font-size: 0.9rem;
}

.hp-info-row i {
  color: var(--et-gray-500);
}

.hp-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.hp-action {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 12px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--et-gray-700);
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.15s ease;
}

.hp-action:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.hp-action.on {
  border-color: var(--primary-color);
  background: var(--et-blue-wash);
  color: var(--primary-color);
}

.hp-action-count {
  font-variant-numeric: tabular-nums;
}

.hp-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
}

.hp-author-avatar {
  display: inline-flex;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
}

.hp-author-info {
  flex: 1;
  min-width: 0;
}

.hp-author-name {
  color: var(--et-gray-900);
  font-size: 0.92rem;
  font-weight: 800;
}

.hp-author-date {
  margin-top: 2px;
  color: var(--et-gray-400);
  font-size: 0.76rem;
}

/* 블록 (추천 사유 / 위치) */
.hp-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hp-block-title {
  margin: 0 0 14px;
  color: var(--et-gray-900);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hp-recommend {
  margin: 0;
  color: var(--et-gray-700);
  font-size: 0.95rem;
  line-height: 1.75;
  white-space: pre-wrap;
}

.hp-map {
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-lg);
  background: var(--et-gray-100);
}

.hp-map-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-lg);
  background: var(--et-gray-100);
  color: var(--et-gray-600);
  font-weight: 600;
}

@media (max-width: 860px) {
  .hp-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hp-main-img {
    height: 280px;
  }

  .hp-title {
    font-size: 1.5rem;
  }
}
</style>
