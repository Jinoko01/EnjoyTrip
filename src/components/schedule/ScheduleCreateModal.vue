<template>
  <div v-if="open" class="modal show d-block" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title fw-bold">여행 일정 만들기</h5>
          <button type="button" class="btn-close" aria-label="닫기" @click="close"></button>
        </div>
        <form @submit.prevent="submit">
          <div class="modal-body pb-0">
            <div class="mb-3">
              <label class="form-label">여행 제목</label>
              <input
                v-model="draft.title"
                type="text"
                class="form-control"
                placeholder="예: 2박 3일 부산 식도락 여행"
                required
              />
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">출발일</label>
                <input v-model="draft.startDate" type="date" class="form-control" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">도착일</label>
                <input v-model="draft.endDate" type="date" class="form-control" required />
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">메모</label>
              <textarea
                v-model="draft.memo"
                class="form-control"
                rows="2"
                placeholder="이번 여행의 컨셉을 적어보세요."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-light" @click="close">취소</button>
            <button type="submit" class="btn btn-custom">만들기</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { emptyDraft, type NewSchedule } from '@/composables/useSchedules'

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{ submit: [draft: NewSchedule] }>()

const draft = reactive<NewSchedule>(emptyDraft())

// 모달이 닫힐 때마다 입력값을 비워, 다음에 열 때 깨끗한 폼으로 시작한다.
watch(open, (isOpen) => {
  if (!isOpen) Object.assign(draft, emptyDraft())
})

function close() {
  open.value = false
}

function submit() {
  emit('submit', { ...draft })
}
</script>
