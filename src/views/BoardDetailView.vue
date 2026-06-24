<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useReactions } from '@/composables/useReactions'
import CommentSection, { type CommentItem } from '@/components/CommentSection.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import {
  categoryBadge,
  deriveBoardCategory,
  placeholderGradient,
  toDateOnly,
} from '@/utils/boardPresentation'
import type { Board } from '@/types/board'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const boardNo = Number(route.params.boardNo)

const board = ref<Board | null>(null)
const loading = ref(true)
const scrapped = ref(false)
const { liked, likeCount, syncFrom, toggleLike } = useReactions('/board', boardNo)

// 댓글은 영속화 백엔드가 아직 없어 화면 세션 동안만 유지되는 로컬 상태로 둔다.
const comments = ref<CommentItem[]>([])
let commentSeq = 0

const category = computed(() => deriveBoardCategory(boardNo))
const badge = computed(() => categoryBadge(category.value))
const cover = computed(() => placeholderGradient(boardNo))
const date = computed(() => toDateOnly(board.value?.registerTime))
const isAuthor = computed(() => !!auth.user && auth.user.userId === board.value?.userId)
const linkedSchedule = computed(() => board.value?.linkedSchedule ?? null)

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

function onScrap() {
  if (!requireLogin()) return
  // 스크랩 영속화 백엔드가 없어 화면 내 상태로만 표시한다.
  scrapped.value = !scrapped.value
}

async function shareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('링크가 복사되었습니다.')
  } catch {
    alert('링크 복사에 실패했습니다.')
  }
}

function openLinkedSchedule() {
  if (linkedSchedule.value) router.push(`/schedule-detail/${linkedSchedule.value.scheduleId}`)
}

function goEdit() {
  router.push(`/board/write/${boardNo}`)
}

async function removeBoard() {
  if (!confirm('이 게시글을 삭제하시겠습니까?')) return
  try {
    await api.delete(`/board/${boardNo}`)
    router.replace('/board')
  } catch {
    alert('삭제에 실패했습니다.')
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

onMounted(async () => {
  if (!boardNo) {
    router.replace('/board')
    return
  }
  try {
    const res = await api.get<Board>(`/board/${boardNo}`)
    board.value = res.data
    syncFrom(res.data)
  } catch {
    alert('게시글을 불러오지 못했습니다.')
    router.replace('/board')
    return
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bd-topbar">
    <div class="container">
      <RouterLink to="/board" class="bd-back">
        <i class="bi bi-chevron-left"></i> 커뮤니티
      </RouterLink>
    </div>
  </div>

  <main v-if="board" class="container bd-detail">
    <!-- 커버 (이미지 대신 색상 플레이스홀더) -->
    <div class="bd-cover" :style="{ background: cover }"></div>

    <span class="bd-category" :style="{ color: badge.color, background: badge.background }">
      {{ category }}
    </span>
    <h1 class="bd-title">{{ board.title }}</h1>

    <div class="bd-meta">
      <div class="bd-author">
        <UserAvatar :name="board.authorName" :size="38" />
        <div>
          <div class="bd-author-name">{{ board.authorName }}</div>
          <div class="bd-sub">
            <span>{{ date }}</span>
            <span class="bd-dot">·</span>
            <span><i class="bi bi-eye me-1"></i>{{ board.hit }}</span>
            <span class="bd-dot">·</span>
            <span><i class="bi bi-chat me-1"></i>{{ comments.length }}</span>
          </div>
        </div>
      </div>

      <div v-if="isAuthor" class="bd-owner-actions">
        <button type="button" class="bd-text-btn" @click="goEdit">
          <i class="bi bi-pencil me-1"></i>수정
        </button>
        <button type="button" class="bd-text-btn danger" @click="removeBoard">
          <i class="bi bi-trash me-1"></i>삭제
        </button>
      </div>
    </div>

    <article class="bd-content">{{ board.content }}</article>

    <!-- 연결된 일정 -->
    <button v-if="linkedSchedule" type="button" class="bd-schedule" @click="openLinkedSchedule">
      <span
        class="bd-schedule__thumb"
        :style="{ background: placeholderGradient(linkedSchedule.scheduleId) }"
      >
        <i class="bi bi-map"></i>
      </span>
      <span class="bd-schedule__info">
        <span class="bd-schedule__tag"><i class="bi bi-map"></i> 연결된 일정</span>
        <span class="bd-schedule__title">{{ linkedSchedule.title }}</span>
        <span class="bd-schedule__sub">
          <span
            ><i class="bi bi-calendar-event"></i>{{ linkedSchedule.startDate }} ~
            {{ linkedSchedule.endDate }}</span
          >
          <span>여행지 {{ linkedSchedule.itemCount ?? 0 }}곳</span>
        </span>
      </span>
      <span class="bd-schedule__cta">이 일정 보기 ›</span>
    </button>

    <div class="bd-actions">
      <button type="button" class="bd-action" :class="{ on: liked }" @click="onLike">
        <i :class="liked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i> 좋아요
        <span v-if="likeCount > 0" class="bd-action-count">{{ likeCount }}</span>
      </button>
      <button type="button" class="bd-action" @click="shareLink">
        <i class="bi bi-share"></i> 공유
      </button>
      <button type="button" class="bd-action" :class="{ on: scrapped }" @click="onScrap">
        <i :class="scrapped ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"></i> 스크랩
      </button>
    </div>

    <CommentSection
      :comments="comments"
      :can-comment="!!auth.user"
      :current-user-id="auth.user?.userId"
      @submit="addComment"
      @delete="removeComment"
    />

    <div class="bd-list-link">
      <RouterLink to="/board" class="btn btn-outline-custom">
        <i class="bi bi-list-ul me-1"></i>목록으로
      </RouterLink>
    </div>
  </main>

  <main v-else-if="loading" class="container bd-detail">
    <SkeletonBox width="100%" height="180px" radius="12px" />
    <div class="mt-4 mb-3"><SkeletonBox width="48px" height="24px" radius="999px" /></div>
    <div class="mb-4"><SkeletonBox width="80%" height="30px" /></div>
    <div class="bd-author">
      <SkeletonBox width="38px" height="38px" circle />
      <div>
        <SkeletonBox width="90px" height="14px" />
        <div class="mt-1"><SkeletonBox width="170px" height="12px" /></div>
      </div>
    </div>
    <div class="bd-content d-flex flex-column gap-2">
      <SkeletonBox width="100%" height="16px" />
      <SkeletonBox width="97%" height="16px" />
      <SkeletonBox width="55%" height="16px" />
    </div>
  </main>
</template>

<style scoped>
.bd-topbar {
  background: var(--surface-section);
  border-bottom: 1px solid var(--border-default);
}
.bd-topbar .container {
  max-width: 880px;
  padding-top: 16px;
  padding-bottom: 16px;
}
.bd-back {
  color: var(--et-gray-600);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}
.bd-back:hover {
  color: var(--primary-color);
}

.bd-detail {
  max-width: 880px;
  padding-top: 28px;
  padding-bottom: 80px;
}

.bd-cover {
  width: 100%;
  aspect-ratio: 21 / 8;
  margin-bottom: 22px;
  border-radius: var(--radius-lg);
}

.bd-category {
  display: inline-block;
  margin-bottom: 12px;
  padding: 4px 11px;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 700;
}
.bd-title {
  margin: 0 0 16px;
  color: var(--et-gray-900);
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.bd-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-default);
}
.bd-author {
  display: flex;
  align-items: center;
  gap: 11px;
}
.bd-author-name {
  color: var(--et-gray-900);
  font-size: 0.9rem;
  font-weight: 800;
}
.bd-sub {
  margin-top: 2px;
  color: var(--et-gray-400);
  font-size: 0.76rem;
}
.bd-dot {
  margin: 0 6px;
}
.bd-owner-actions {
  display: flex;
  gap: 6px;
}
.bd-text-btn {
  padding: 6px 10px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--et-gray-600);
  font-size: 0.82rem;
  font-weight: 700;
}
.bd-text-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.bd-text-btn.danger:hover {
  border-color: var(--et-sale-500);
  color: var(--et-sale-500);
}

.bd-content {
  min-height: 160px;
  padding: 24px 0;
  color: var(--et-gray-800);
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.bd-schedule {
  display: flex;
  align-items: stretch;
  width: 100%;
  margin-bottom: 8px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.bd-schedule:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}
.bd-schedule__thumb {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 110px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.5rem;
}
.bd-schedule__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
}
.bd-schedule__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.bd-schedule__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--et-gray-900);
}
.bd-schedule__sub {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.78rem;
}
.bd-schedule__sub i {
  margin-right: 4px;
}
.bd-schedule__cta {
  display: flex;
  align-items: center;
  padding-right: 16px;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.bd-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 24px 0 8px;
}
.bd-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--et-gray-700);
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.15s ease;
}
.bd-action:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.bd-action.on {
  border-color: var(--primary-color);
  background: var(--et-blue-wash);
  color: var(--primary-color);
}
.bd-action-count {
  min-width: 16px;
  font-variant-numeric: tabular-nums;
}

.bd-list-link {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

@media (max-width: 575.98px) {
  .bd-title {
    font-size: 1.4rem;
  }
  .bd-actions {
    flex-wrap: wrap;
  }
  .bd-schedule__cta {
    display: none;
  }
}
</style>
