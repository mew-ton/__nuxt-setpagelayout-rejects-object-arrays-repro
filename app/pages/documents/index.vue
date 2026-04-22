<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";

// ❌ Same TS error.
setPageLayout("default", {
  breadcrumbs: [
    { title: "Top", to: "/" },
    { title: "Documents" },
  ] satisfies BreadcrumbItem[],
});
</script>

<template>
  <section>
    <h2>Documents</h2>
    <ul>
      <li><NuxtLink to="/">Back to top</NuxtLink></li>
      <li><NuxtLink to="/documents/resume">Resume</NuxtLink></li>
    </ul>
  </section>
</template>
