<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  icon: string
  iconClass?: string
  title: string
  count: number
  moreTo: RouteLocationRaw
  moreLabel: string
}

defineProps<Props>()
</script>

<template>
  <section class="result-section">
    <header class="section-heading">
      <h2 class="section-title">
        <i :class="['bi', `bi-${icon}`, iconClass]" aria-hidden="true"></i>
        {{ title }}
        <span class="section-count">{{ count }}</span>
      </h2>
      <RouterLink class="section-more" :to="moreTo">
        {{ moreLabel }} <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </RouterLink>
    </header>

    <div class="section-card">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.result-section {
  margin-bottom: 36px;
}

.section-heading {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--et-gray-900);
}

.section-title > i {
  font-size: 18px;
}

.section-count {
  color: var(--et-gray-500);
  font-size: 15px;
  font-weight: 600;
}

.section-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  color: var(--et-gray-500);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.section-more:hover {
  color: var(--primary-color);
}

.section-card {
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: #fff;
}
</style>
