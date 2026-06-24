<script setup lang="ts">
import { ref } from 'vue'

export interface CommentItem {
  id: number
  authorName: string
  userId?: string
  content: string
  createdAt: string
}

// 댓글 표시·작성 UI 전용 컴포넌트.
// 데이터(목록)는 부모가 소유하고, 작성/삭제는 이벤트로 위임한다. (props down / events up)
// NOTE: 댓글 영속화 백엔드(API·테이블)는 아직 없어 부모에서 로컬 상태로만 관리한다.
const props = defineProps<{
  comments: CommentItem[]
  canComment: boolean
  currentUserId?: string
}>()

const emit = defineEmits<{
  (e: 'submit', content: string): void
  (e: 'delete', id: number): void
}>()

const AVATAR_COLORS = ['#00b894', '#ff9f0a', '#0087ff', '#7c5cff', '#e84393']
const draft = ref('')

function avatarColor(name: string) {
  let sum = 0
  for (const ch of name) sum += ch.charCodeAt(0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function submit() {
  const content = draft.value.trim()
  if (!content) return
  emit('submit', content)
  draft.value = ''
}
</script>

<template>
  <section class="comment-section">
    <h3 class="comment-heading">
      댓글 <span class="comment-count">{{ props.comments.length }}</span>
    </h3>

    <form v-if="props.canComment" class="comment-form" @submit.prevent="submit">
      <textarea
        v-model="draft"
        class="comment-input"
        rows="3"
        placeholder="따뜻한 댓글을 남겨주세요."
      ></textarea>
      <div class="comment-form-actions">
        <button type="submit" class="btn btn-custom btn-sm" :disabled="!draft.trim()">등록</button>
      </div>
    </form>
    <RouterLink v-else to="/login" class="comment-login-prompt">
      <i class="bi bi-lock me-1"></i>로그인 후 댓글을 작성할 수 있습니다.
    </RouterLink>

    <ul v-if="props.comments.length" class="comment-list">
      <li v-for="c in props.comments" :key="c.id" class="comment-item">
        <span class="comment-avatar" :style="{ backgroundColor: avatarColor(c.authorName) }">
          {{ c.authorName.charAt(0) }}
        </span>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">{{ c.authorName }}</span>
            <span class="comment-date">{{ c.createdAt }}</span>
            <button
              v-if="props.currentUserId && props.currentUserId === c.userId"
              type="button"
              class="comment-delete"
              aria-label="댓글 삭제"
              @click="emit('delete', c.id)"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
          <p class="comment-text">{{ c.content }}</p>
        </div>
      </li>
    </ul>
    <p v-else class="comment-empty">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
  </section>
</template>

<style scoped>
.comment-section {
  padding-top: 28px;
  border-top: 1px solid var(--border-default);
}

.comment-heading {
  margin: 0 0 16px;
  color: var(--et-gray-900);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.comment-count {
  color: var(--primary-color);
}

.comment-form {
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background: #fff;
  resize: none;
}

.comment-input:focus {
  border-color: var(--primary-color);
  outline: 0;
  box-shadow: var(--ring-focus);
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-login-prompt {
  display: block;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--et-gray-50);
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
  text-decoration: none;
}

.comment-login-prompt:hover {
  color: var(--primary-color);
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  display: inline-flex;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.comment-author {
  color: var(--et-gray-800);
  font-size: 0.85rem;
  font-weight: 800;
}

.comment-date {
  color: var(--et-gray-400);
  font-size: 0.72rem;
}

.comment-delete {
  margin-left: auto;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--et-gray-400);
  font-size: 1rem;
  line-height: 1;
}

.comment-delete:hover {
  color: var(--et-sale-500);
}

.comment-text {
  margin: 0;
  color: var(--et-gray-700);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-empty {
  padding: 28px 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  text-align: center;
}
</style>
