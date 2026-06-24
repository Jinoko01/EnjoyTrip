<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { useSchedules, type Schedule } from '@/composables/useSchedules'
import {
  BOARD_WRITE_CATEGORIES,
  deriveBoardCategory,
  placeholderGradient,
  type BoardCategory,
} from '@/utils/boardPresentation'
import type { Board, LinkedSchedule } from '@/types/board'
import SchedulePickerModal from '@/components/board/SchedulePickerModal.vue'

const route = useRoute()
const router = useRouter()

const editBoardNo = computed(() => {
  const raw = route.params.boardNo
  return raw ? Number(raw) : null
})
const isEdit = computed(() => editBoardNo.value !== null)

const form = ref({ title: '', content: '' })
// 카테고리는 백엔드에 저장되지 않는 프론트 전용 선택값이다.
const category = ref<BoardCategory>('여행후기')
const sharedSchedule = ref<LinkedSchedule | null>(null)
const submitting = ref(false)
const pickerOpen = ref(false)

const { schedules, loading: schedulesLoading } = useSchedules()

const canSubmit = computed(() => form.value.title.trim() !== '' && form.value.content.trim() !== '')

function goBack() {
  if (isEdit.value) router.push(`/board/${editBoardNo.value}`)
  else router.push('/board')
}

function selectSchedule(schedule: Schedule) {
  sharedSchedule.value = {
    scheduleId: schedule.scheduleId,
    title: schedule.title,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    itemCount: schedule.itemCount,
  }
  pickerOpen.value = false
}

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  const payload = {
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    scheduleId: sharedSchedule.value?.scheduleId ?? null,
  }
  try {
    if (isEdit.value) {
      await api.put(`/board/${editBoardNo.value}`, payload)
      router.push(`/board/${editBoardNo.value}`)
    } else {
      await api.post('/board', payload)
      router.push('/board')
    }
  } catch {
    alert(isEdit.value ? '수정에 실패했습니다.' : '등록에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!isEdit.value) return
  try {
    const res = await api.get<Board>(`/board/${editBoardNo.value}`)
    form.value = { title: res.data.title, content: res.data.content ?? '' }
    category.value = deriveBoardCategory(res.data.boardNo)
    sharedSchedule.value = res.data.linkedSchedule ?? null
  } catch {
    alert('게시글을 불러오지 못했습니다.')
    router.replace('/board')
  }
})
</script>

<template>
  <div class="bw-topbar">
    <div class="container">
      <button type="button" class="bw-back" @click="goBack">
        <i class="bi bi-chevron-left"></i> 커뮤니티
      </button>
    </div>
  </div>

  <header class="custom-page-header border-bottom">
    <div class="container header-content">
      <i class="bi bi-pencil-square text-primary display-4 mb-3 d-inline-block"></i>
      <h1 class="fw-bold">{{ isEdit ? '글 수정' : '글쓰기' }}</h1>
      <p class="lead text-muted mb-0">여행 이야기를 자유롭게 들려주세요.</p>
    </div>
  </header>

  <main class="container bw-write">
    <form class="bw-card" @submit.prevent="submit">
      <div class="bw-field">
        <span class="bw-label">카테고리</span>
        <div class="bw-chips">
          <button
            v-for="c in BOARD_WRITE_CATEGORIES"
            :key="c"
            type="button"
            class="bw-chip"
            :class="{ 'is-active': category === c }"
            @click="category = c"
          >
            {{ c }}
          </button>
        </div>
      </div>

      <div class="bw-field">
        <label class="bw-label" for="bw-title">제목</label>
        <input
          id="bw-title"
          v-model="form.title"
          type="text"
          class="form-control"
          placeholder="제목을 입력하세요"
          maxlength="100"
          required
        />
      </div>

      <div class="bw-field">
        <label class="bw-label" for="bw-content">내용</label>
        <textarea
          id="bw-content"
          v-model="form.content"
          class="form-control bw-content"
          placeholder="여행 후기, 질문, 추천 코스 등 자유롭게 작성해주세요."
          rows="12"
          required
        ></textarea>
      </div>

      <div class="bw-field">
        <span class="bw-label">사진 첨부</span>
        <div class="bw-dropzone" aria-disabled="true">
          <i class="bi bi-images"></i>
          <span>사진 업로드는 준비 중이에요</span>
        </div>
      </div>

      <div class="bw-field">
        <span class="bw-label"> 내 일정 공유 <span class="bw-optional">(선택)</span> </span>

        <div v-if="sharedSchedule" class="bw-shared">
          <span
            class="bw-shared__thumb"
            :style="{ background: placeholderGradient(sharedSchedule.scheduleId) }"
          >
            <i class="bi bi-map"></i>
          </span>
          <div class="bw-shared__info">
            <span class="bw-shared__tag"><i class="bi bi-map"></i> 연결될 일정</span>
            <div class="bw-shared__title">{{ sharedSchedule.title }}</div>
            <div class="bw-shared__sub">
              <span
                ><i class="bi bi-calendar-event"></i>{{ sharedSchedule.startDate }} ~
                {{ sharedSchedule.endDate }}</span
              >
              <span>여행지 {{ sharedSchedule.itemCount ?? 0 }}곳</span>
            </div>
          </div>
          <button
            type="button"
            class="bw-shared__remove"
            aria-label="공유 해제"
            @click="sharedSchedule = null"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <button v-else type="button" class="bw-share-btn" @click="pickerOpen = true">
          <i class="bi bi-map"></i> 내 일정 불러와 공유하기
        </button>
      </div>

      <div class="bw-footer">
        <button type="button" class="btn btn-light" @click="goBack">취소</button>
        <button type="submit" class="btn btn-custom" :disabled="!canSubmit || submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ isEdit ? '수정 완료' : '등록하기' }}
        </button>
      </div>
    </form>
  </main>

  <SchedulePickerModal
    :open="pickerOpen"
    :schedules="schedules"
    :loading="schedulesLoading"
    @close="pickerOpen = false"
    @select="selectSchedule"
  />
</template>

<style scoped>
.bw-topbar {
  background: var(--surface-section);
  border-bottom: 1px solid var(--border-default);
}
.bw-topbar .container {
  max-width: 800px;
  padding-top: 16px;
  padding-bottom: 16px;
}
.bw-back {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--et-gray-600);
  font-size: 0.9rem;
  font-weight: 700;
}
.bw-back:hover {
  color: var(--primary-color);
}

.bw-write {
  max-width: 800px;
  padding-bottom: 80px;
}

.bw-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px;
  background: #fff;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.bw-field {
  display: flex;
  flex-direction: column;
}
.bw-label {
  margin-bottom: 8px;
  color: var(--et-gray-800);
  font-size: 0.9rem;
  font-weight: 600;
}
.bw-optional {
  color: var(--et-gray-400);
  font-weight: 400;
}

.bw-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bw-chip {
  padding: 7px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--et-gray-700);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.bw-chip.is-active {
  border-color: var(--primary-color);
  background: var(--et-blue-wash);
  color: var(--primary-color);
}

.bw-content {
  resize: vertical;
  line-height: 1.7;
}

.bw-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--et-gray-50);
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}
.bw-dropzone i {
  font-size: 1.4rem;
}

.bw-share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 18px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--et-blue-wash);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.bw-share-btn:hover {
  border-color: var(--primary-color);
}

.bw-shared {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.bw-shared__thumb {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 96px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.3rem;
}
.bw-shared__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 14px;
}
.bw-shared__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.bw-shared__title {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--et-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bw-shared__sub {
  display: flex;
  gap: 12px;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 0.78rem;
}
.bw-shared__sub i {
  margin-right: 4px;
}
.bw-shared__remove {
  border: 0;
  background: transparent;
  color: var(--et-gray-400);
  padding: 0 14px;
  cursor: pointer;
}
.bw-shared__remove:hover {
  color: var(--et-sale-500);
}

.bw-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}
</style>
