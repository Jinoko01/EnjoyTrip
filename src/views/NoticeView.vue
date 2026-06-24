<template>
  <header class="custom-page-header border-bottom">
    <div class="container header-content">
      <i class="bi bi-megaphone-fill text-primary display-4 mb-3 d-inline-block"></i>
      <h1 class="fw-bold">공지사항</h1>
      <p class="lead text-muted mb-0">EnjoyTrip의 새로운 소식과 안내를 확인하세요.</p>
    </div>
  </header>

  <div class="container pb-5">
    <div class="d-flex justify-content-end align-items-center mb-4">
      <button
        v-if="auth.user?.userId === 'admin'"
        class="btn btn-custom btn-sm"
        @click="showWriteModal = true"
      >
        <i class="bi bi-pencil me-1"></i>공지 작성
      </button>
    </div>

    <!-- 목록 -->
    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 60px" class="text-center">번호</th>
              <th>제목</th>
              <th style="width: 140px" class="text-center">작성일</th>
              <th v-if="auth.user?.userId === 'admin'" style="width: 80px" class="text-center">
                관리
              </th>
            </tr>
          </thead>
          <tbody v-if="loading">
            <tr v-for="i in 6" :key="i">
              <td class="text-center"><SkeletonBox width="24px" height="14px" /></td>
              <td><SkeletonBox width="55%" height="16px" /></td>
              <td class="text-center"><SkeletonBox width="84px" height="14px" /></td>
              <td v-if="auth.user?.userId === 'admin'" class="text-center">
                <SkeletonBox width="28px" height="22px" />
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-if="notices.length === 0">
              <td colspan="4" class="text-center text-muted py-5">
                <i class="bi bi-inbox d-block mb-2" style="font-size: 28px"></i>등록된 공지사항이
                없습니다.
              </td>
            </tr>
            <tr
              v-for="n in pagedNotices"
              :key="n.noticeNo"
              style="cursor: pointer"
              :class="{ 'table-primary': selectedNotice?.noticeNo === n.noticeNo }"
              @click="openNotice(n.noticeNo)"
            >
              <td class="text-center text-muted">{{ n.noticeNo }}</td>
              <td>
                <i class="bi bi-pin-angle-fill text-primary me-1" style="font-size: 11px"></i>
                {{ n.title }}
              </td>
              <td class="text-center text-muted small">{{ n.registerTime }}</td>
              <td v-if="auth.user?.userId === 'admin'" class="text-center">
                <button
                  class="btn btn-sm btn-outline-danger py-0 px-2"
                  @click.stop="deleteNotice(n.noticeNo)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination v-if="!loading" v-model:current-page="currentPage" :total-pages="totalPages" />

    <!-- 상세 -->
    <div v-if="detailLoading" id="notice-detail" class="card shadow-sm border-0 mt-4">
      <div class="card-body p-4">
        <SkeletonBox width="45%" height="24px" />
        <div class="mt-2"><SkeletonBox width="130px" height="14px" /></div>
        <hr />
        <div class="d-flex flex-column gap-2">
          <SkeletonBox width="100%" height="14px" />
          <SkeletonBox width="96%" height="14px" />
          <SkeletonBox width="90%" height="14px" />
          <SkeletonBox width="70%" height="14px" />
        </div>
      </div>
    </div>
    <div v-else-if="selectedNotice" id="notice-detail" class="card shadow-sm border-0 mt-4">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-1">{{ selectedNotice.title }}</h5>
        <div class="text-muted small mb-3">
          <i class="bi bi-clock me-1"></i>{{ selectedNotice.registerTime }}
        </div>
        <hr />
        <div style="white-space: pre-wrap; line-height: 1.8">{{ selectedNotice.content }}</div>
      </div>
    </div>
  </div>

  <!-- 공지 작성 모달 (admin) -->
  <div
    v-if="showWriteModal"
    class="modal show d-block"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="showWriteModal = false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow" style="border-radius: 16px">
        <form @submit.prevent="submitNotice">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">공지 작성</h5>
            <button type="button" class="btn-close" @click="showWriteModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">제목</label>
              <input
                v-model="writeForm.title"
                type="text"
                class="form-control"
                required
                maxlength="200"
              />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">내용</label>
              <textarea
                v-model="writeForm.content"
                class="form-control"
                rows="8"
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" @click="showWriteModal = false">
              취소
            </button>
            <button type="submit" class="btn btn-custom">등록</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import SkeletonBox from '@/components/skeleton/SkeletonBox.vue'
import Pagination from '@/components/common/Pagination.vue'
import { usePagination } from '@/composables/usePagination'

const auth = useAuthStore()
const notices = ref<any[]>([])
const selectedNotice = ref<any>(null)
const loading = ref(true)
const detailLoading = ref(false)
const showWriteModal = ref(false)
const writeForm = ref({ title: '', content: '' })

const NOTICES_PER_PAGE = 10
const {
  currentPage,
  totalPages,
  pagedItems: pagedNotices,
} = usePagination(notices, NOTICES_PER_PAGE)

async function loadNotices() {
  loading.value = true
  try {
    const res = await api.get('/notice')
    notices.value = res.data
  } finally {
    loading.value = false
  }
}

async function openNotice(noticeNo: number) {
  selectedNotice.value = null
  detailLoading.value = true
  await nextTick()
  document.getElementById('notice-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  try {
    const res = await api.get(`/notice/${noticeNo}`)
    selectedNotice.value = res.data
  } finally {
    detailLoading.value = false
  }
}

async function deleteNotice(noticeNo: number) {
  if (!confirm('삭제하시겠습니까?')) return
  await api.delete(`/notice/${noticeNo}`)
  if (selectedNotice.value?.noticeNo === noticeNo) selectedNotice.value = null
  await loadNotices()
}

async function submitNotice() {
  await api.post('/notice', writeForm.value)
  showWriteModal.value = false
  writeForm.value = { title: '', content: '' }
  await loadNotices()
}

onMounted(loadNotices)
</script>
