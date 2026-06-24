<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import { placeholderGradient, toExcerpt } from '@/utils/boardPresentation'
import type { BoardListItem } from '@/types/board'

// 이번 주 인기글 대형 배너. 이미지가 없어 색상 그라데이션을 커버로 사용한다.
const props = defineProps<{ board: BoardListItem }>()
const emit = defineEmits<{ (e: 'select', boardNo: number): void }>()

const cover = computed(() => placeholderGradient(props.board.boardNo))
const excerpt = computed(() => toExcerpt(props.board.content, 110))
</script>

<template>
  <div
    class="featured"
    role="button"
    tabindex="0"
    @click="emit('select', board.boardNo)"
    @keydown.enter="emit('select', board.boardNo)"
  >
    <div class="featured__cover" :style="{ background: cover }"></div>
    <div class="featured__scrim"></div>
    <div class="featured__content">
      <span class="featured__pill"
        ><i class="bi bi-fire" aria-hidden="true"></i> 이번 주 인기글</span
      >
      <h2 class="featured__title">{{ board.title }}</h2>
      <p v-if="excerpt" class="featured__excerpt">{{ excerpt }}</p>
      <div class="featured__meta">
        <span class="featured__author">
          <UserAvatar :name="board.authorName" :size="26" />
          {{ board.authorName }}
        </span>
        <span><i class="bi bi-heart-fill" aria-hidden="true"></i>{{ board.likeCount }}</span>
        <span><i class="bi bi-eye-fill" aria-hidden="true"></i>{{ board.hit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured {
  position: relative;
  min-height: 240px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 28px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}
.featured:focus-visible {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

.featured__cover,
.featured__scrim {
  position: absolute;
  inset: 0;
}
.featured__scrim {
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.25) 55%,
    rgba(0, 0, 0, 0.05) 100%
  );
}

.featured__content {
  position: relative;
  max-width: 680px;
  padding: 28px 30px;
  color: #fff;
}
.featured__pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--et-sale-500);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.featured__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.featured__excerpt {
  margin: 10px 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.featured__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.92);
}
.featured__author {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
}
.featured__meta i {
  margin-right: 4px;
}

@media (max-width: 575.98px) {
  .featured__title {
    font-size: 1.25rem;
  }
}
</style>
