<template>
  <NavBar />
  <RouterView />
  <AppFooter v-if="!fullBleed" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const fullBleed = computed(
  () => route.path === '/attraction' || route.path.startsWith('/schedule-detail/'),
)

onMounted(() => auth.fetchSession())
</script>
