<template>
  <nav id="mainNav" class="navbar navbar-expand-lg" :class="{ scrolled }">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <img class="navbar-brand-logo" src="/logo.svg" alt="EnjoyTrip" />
      </RouterLink>

      <form class="nav-search" @submit.prevent="searchAll">
        <i class="bi bi-search" aria-hidden="true"></i>
        <input
          v-model="searchKeyword"
          type="search"
          placeholder="통합 검색 (핫플·커뮤니티·뉴스·공지)"
          aria-label="핫플레이스·커뮤니티·여행뉴스·공지사항 통합 검색"
        />
      </form>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarResponsive"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="navbarResponsive" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/attraction">여행지</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/hotplace">핫플</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/schedule">내 일정</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/board">커뮤니티</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/news">여행뉴스</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/notice">공지사항</RouterLink>
          </li>
          <li class="nav-item">
            <div class="navbar-actions d-flex ms-lg-3 gap-2 mt-3 mt-lg-0">
              <template v-if="auth.user">
                <span class="nav-link text-muted small align-self-center"
                  >{{ auth.user.userName }}님</span
                >
                <RouterLink class="btn btn-sm btn-outline-custom" to="/profile"
                  >정보 수정</RouterLink
                >
                <button class="btn btn-sm btn-light" @click="handleLogout">로그아웃</button>
              </template>
              <template v-else>
                <RouterLink class="btn btn-sm btn-custom" to="/login">로그인 · 회원가입</RouterLink>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const scrolled = ref(false)
const searchKeyword = ref('')

function onScroll() {
  scrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', onScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

function searchAll() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  router.push({ path: '/search', query: { keyword } })
}
</script>
