<template>
  <main class="home-page">
    <section class="home-hero">
      <video
        class="home-hero-video"
        autoplay
        muted
        loop
        playsinline
        poster="https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=1400&q=80"
      >
        <source
          src="https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
        <source
          src="https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div class="home-hero-scrim"></div>
      <div class="home-container home-hero-inner">
        <div class="home-hero-copy">
          <h1>진짜 나만의 여행</h1>
          <p>전국의 여행지를 탐색하고, AI 일정 비서로 나만의 일정을 만들어보세요.</p>

          <form class="home-search" @submit.prevent="searchAttraction">
            <i class="bi bi-search" aria-hidden="true"></i>
            <input
              v-model="searchKeyword"
              type="search"
              placeholder="가고 싶은 관광지·맛집·숙소 이름을 검색해보세요"
              aria-label="관광지·맛집·숙소 이름으로 검색"
            />
            <button type="submit">검색</button>
          </form>
        </div>
      </div>
    </section>

    <section class="home-category-band">
      <div class="home-container">
        <nav class="home-categories" aria-label="여행 카테고리">
          <RouterLink
            v-for="category in categories"
            :key="category.label"
            class="home-category"
            :class="{ active: category.active }"
            :to="category.to"
          >
            <span class="home-category-icon">
              <i :class="`bi bi-${category.icon}`" aria-hidden="true"></i>
            </span>
            <span>{{ category.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </section>

    <section class="home-content">
      <div class="home-container">
        <div class="planner-banner">
          <div class="planner-banner-copy">
            <span class="planner-icon"><i class="bi bi-stars" aria-hidden="true"></i></span>
            <div>
              <strong>AI 일정 비서, 3초 만에 일정 완성</strong>
              <p>지역과 기간만 알려주면 동선까지 짜드려요.</p>
            </div>
          </div>
          <RouterLink class="planner-button" :to="auth.user ? '/schedule' : '/login'">
            <i class="bi bi-magic" aria-hidden="true"></i>
            지금 일정 짜기
          </RouterLink>
        </div>

        <section class="home-section popular-section">
          <div class="home-section-heading">
            <div>
              <h2>이번 주 인기 여행지</h2>
              <p>실시간 조회·찜 기준 베스트</p>
            </div>
            <RouterLink to="/attraction">전체보기 <i class="bi bi-chevron-right"></i></RouterLink>
          </div>

          <div class="popular-grid">
            <RouterLink
              v-for="(place, index) in popularPlaces"
              :key="place.title"
              class="place-card"
              to="/attraction"
            >
              <div class="place-image-wrap">
                <img :src="place.image" :alt="place.title" />
                <span class="place-rank">{{ index + 1 }}</span>
              </div>
              <span class="place-region">{{ place.region }}</span>
              <strong>{{ place.title }}</strong>
              <span class="place-rating">
                <i class="bi bi-star-fill" aria-hidden="true"></i>
                {{ place.rating }}
                <small>({{ place.reviews }})</small>
              </span>
            </RouterLink>
          </div>
        </section>
      </div>
    </section>

    <section class="home-section hot-section">
      <div class="home-container">
        <div class="home-section-heading">
          <div>
            <h2>지금 뜨는 핫플레이스</h2>
            <p>여행자들이 추천한 숨은 명소</p>
          </div>
          <RouterLink to="/hotplace">핫플 더보기 <i class="bi bi-chevron-right"></i></RouterLink>
        </div>

        <div v-if="hotLoading" class="hot-grid">
          <div v-for="n in HOME_HOT_PLACE_COUNT" :key="n" class="hot-card">
            <div class="hot-image-wrap"><SkeletonBox width="100%" height="100%" radius="0" /></div>
            <div class="hot-card-body">
              <div class="hot-card-meta">
                <SkeletonBox width="60px" height="12px" />
                <SkeletonBox width="36px" height="12px" />
              </div>
              <SkeletonBox width="70%" height="16px" />
            </div>
          </div>
        </div>
        <div v-else-if="hotPlaces.length" class="hot-grid">
          <RouterLink
            v-for="place in hotPlaces"
            :key="place.hotPlaceId"
            class="hot-card"
            :to="`/hotplace/${place.hotPlaceId}`"
          >
            <div class="hot-image-wrap">
              <img :src="hotPlaceImage(place)" :alt="place.title" />
              <span class="hot-badge"><i class="bi bi-fire-fill"></i> HOT</span>
            </div>
            <div class="hot-card-body">
              <div class="hot-card-meta">
                <span>{{ place.location }}</span>
                <span><i class="bi bi-star-fill"></i> {{ place.rating }}</span>
              </div>
              <strong>{{ place.title }}</strong>
            </div>
          </RouterLink>
        </div>
        <p v-else class="home-empty">아직 등록된 핫플레이스가 없습니다.</p>
      </div>
    </section>

    <section class="home-section news-section">
      <div class="home-container">
        <div class="home-section-heading">
          <div>
            <h2>여행 뉴스</h2>
            <p>지금 떠나기 좋은 여행 소식</p>
          </div>
          <RouterLink to="/news">뉴스 더보기 <i class="bi bi-chevron-right"></i></RouterLink>
        </div>

        <div v-if="newsLoading" class="home-news-grid">
          <div v-for="n in HOME_NEWS_COUNT" :key="n" class="home-news-card">
            <div class="home-news-thumb">
              <SkeletonBox width="40px" height="40px" radius="8px" />
            </div>
            <div class="home-news-body">
              <div class="mb-1"><SkeletonBox width="60px" height="16px" radius="5px" /></div>
              <SkeletonBox width="90%" height="14px" />
              <div class="mt-1"><SkeletonBox width="60%" height="14px" /></div>
            </div>
          </div>
        </div>
        <div v-else-if="travelNews.length" class="home-news-grid">
          <a
            v-for="news in travelNews"
            :key="news.link"
            class="home-news-card"
            :href="news.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="home-news-thumb"><i class="bi bi-newspaper" aria-hidden="true"></i></div>
            <div class="home-news-body">
              <span class="news-tag">{{ newsSource(news.link) }}</span>
              <strong>{{ stripHtml(news.title) }}</strong>
              <small>{{ news.pubDate }}</small>
            </div>
          </a>
        </div>
        <p v-else class="home-empty">표시할 여행 뉴스가 없습니다.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import api from '@/api'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const searchKeyword = ref('')

// label/contentType는 관광지 검색(attraction)의 '유형 카테고리' select 옵션과 동일하게 유지한다.
const categories = [
  { label: '전체', icon: 'grid', contentType: '0' },
  { label: '관광지', icon: 'camera', contentType: '12' },
  { label: '문화시설', icon: 'bank', contentType: '14' },
  { label: '축제공연행사', icon: 'balloon', contentType: '15' },
  { label: '여행코스', icon: 'signpost-split', contentType: '25' },
  { label: '레포츠', icon: 'bicycle', contentType: '28' },
  { label: '숙박', icon: 'building', contentType: '32' },
  { label: '쇼핑', icon: 'bag', contentType: '38' },
  { label: '음식점', icon: 'cup-hot', contentType: '39' },
].map((category) => ({
  ...category,
  active: category.contentType === '0',
  to:
    category.contentType === '0'
      ? { path: '/attraction' }
      : { path: '/attraction', query: { contentType: category.contentType } },
}))

const popularPlaces = [
  {
    title: '광안리해수욕장',
    region: '부산 · 수영구',
    rating: '4.8',
    reviews: '3,204',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=85',
  },
  {
    title: '해운대 블루라인파크',
    region: '부산 · 해운대구',
    rating: '4.7',
    reviews: '2,810',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=85',
  },
  {
    title: '감천문화마을',
    region: '부산 · 사하구',
    rating: '4.5',
    reviews: '1,890',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=85',
  },
  {
    title: '자갈치시장',
    region: '부산 · 중구',
    rating: '4.4',
    reviews: '1,422',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=85',
  },
  {
    title: '흰여울문화마을',
    region: '부산 · 영도구',
    rating: '4.7',
    reviews: '980',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=85',
  },
  {
    title: '부산엑스더스카이',
    region: '부산 · 해운대구',
    rating: '4.6',
    reviews: '1,130',
    image: 'https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=600&q=85',
  },
]

// 메인에 노출할 핫플레이스 개수 — 한 줄(4칸) 기준
const HOME_HOT_PLACE_COUNT = 4
// 메인에 노출할 여행 뉴스 개수 — 한 줄(3칸) 기준
const HOME_NEWS_COUNT = 3

interface HotPlace {
  hotPlaceId: number
  title: string
  location: string
  rating: number
  likeCount: number
  imageUrl?: string
  theme?: string
}

interface TravelNews {
  title: string
  link: string
  pubDate: string
}

// 핫플레이스 이미지가 없을 때 테마별 대체 이미지 (HotPlaceView와 동일 정책)
const HOT_PLACE_THEME_IMAGE: Record<string, string> = {
  nature: 'https://images.unsplash.com/photo-1597132690870-ea2cfbd20cc0?q=80',
  city: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
  food: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
}
const HOT_PLACE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506744626753-eda814117282?w=800&q=80'

const hotPlaces = ref<HotPlace[]>([])
const travelNews = ref<TravelNews[]>([])
const hotLoading = ref(true)
const newsLoading = ref(true)

function hotPlaceImage(place: HotPlace) {
  return place.imageUrl || HOT_PLACE_THEME_IMAGE[place.theme ?? ''] || HOT_PLACE_FALLBACK_IMAGE
}

function stripHtml(html: string) {
  return (
    html
      ?.replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"') ?? ''
  )
}

function newsSource(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return '여행뉴스'
  }
}

async function loadHotPlaces() {
  try {
    const res = await api.get('/hotplace')
    const items: HotPlace[] = res.data ?? []
    hotPlaces.value = [...items]
      .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
      .slice(0, HOME_HOT_PLACE_COUNT)
  } catch {
    hotPlaces.value = []
  } finally {
    hotLoading.value = false
  }
}

async function loadTravelNews() {
  try {
    const res = await api.get('/news')
    travelNews.value = (res.data.newsList ?? []).slice(0, HOME_NEWS_COUNT)
  } catch {
    travelNews.value = []
  } finally {
    newsLoading.value = false
  }
}

function searchAttraction() {
  router.push({
    path: '/attraction',
    query: searchKeyword.value.trim() ? { keyword: searchKeyword.value.trim() } : undefined,
  })
}

onMounted(() => {
  loadHotPlaces()
  loadTravelNews()
})
</script>

<style scoped>
.home-page {
  color: var(--et-gray-900);
}

.home-container {
  width: min(100% - 48px, 1080px);
  margin: 0 auto;
}

.home-hero {
  position: relative;
  min-height: 360px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: var(--et-gray-900);
}

.home-hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 45%;
}

.home-hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.15));
}

.home-hero-inner {
  position: relative;
  z-index: 1;
  padding: 56px 0;
}

.home-hero-copy {
  max-width: 590px;
  color: #fff;
}

.home-hero h1 {
  margin: 0 0 8px;
  font-size: 40px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.home-hero p {
  margin: 0 0 24px;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.94);
}

.home-search {
  width: min(100%, 520px);
  height: 54px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 6px 5px 20px;
  border-radius: var(--radius-pill);
  background: #fff;
  box-shadow: var(--shadow-lg);
}

.home-search > i {
  color: var(--et-gray-400);
  font-size: 18px;
}

.home-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  color: var(--et-gray-900);
  background: transparent;
}

.home-search input::placeholder {
  color: var(--et-gray-500);
}

.home-search button {
  height: 44px;
  padding: 0 24px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
}

.home-category-band {
  border-bottom: 1px solid var(--border-default);
  background: #fff;
}

.home-categories {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 8px 22px;
  overflow-x: auto;
  scrollbar-width: none;
}

.home-categories::-webkit-scrollbar {
  display: none;
}

.home-category {
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--et-gray-900);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.home-category-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 22px;
  transition: all 0.2s ease;
}

.home-category.active .home-category-icon {
  background: var(--primary-color);
  color: #fff;
}

.home-category:hover .home-category-icon {
  transform: translateY(-2px);
  background: var(--et-blue-100);
}

.home-category.active:hover .home-category-icon {
  background: var(--primary-hover);
}

.home-content {
  background: #fff;
}

.planner-banner {
  min-height: 88px;
  margin-top: 24px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-radius: 12px;
  background: var(--primary-color);
  color: #fff;
}

.planner-banner-copy {
  display: flex;
  align-items: center;
  gap: 16px;
}

.planner-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  font-size: 21px;
}

.planner-banner strong {
  display: block;
  font-size: 17px;
}

.planner-banner p {
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
}

.planner-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 11px 19px;
  border-radius: 8px;
  background: #fff;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.home-section {
  padding: 40px 0 48px;
}

.home-section-heading {
  margin-bottom: 18px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.home-section-heading h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.home-section-heading p {
  margin: 5px 0 0;
  color: var(--et-gray-500);
  font-size: 14px;
}

.home-section-heading > a {
  color: var(--et-gray-500);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.place-card {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.place-image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  margin-bottom: 9px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--et-gray-100);
}

.place-image-wrap img,
.hot-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.place-card:hover img,
.hot-card:hover img {
  transform: scale(1.04);
}

.place-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  min-width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: rgba(25, 31, 40, 0.8);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.place-region {
  display: block;
  color: var(--et-gray-500);
  font-size: 12px;
}

.place-card > strong {
  display: block;
  margin: 2px 0;
  overflow: hidden;
  color: var(--et-gray-900);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  color: var(--et-gray-700);
  font-size: 13px;
}

.place-rating i,
.hot-card-meta i {
  color: var(--et-warning);
}

.place-rating small {
  color: var(--et-gray-500);
}

.hot-section {
  background: var(--et-gray-100);
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.hot-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #fff;
  color: inherit;
  text-decoration: none;
}

.hot-image-wrap {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.hot-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--et-sale-500);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.hot-card-body {
  padding: 12px 14px 14px;
}

.hot-card-meta {
  margin-bottom: 3px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--et-gray-500);
  font-size: 12px;
}

.hot-card-body > strong {
  color: var(--et-gray-900);
  font-size: 14px;
  font-weight: 600;
}

.news-section {
  background: #fff;
}

.home-news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.home-news-card {
  min-width: 0;
  height: 112px;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.home-news-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.home-news-thumb {
  width: 98px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 30px;
}

.home-empty {
  margin: 0;
  padding: 28px 0;
  color: var(--et-gray-500);
  font-size: 14px;
  text-align: center;
}

.home-news-body {
  min-width: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.news-tag {
  margin-bottom: 5px;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 11px;
  font-weight: 700;
}

.home-news-body strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--et-gray-900);
  font-size: 14px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.home-news-body small {
  margin-top: auto;
  color: var(--et-gray-400);
  font-size: 11px;
}

@media (max-width: 991.98px) {
  .popular-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-news-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .home-container {
    width: min(100% - 32px, 1080px);
  }

  .home-hero {
    min-height: 390px;
  }

  .home-hero h1 {
    font-size: 34px;
  }

  .home-categories {
    padding-inline: 0;
  }

  .planner-banner {
    align-items: stretch;
    flex-direction: column;
  }

  .planner-button {
    justify-content: center;
  }

  .popular-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 479.98px) {
  .home-search {
    padding-left: 14px;
  }

  .home-search button {
    padding: 0 18px;
  }

  .hot-grid {
    grid-template-columns: 1fr;
  }

  .home-section-heading {
    align-items: flex-start;
  }
}
</style>
