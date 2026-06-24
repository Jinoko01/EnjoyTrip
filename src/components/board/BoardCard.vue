<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import {
  categoryBadge,
  placeholderGradient,
  toDateOnly,
  toExcerpt,
} from '@/utils/boardPresentation'
import type { BoardListItem } from '@/types/board'

// 커뮤니티 목록의 글 한 줄(카드). 표현만 담당하고 클릭은 부모에 위임한다.
const props = defineProps<{ board: BoardListItem }>()
const emit = defineEmits<{ (e: 'select', boardNo: number): void }>()

const badge = computed(() => categoryBadge(props.board.category))
const thumbnail = computed(() => placeholderGradient(props.board.boardNo))
const excerpt = computed(() => toExcerpt(props.board.content))
const date = computed(() => toDateOnly(props.board.registerTime))
</script>

<template>
  <div
    class="board-card"
    role="button"
    tabindex="0"
    @click="emit('select', board.boardNo)"
    @keydown.enter="emit('select', board.boardNo)"
  >
    <div class="board-card__thumb" :style="{ background: thumbnail }">
      <img v-if="board.coverImage" :src="board.coverImage" alt="" class="board-card__img" />
      <i v-else class="bi bi-card-image" aria-hidden="true"></i>
      <span class="board-card__badge" :style="{ color: badge.color, background: badge.background }">
        {{ board.category }}
      </span>
    </div>

    <div class="board-card__body">
      <h3 class="board-card__title">{{ board.title }}</h3>
      <p class="board-card__excerpt">{{ excerpt }}</p>
      <div class="board-card__meta">
        <span class="board-card__author">
          <UserAvatar :name="board.authorName" :size="20" />
          {{ board.authorName }}
        </span>
        <span>{{ date }}</span>
        <span><i class="bi bi-heart" aria-hidden="true"></i>{{ board.likeCount }}</span>
        <span><i class="bi bi-eye" aria-hidden="true"></i>{{ board.hit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-default);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.board-card:first-child {
  border-top: none;
}
.board-card:hover {
  background: var(--et-gray-50);
}
.board-card:focus-visible {
  outline: none;
  background: var(--et-blue-wash);
}

.board-card__thumb {
  position: relative;
  flex-shrink: 0;
  width: 132px;
  height: 90px;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
  font-size: 1.6rem;
}
.board-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.board-card__badge {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  font-weight: 700;
}

.board-card__body {
  flex: 1;
  min-width: 0;
}
.board-card__title {
  margin: 0 0 5px;
  color: var(--et-gray-900);
  font-size: 1.02rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.board-card__excerpt {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.board-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 9px;
  color: var(--text-muted);
  font-size: 0.78rem;
}
.board-card__author {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: var(--et-gray-700);
}
.board-card__meta i {
  margin-right: 3px;
}

@media (max-width: 575.98px) {
  .board-card__thumb {
    width: 92px;
    height: 70px;
  }
}
</style>
