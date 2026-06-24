// 인증 토큰·사용자 정보를 localStorage에서 다루는 단일 접근 지점.
// 키 문자열과 접근 로직을 한곳에 모아 오타·중복을 막고, 저장소 변경 시 영향 범위를 좁힌다.
// (FRONTEND_CODE_REFERENCE.md - 응집도/결합도 참고)

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.refreshToken)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

// access/refresh token과 사용자 정보를 모두 제거한다.
export function clearAuthStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.user)
}
