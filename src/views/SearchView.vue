<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUnifiedSearch } from '@/composables/useUnifiedSearch'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import SearchResultSection from '@/components/search/SearchResultSection.vue'
import HotPlaceResultItem from '@/components/search/HotPlaceResultItem.vue'
import BoardResultItem from '@/components/search/BoardResultItem.vue'
import NewsResultItem from '@/components/search/NewsResultItem.vue'
import NoticeResultItem from '@/components/search/NoticeResultItem.vue'

const route = useRoute()
const keyword = computed(() => (typeof route.query.keyword === 'string' ? route.query.keyword : ''))

const { result, loading, error } = useUnifiedSearch(keyword)

const hasKeyword = computed(() => keyword.value.trim() !== '')
const isEmpty = computed(
  () => hasKeyword.value && !loading.value && !error.value && result.value.total === 0,
)
</script>

<template>
  <main class="search-page">
    <section class="search-hero">
      <div class="search-container">
        <h1 class="search-heading"><i class="bi bi-search" aria-hidden="true"></i> 통합 검색</h1>
        <p v-if="hasKeyword" class="search-summary">
          '<b>{{ keyword }}</b
          >' 검색 결과 {{ result.total }}건
        </p>
        <p v-else class="search-summary">
          검색어를 입력해 핫플레이스·커뮤니티·여행뉴스·공지사항을 한 번에 찾아보세요.
        </p>
      </div>
    </section>

    <div class="search-container search-body">
      <div v-if="loading" class="search-skeleton">
        <section v-for="s in 2" :key="s" class="sk-section">
          <div class="sk-heading"><SkeletonBox width="150px" height="20px" /></div>
          <div class="sk-card">
            <div v-for="r in 3" :key="r" class="sk-row">
              <SkeletonBox width="64px" height="24px" radius="6px" />
              <div class="sk-row-main">
                <SkeletonBox width="60%" height="15px" />
                <SkeletonBox width="40%" height="12px" />
              </div>
              <SkeletonBox width="72px" height="13px" />
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="error" class="search-state">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <p>검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      </div>

      <div v-else-if="isEmpty" class="search-state">
        <i class="bi bi-search" aria-hidden="true"></i>
        <p>'{{ keyword }}'에 대한 검색 결과가 없습니다.</p>
      </div>

      <template v-else-if="hasKeyword">
        <SearchResultSection
          v-if="result.hotplaces.length"
          icon="fire"
          icon-class="icon-hot"
          title="핫플레이스"
          :count="result.hotplaces.length"
          :more-to="{ path: '/hotplace', query: { keyword } }"
          more-label="핫플레이스 전체보기"
        >
          <HotPlaceResultItem
            v-for="item in result.hotplaces"
            :key="item.hotPlaceId"
            :item="item"
            :keyword="keyword"
          />
        </SearchResultSection>

        <SearchResultSection
          v-if="result.boards.length"
          icon="chat-dots-fill"
          icon-class="icon-community"
          title="커뮤니티"
          :count="result.boards.length"
          :more-to="{ path: '/board', query: { keyword } }"
          more-label="커뮤니티 전체보기"
        >
          <BoardResultItem
            v-for="item in result.boards"
            :key="item.boardNo"
            :item="item"
            :keyword="keyword"
          />
        </SearchResultSection>

        <SearchResultSection
          v-if="result.news.length"
          icon="newspaper"
          icon-class="icon-news"
          title="여행뉴스"
          :count="result.news.length"
          :more-to="{ path: '/news' }"
          more-label="여행뉴스 전체보기"
        >
          <NewsResultItem
            v-for="(item, index) in result.news"
            :key="index"
            :item="item"
            :keyword="keyword"
          />
        </SearchResultSection>

        <SearchResultSection
          v-if="result.notices.length"
          icon="megaphone-fill"
          icon-class="icon-notice"
          title="공지사항"
          :count="result.notices.length"
          :more-to="{ path: '/notice' }"
          more-label="공지사항 전체보기"
        >
          <NoticeResultItem
            v-for="item in result.notices"
            :key="item.noticeNo"
            :item="item"
            :keyword="keyword"
          />
        </SearchResultSection>
      </template>
    </div>
  </main>
</template>

<style scoped>
.search-page {
  min-height: calc(100vh - 64px);
  background: #fff;
  color: var(--et-gray-900);
}

.search-container {
  width: min(100% - 48px, 1080px);
  margin: 0 auto;
}

.search-hero {
  padding: 36px 0;
  background: var(--et-gray-50);
  border-bottom: 1px solid var(--border-default);
}

.search-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.search-heading > i {
  color: var(--primary-color);
}

.search-summary {
  margin: 10px 0 0;
  color: var(--et-gray-600);
  font-size: 15px;
}

.search-summary b {
  color: var(--primary-color);
  font-weight: 700;
}

.search-body {
  padding: 36px 0 64px;
}

.search-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 0;
  color: var(--et-gray-500);
}

.sk-section {
  margin-bottom: 36px;
}

.sk-heading {
  margin-bottom: 12px;
}

.sk-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #fff;
}

.sk-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-default);
}

.sk-row:last-child {
  border-bottom: 0;
}

.sk-row-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-state > i {
  font-size: 44px;
}

.search-state p {
  margin: 0;
  font-size: 15px;
}

.icon-hot {
  color: var(--et-sale-500);
}

.icon-community,
.icon-news {
  color: var(--primary-color);
}

.icon-notice {
  color: var(--et-warning, #f5a623);
}

@media (max-width: 767.98px) {
  .search-container {
    width: min(100% - 32px, 1080px);
  }

  .search-heading {
    font-size: 24px;
  }
}
</style>
