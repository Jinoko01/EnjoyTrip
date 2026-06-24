<script setup lang="ts">
// 단일 책임: 데이터 로딩 자리표시용 shimmer 블록 하나를 그린다.
// 카드/행/상세 등 구체 레이아웃은 이 프리미티브를 조합해 각 뷰에서 구성한다.
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
    circle?: boolean
  }>(),
  {
    width: '100%',
    height: '1rem',
    radius: '6px',
    circle: false,
  },
)
</script>

<template>
  <span
    class="skeleton-box"
    :style="{ width, height, borderRadius: circle ? '50%' : radius }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton-box {
  display: inline-block;
  position: relative;
  overflow: hidden;
  background: var(--et-gray-100, #eef1f5);
  vertical-align: middle;
}

.skeleton-box::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-box::after {
    animation: none;
  }
}
</style>
