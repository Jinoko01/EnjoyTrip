import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getAccessToken } from '@/utils/authStorage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/profile',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/attraction', component: () => import('@/views/TripSearchView.vue') },
    { path: '/search', component: () => import('@/views/SearchView.vue') },
    {
      path: '/schedule',
      component: () => import('@/views/ScheduleView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule-detail/:scheduleId',
      component: () => import('@/views/ScheduleDetailView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/board', component: () => import('@/views/BoardView.vue') },
    {
      path: '/board/write',
      component: () => import('@/views/BoardWriteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/board/write/:boardNo',
      component: () => import('@/views/BoardWriteView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/board/:boardNo', component: () => import('@/views/BoardDetailView.vue') },
    { path: '/hotplace', component: () => import('@/views/HotPlaceView.vue') },
    { path: '/hotplace/:hotPlaceId', component: () => import('@/views/HotPlaceDetailView.vue') },
    { path: '/notice', component: () => import('@/views/NoticeView.vue') },
    { path: '/news', component: () => import('@/views/NewsView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return

  const auth = useAuthStore()
  // user가 이미 복원돼 있으면 통과
  if (auth.user) return

  // localStorage에 토큰은 있지만 user가 없는 경우 (새로고침 직후 예외 상황) 재확인
  const hasToken = !!getAccessToken()
  if (hasToken) {
    await auth.fetchSession()
  }

  if (!auth.user) return '/login'
})

export default router
