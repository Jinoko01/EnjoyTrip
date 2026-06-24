<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  keyword: string
}

interface Segment {
  value: string
  matched: boolean
}

const props = defineProps<Props>()

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 검색어와 일치하는 구간만 <mark>로 강조하기 위해 텍스트를 조각으로 나눈다. (v-html 미사용)
const segments = computed<Segment[]>(() => {
  const keyword = props.keyword.trim()
  if (!keyword) return [{ value: props.text, matched: false }]

  const pattern = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return props.text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ value: part, matched: part.toLowerCase() === keyword.toLowerCase() }))
})
</script>

<template>
  <span>
    <template v-for="(segment, index) in segments" :key="index">
      <mark v-if="segment.matched" class="highlight">{{ segment.value }}</mark>
      <template v-else>{{ segment.value }}</template>
    </template>
  </span>
</template>

<style scoped>
.highlight {
  padding: 0;
  background: none;
  color: var(--primary-color);
  font-weight: 700;
}
</style>
