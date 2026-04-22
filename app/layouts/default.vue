<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";

defineProps<{ breadcrumbs?: BreadcrumbItem[] }>();
</script>

<template>
  <div>
    <nav v-if="breadcrumbs?.length" style="padding: 0.5rem 1rem; background: #eee; border-bottom: 1px solid #ccc;">
      <template v-for="(item, i) in breadcrumbs" :key="i">
        <span v-if="i > 0" style="margin: 0 0.5rem; color: #888;">›</span>
        <NuxtLink v-if="item.to" :to="item.to">{{ item.title }}</NuxtLink>
        <span v-else>{{ item.title }}</span>
      </template>
    </nav>
    <main style="padding: 1rem;"><slot /></main>
  </div>
</template>
