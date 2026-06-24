import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import {
  STORAGE_KEYS,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthStorage,
} from '@/utils/authStorage'

export interface User {
  userId: string
  userName: string
  userEmail: string
  joinDate?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(loadUserFromStorage())
  const loading = ref(false)

  function loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  }

  function saveUser(u: User) {
    user.value = u
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u))
  }

  function clearUser() {
    user.value = null
    clearAuthStorage()
  }

  // 앱 기동 시 저장된 accessToken으로 서버에서 최신 사용자 정보를 가져온다.
  // 토큰이 없으면 그냥 null로 유지.
  async function fetchSession() {
    if (!getAccessToken()) {
      user.value = null
      return
    }
    try {
      const res = await api.get('/member/me')
      saveUser(res.data)
    } catch {
      // 401이면 api 인터셉터가 refresh를 시도하고, 실패 시 clearAuthAndRedirect를 호출한다.
      // 여기서 추가 처리 없이 null로 유지
      user.value = null
    }
  }

  async function login(userId: string, userPwd: string) {
    const res = await api.post('/member/login', { userId, userPwd })
    const { accessToken, refreshToken, ...userInfo } = res.data
    setTokens(accessToken, refreshToken)
    saveUser(userInfo as User)
  }

  async function logout() {
    const refreshToken = getRefreshToken()
    try {
      await api.post('/auth/logout', { refreshToken: refreshToken ?? '' })
    } catch {
      // 로그아웃은 서버 오류 여부와 무관하게 로컬 상태를 정리한다
    }
    clearUser()
  }

  async function register(data: {
    userId: string
    userPwd: string
    userName: string
    userEmail: string
  }) {
    await api.post('/member/register', data)
  }

  async function update(data: { userName: string; userEmail: string; userPwd?: string }) {
    await api.post('/member/update', data)
    if (user.value) {
      const updated = { ...user.value, userName: data.userName, userEmail: data.userEmail }
      saveUser(updated)
    }
  }

  async function deleteAccount() {
    await api.post('/member/delete')
    clearUser()
  }

  return { user, loading, fetchSession, login, logout, register, update, deleteAccount }
})
