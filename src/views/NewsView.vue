<template>
  <header class="custom-page-header border-bottom">
    <div class="container header-content">
      <i class="bi bi-newspaper text-primary display-4 mb-3 d-inline-block"></i>
      <h1 class="fw-bold">여행뉴스</h1>
      <p class="lead text-muted mb-0">여행 매체의 최신 소식을 모았어요.</p>
    </div>
  </header>

  <main class="container mb-5 pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="text-muted small">
        <i class="bi bi-clock me-1"></i>
        최근 수집: <strong>{{ lastCrawledAt || '정보 없음' }}</strong>
      </div>
      <button class="btn btn-custom" :disabled="refreshing" @click="refreshNews">
        <span v-if="refreshing" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="bi bi-arrow-clockwise me-1"></i>
        뉴스 새로고침
      </button>
    </div>

    <div v-if="error" class="alert alert-warning d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>{{ error }}</span>
    </div>

    <div v-if="loading" class="row g-4">
      <div v-for="i in 6" :key="i" class="col-md-6 col-lg-4">
        <div class="card news-card h-100 border-0 shadow-sm">
          <div class="card-body p-4 d-flex flex-column">
            <div class="mb-2"><SkeletonBox width="110px" height="22px" radius="999px" /></div>
            <SkeletonBox width="90%" height="18px" />
            <div class="mt-1"><SkeletonBox width="70%" height="18px" /></div>
            <div class="mt-3 d-flex flex-column gap-2">
              <SkeletonBox width="100%" height="13px" />
              <SkeletonBox width="95%" height="13px" />
              <SkeletonBox width="60%" height="13px" />
            </div>
            <div class="mt-3 pt-3 border-top">
              <SkeletonBox width="100%" height="31px" radius="6px" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="newsList.length === 0 && !error" class="text-center py-5 text-muted">
      <i class="bi bi-newspaper display-1 mb-3 d-block opacity-25"></i>
      <h5>수집된 뉴스가 없습니다.</h5>
      <p>새로고침 버튼을 눌러 최신 뉴스를 불러오세요.</p>
    </div>

    <div v-else class="row g-4">
      <div v-for="(news, idx) in pagedNews" :key="idx" class="col-md-6 col-lg-4 animate-fade-in-up">
        <div class="card news-card h-100 border-0 shadow-sm">
          <div class="card-body p-4 d-flex flex-column">
            <div class="mb-2">
              <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small">
                <i class="bi bi-calendar3 me-1"></i>{{ formatDate(news.pubDate) }}
              </span>
            </div>
            <h6 class="card-title fw-bold text-dark mb-2" style="line-height: 1.5">
              <a
                :href="news.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-dark text-decoration-none stretched-link-title"
              >
                {{ stripHtml(news.title) }}
              </a>
            </h6>
            <p
              class="card-text text-muted small flex-grow-1"
              style="
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.6;
              "
            >
              {{ stripHtml(news.description) }}
            </p>
            <div class="mt-3 pt-3 border-top">
              <a
                :href="news.link"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-outline-primary w-100"
              >
                <i class="bi bi-box-arrow-up-right me-1"></i>전체 기사 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Pagination v-if="!loading" v-model:current-page="currentPage" :total-pages="totalPages" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/usePagination'

interface NewsItem {
  title: string
  description: string
  link: string
  pubDate: string
}

const newsList = ref<NewsItem[]>([])
const lastCrawledAt = ref('')
const loading = ref(false)
const refreshing = ref(false)
const error = ref('')

const NEWS_PER_PAGE = 9
const { currentPage, totalPages, pagedItems: pagedNews } = usePagination(newsList, NEWS_PER_PAGE)

function stripHtml(html: string): string {
  return (
    html
      ?.replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"') ?? ''
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

async function loadNews() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/news')
    newsList.value = res.data.newsList ?? []
    lastCrawledAt.value = res.data.lastCrawledAt ?? ''
  } catch (e: any) {
    error.value = e?.response?.data?.error ?? '뉴스를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

async function refreshNews() {
  refreshing.value = true
  error.value = ''
  try {
    await api.post('/news/refresh')
    await loadNews()
  } catch (e: any) {
    error.value = e?.response?.data?.error ?? '뉴스 새로고침 중 오류가 발생했습니다.'
  } finally {
    refreshing.value = false
  }
}

onMounted(loadNews)
</script>

<style scoped>
.news-card {
  border: 1px solid var(--border-default) !important;
  border-radius: 12px !important;
  box-shadow: var(--shadow-sm) !important;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.news-card:hover {
  transform: translateY(-2px);
  border-color: transparent !important;
  box-shadow: var(--shadow-lg) !important;
}

/* 모바일: 큼직한 카드 대신 촘촘한 리스트로 표시 */
@media (max-width: 767.98px) {
  .row.g-4 {
    --bs-gutter-y: 0.625rem;
  }
  .news-card .card-body {
    padding: 14px 16px !important;
  }
  .news-card .card-title {
    margin-bottom: 6px !important;
    font-size: 0.95rem;
  }
  .news-card .card-text {
    margin-bottom: 0;
    font-size: 0.8rem;
    -webkit-line-clamp: 2 !important;
  }
  .news-card .border-top {
    margin-top: 12px !important;
    padding-top: 12px !important;
  }
}
</style>
