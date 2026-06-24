<template>
  <main
    class="container-fluid feature-page d-flex align-items-center justify-content-center bg-light"
    style="min-height: calc(100vh - 64px); padding: 48px 24px"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-lg-5 col-md-7">
        <div class="glass-card p-4 p-md-5 animate-fade-in-up text-center">
          <div class="mb-4">
            <div class="navbar-brand justify-content-center">
              <i class="bi bi-airplane-engines-fill me-2"></i>EnjoyTrip
            </div>
            <p class="text-muted mt-3">로그인하고 나만의 여행을 시작하세요</p>
          </div>

          <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

          <form class="text-start" @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label">아이디</label>
              <input
                v-model="userId"
                type="text"
                class="form-control"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div class="mb-4">
              <label class="form-label">비밀번호</label>
              <input
                v-model="userPwd"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': !!error }"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button type="submit" class="btn btn-custom btn-lg w-100 mb-3" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              로그인 <i class="bi bi-box-arrow-in-right ms-2"></i>
            </button>
          </form>

          <div class="d-flex justify-content-between text-muted small mt-4">
            <a
              href="#"
              class="text-decoration-underline text-muted"
              @click.prevent="showFindPwd = true"
            >
              비밀번호를 잊으셨나요?
            </a>
            <span
              >아직 회원이 아니신가요?
              <RouterLink to="/register" class="text-primary text-decoration-none fw-bold"
                >가입하기</RouterLink
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- 비밀번호 찾기 모달 -->
  <div
    v-if="showFindPwd"
    class="modal show d-block"
    style="background: rgba(0, 0, 0, 0.5)"
    @click.self="showFindPwd = false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div
        class="modal-content"
        style="border-radius: 20px; border: none; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1)"
      >
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title fw-bold"><i class="bi bi-search me-2"></i>비밀번호 찾기</h5>
          <button type="button" class="btn-close" @click="showFindPwd = false"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-4">가입 시 입력하신 아이디와 이름을 입력해 주세요.</p>
          <div class="mb-3">
            <label class="form-label">아이디</label>
            <input v-model="findId" type="text" class="form-control" placeholder="아이디 입력" />
          </div>
          <div class="mb-3">
            <label class="form-label">이름</label>
            <input v-model="findName" type="text" class="form-control" placeholder="이름 입력" />
          </div>
          <div v-if="findResult" class="alert mt-3" :class="findResult.type">
            <template v-if="findResult.type === 'alert-primary'">
              <strong>{{ findResult.name }}</strong
              >님의 비밀번호:
              <span class="fs-5 fw-bold text-danger">{{ findResult.maskedPwd }}</span>
              <p class="small text-muted mb-0 mt-1">(일부 마스킹됨)</p>
            </template>
            <template v-else>{{ findResult.message }}</template>
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-light" @click="showFindPwd = false">취소</button>
          <button type="button" class="btn btn-custom" @click="findPassword">비밀번호 찾기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const auth = useAuthStore()
const router = useRouter()

const userId = ref('')
const userPwd = ref('')
const error = ref('')
const loading = ref(false)

const showFindPwd = ref(false)
const findId = ref('')
const findName = ref('')
// v-html을 쓰지 않도록 구조화된 결과로 보관한다 (사용자 입력 escape 누락에 따른 XSS 방지)
const findResult = ref<
  | { type: 'alert-primary'; name: string; maskedPwd: string }
  | { type: 'alert-danger'; message: string }
  | null
>(null)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(userId.value, userPwd.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.error || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

async function findPassword() {
  if (!findId.value || !findName.value) {
    alert('아이디와 이름을 모두 입력해 주세요.')
    return
  }
  try {
    const res = await api.get(
      `/member/findPwd?userId=${encodeURIComponent(findId.value)}&userName=${encodeURIComponent(findName.value)}`,
    )
    findResult.value = {
      type: 'alert-primary',
      name: findName.value,
      maskedPwd: res.data.maskedPwd,
    }
  } catch {
    findResult.value = {
      type: 'alert-danger',
      message: '입력하신 정보와 일치하는 회원이 없습니다.',
    }
  }
}
</script>
