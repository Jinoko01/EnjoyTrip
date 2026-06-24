<script setup lang="ts">
// 등록된 이미지가 없을 때 이미지 영역을 대신 채우는 자리표시 컴포넌트.
withDefaults(
  defineProps<{
    label?: string
    icon?: string
  }>(),
  {
    label: '등록된 사진이 없습니다',
    icon: 'image',
  },
)
</script>

<template>
  <div class="image-placeholder">
    <i :class="`bi bi-${icon}`" aria-hidden="true"></i>
    <p>{{ label }}</p>
  </div>
</template>

<style scoped>
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  aspect-ratio: 3 / 2;
  min-height: 240px;
  border: 1px dashed var(--border-strong, #cfd8e3);
  border-radius: var(--radius-lg, 16px);
  background: var(--et-gray-50, #f7f9fb);
  color: var(--et-gray-400, #9aa7b6);
}

.image-placeholder i {
  font-size: 48px;
  line-height: 1;
}

.image-placeholder p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
