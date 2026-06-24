const DEFAULT_KAKAO_MAP_APP_KEY = '88e43c42ffcd05a237e9697eeb5ba645'
const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk'
const DEFAULT_KAKAO_MAP_SDK_URL = '/api/dapi.kakao.com/v2/maps/sdk.js'
const SDK_LOAD_TIMEOUT_MS = 10000

let loadingPromise: Promise<void> | null = null

declare global {
  interface Window {
    kakao?: any
  }
}

export function loadKakaoMapSdk(libraries = 'services') {
  if (window.kakao?.maps?.load) {
    return new Promise<void>((resolve) => window.kakao?.maps.load(resolve))
  }

  if (loadingPromise) return loadingPromise

  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY || DEFAULT_KAKAO_MAP_APP_KEY
  const sdkUrl = import.meta.env.VITE_KAKAO_MAP_SDK_URL || DEFAULT_KAKAO_MAP_SDK_URL
  const libraryParam = libraries
    .split(',')
    .map((library) => encodeURIComponent(library.trim()))
    .filter(Boolean)
    .join(',')
  const params = `appkey=${encodeURIComponent(appKey)}&libraries=${libraryParam}&autoload=false`

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID) as HTMLScriptElement | null
    const script = existingScript || document.createElement('script')
    let settled = false
    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      loadingPromise = null
      reject(new Error('Kakao Map SDK 로드 시간이 초과되었습니다.'))
    }, SDK_LOAD_TIMEOUT_MS)

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      loadingPromise = null
      reject(error)
    }

    script.id = KAKAO_MAP_SCRIPT_ID
    script.async = true
    script.src = `${sdkUrl}?${params}`

    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        fail(new Error('Kakao Map SDK loaded, but kakao.maps is unavailable.'))
        return
      }
      window.kakao.maps.load(() => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        resolve()
      })
    }
    script.onerror = () => {
      fail(new Error('Kakao Map SDK 로드 실패'))
    }

    if (!existingScript) document.head.appendChild(script)
  })

  return loadingPromise
}
