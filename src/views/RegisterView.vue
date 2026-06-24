<template>
  <main class="container-fluid feature-page bg-light" style="min-height: calc(100vh - 64px)">
    <div class="row justify-content-center py-5">
      <div class="col-lg-6 col-md-8">
        <div class="glass-card p-4 p-md-5 animate-fade-in-up">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary mb-2">{{ isEdit ? '내 정보 수정' : '회원가입' }}</h2>
            <p class="text-muted">
              {{
                isEdit
                  ? '회원 정보를 최신 상태로 유지하세요.'
                  : 'EnjoyTrip의 회원이 되어 특별한 혜택을 누리세요.'
              }}
            </p>
          </div>

          <div v-if="error" class="alert alert-danger py-2 small mb-3">{{ error }}</div>

          <form @submit.prevent="handleSubmit">
            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">아이디</label>
              <input
                v-model="form.userId"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': !!error }"
                placeholder="영문, 숫자 포함 4~12자"
                required
              />
              <div class="invalid-feedback">이미 존재하는 아이디입니다.</div>
            </div>

            <div class="mb-3">
              <label class="form-label"
                >비밀번호
                <span v-if="isEdit" class="text-muted small">(변경 시에만 입력)</span></label
              >
              <input
                v-model="form.userPwd"
                type="password"
                class="form-control"
                placeholder="비밀번호 입력"
                :required="!isEdit"
              />
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">비밀번호 확인</label>
              <input
                v-model="pwdConfirm"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': pwdMismatch }"
                placeholder="비밀번호 재입력"
                required
              />
              <div class="invalid-feedback">비밀번호가 일치하지 않습니다.</div>
            </div>

            <div class="mb-3">
              <label class="form-label">이름</label>
              <input
                v-model="form.userName"
                type="text"
                class="form-control"
                placeholder="이름 입력"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label">이메일 (선택)</label>
              <input
                v-model="form.userEmail"
                type="email"
                class="form-control"
                placeholder="example@domain.com"
              />
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-custom btn-lg w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? '정보 수정' : '가입하기' }}
              </button>
              <button
                v-if="isEdit"
                type="button"
                class="btn btn-danger btn-lg w-100"
                @click="handleDelete"
              >
                회원 탈퇴
              </button>
            </div>
          </form>

          <div v-if="!isEdit" class="text-center mt-4">
            <p class="text-muted">
              이미 계정이 있으신가요?
              <RouterLink to="/login" class="text-primary text-decoration-none fw-bold"
                >로그인</RouterLink
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isEdit = computed(() => route.path === '/profile')

const form = ref({ userId: '', userPwd: '', userName: '', userEmail: '' })
const pwdConfirm = ref('')
const error = ref('')
const loading = ref(false)

const pwdMismatch = computed(
  () => !isEdit.value && form.value.userPwd !== pwdConfirm.value && pwdConfirm.value.length > 0,
)

onMounted(() => {
  if (isEdit.value && auth.user) {
    form.value.userName = auth.user.userName
    form.value.userEmail = auth.user.userEmail || ''
  }
})

async function handleSubmit() {
  if (!isEdit.value && form.value.userPwd !== pwdConfirm.value) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    if (isEdit.value) {
      await auth.update({
        userName: form.value.userName,
        userEmail: form.value.userEmail,
        userPwd: form.value.userPwd || undefined,
      })
      router.push('/')
    } else {
      await auth.register({
        userId: form.value.userId,
        userPwd: form.value.userPwd,
        userName: form.value.userName,
        userEmail: form.value.userEmail,
      })
      router.push('/login')
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || '오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('정말 회원탈퇴 하시겠습니까? 데이터는 복구할 수 없습니다.')) return
  await auth.deleteAccount()
  router.push('/')
}
</script>
