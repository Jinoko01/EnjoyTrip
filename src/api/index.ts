import axios from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthStorage,
} from '@/utils/authStorage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// 요청마다 localStorage의 accessToken을 Authorization 헤더에 붙인다
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 응답 시 refreshToken으로 자동 재발급 후 원래 요청 재시도
let isRefreshing = false
let waitQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // refresh 엔드포인트 자체가 401이면 무한루프 방지
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    if (isRefreshing) {
      // 다른 요청이 이미 refresh 중이면 대기
      return new Promise((resolve) => {
        waitQueue.push((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      isRefreshing = false
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    try {
      const res = await axios.post(`${apiBaseUrl}/api/auth/refresh`, { refreshToken })
      const newAccessToken: string = res.data.accessToken
      const newRefreshToken: string = res.data.refreshToken || refreshToken
      setTokens(newAccessToken, newRefreshToken)

      waitQueue.forEach((cb) => cb(newAccessToken))
      waitQueue = []

      original.headers.Authorization = `Bearer ${newAccessToken}`
      return api(original)
    } catch {
      waitQueue = []
      clearAuthAndRedirect()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)

function clearAuthAndRedirect() {
  clearAuthStorage()
  // 순환 의존성 회피 — 전체 페이지 이동으로 Vue 상태도 함께 초기화된다
  window.location.href = '/login'
}

export default api
