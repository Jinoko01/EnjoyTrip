<script setup lang="ts">
import BoardCard from '@/components/board/BoardCard.vue'
import BoardFeaturedCard from '@/components/board/BoardFeaturedCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import { useBoardList } from '@/composables/useBoardList'
import { useAuthStore } from '@/stores/auth'
import { BOARD_CATEGORY_TABS } from '@/utils/boardPresentation'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// 헤더 통합검색에서 넘어온 키워드를 검색창에 미리 채워 둔다.
const initialKeyword = typeof route.query.keyword === 'string' ? route.query.keyword : ''
const {
  loading,
  searchKeyword,
  activeCategory,
  filteredBoards,
  featured,
  showFeatured,
  pagedBoards,
  currentPage,
  totalPages,
} = useBoardList(initialKeyword)

function openBoard(boardNo: number) {
  router.push(`/board/${boardNo}`)
}

function goWrite() {
  router.push('/board/write')
}
</script>

<template>
  <header class="custom-page-header border-bottom">
    <div class="container header-content">
      <i class="bi bi-chat-dots text-primary display-4 mb-3 d-inline-block"></i>
      <h1 class="fw-bold">커뮤니티</h1>
      <p class="lead text-muted mb-0">여행에 관한 모든 것, 자유롭게 이야기 나눠요.</p>
    </div>
  </header>

  <main class="container board-page mb-5 pb-5">
    <!-- 인기글 배너 -->
    <BoardFeaturedCard v-if="showFeatured && featured" :board="featured" @select="openBoard" />

    <!-- 검색 + 카테고리 탭 + 글쓰기 -->
    <div class="board-toolbar">
      <form class="board-search" role="search" @submit.prevent>
        <i class="bi bi-search" aria-hidden="true"></i>
        <input
          v-model="searchKeyword"
          type="search"
          placeholder="제목·작성자 검색"
          aria-label="커뮤니티 게시글 검색"
        />
      </form>

      <div class="board-tabs" role="tablist">
        <button
          v-for="tab in BOARD_CATEGORY_TABS"
          :key="tab"
          type="button"
          class="board-tabs__tab"
          :class="{ 'is-active': activeCategory === tab }"
          role="tab"
          :aria-selected="activeCategory === tab"
          @click="activeCategory = tab"
        >
          {{ tab }}
        </button>
      </div>

      <button v-if="auth.user" class="btn btn-custom board-write-btn" @click="goWrite">
        <i class="bi bi-pencil-square me-1"></i>글쓰기
      </button>
      <RouterLink v-else to="/login" class="btn btn-custom board-write-btn">
        <i class="bi bi-pencil-square me-1"></i>글쓰기
      </RouterLink>
    </div>

    <!-- 목록 -->
    <div class="board-list">
      <template v-if="loading">
        <div v-for="n in 6" :key="n" class="board-skeleton">
          <SkeletonBox width="132px" height="90px" radius="8px" />
          <div class="board-skeleton__body">
            <SkeletonBox width="55%" height="18px" />
            <SkeletonBox width="90%" height="14px" />
            <SkeletonBox width="40%" height="12px" />
          </div>
        </div>
      </template>

      <template v-else-if="filteredBoards.length === 0">
        <div class="board-empty">
          <i class="bi bi-chat-left-dots"></i>
          <p v-if="searchKeyword.trim()">'{{ searchKeyword }}'에 대한 검색 결과가 없습니다.</p>
          <p v-else>등록된 게시글이 없습니다. 첫 글을 작성해보세요!</p>
        </div>
      </template>

      <template v-else>
        <BoardCard v-for="b in pagedBoards" :key="b.boardNo" :board="b" @select="openBoard" />
      </template>
    </div>

    <Pagination
      v-if="!loading && filteredBoards.length > 0"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      class="board-pagination"
    />
  </main>
</template>

<style scoped>
.board-page {
  padding-top: 4px;
}

.board-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.board-tags__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 2px;
  color: var(--et-gray-900);
  font-size: 0.875rem;
  font-weight: 700;
}
.board-tags__label i {
  color: var(--primary-color);
}
.board-tags__tag {
  padding: 5px 12px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--et-gray-100);
  color: var(--et-gray-700);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.board-tags__tag:hover {
  background: var(--et-blue-wash);
  color: var(--primary-color);
}

.board-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.board-search {
  position: relative;
  display: flex;
  align-items: center;
}
.board-search > i {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  font-size: 0.9rem;
  pointer-events: none;
}
.board-search input {
  width: 240px;
  max-width: 100%;
  padding: 8px 14px 8px 34px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-pill);
  font-size: 0.875rem;
  background: #fff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.board-search input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--ring-focus);
}

.board-tabs {
  display: flex;
  gap: 6px;
}
.board-tabs__tab {
  padding: 8px 16px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--et-gray-100);
  color: var(--et-gray-700);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.board-tabs__tab.is-active {
  background: var(--primary-color);
  color: #fff;
}

.board-write-btn {
  margin-left: auto;
}

.board-list {
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.board-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-default);
}
.board-skeleton:first-child {
  border-top: none;
}
.board-skeleton__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-empty {
  padding: 64px 16px;
  text-align: center;
  color: var(--text-muted);
}
.board-empty i {
  font-size: 2.6rem;
  opacity: 0.5;
}
.board-empty p {
  margin: 14px 0 0;
}

.board-pagination {
  margin-top: 24px;
}

@media (max-width: 575.98px) {
  .board-write-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>
