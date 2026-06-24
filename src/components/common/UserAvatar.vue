<script setup lang="ts">
import { computed } from 'vue'
import { avatarColor, avatarInitial } from '@/utils/boardPresentation'

// 이름 첫 글자 + 결정적 배경색으로 그리는 원형 아바타.
const props = withDefaults(defineProps<{ name?: string; size?: number }>(), {
  name: '',
  size: 32,
})

const background = computed(() => avatarColor(props.name || '익명'))
const initial = computed(() => avatarInitial(props.name))
const dimension = computed(() => `${props.size}px`)
const fontSize = computed(() => `${Math.round(props.size * 0.42)}px`)
</script>

<template>
  <span
    class="user-avatar"
    :style="{ width: dimension, height: dimension, background, fontSize }"
    aria-hidden="true"
  >
    {{ initial }}
  </span>
</template>

<style scoped>
.user-avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  line-height: 1;
}
</style>
