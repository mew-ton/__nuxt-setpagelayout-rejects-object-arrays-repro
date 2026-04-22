<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";

// ❌ Same TS error.
setPageLayout("default", {
  breadcrumbs: [
    { title: "Top", to: "/" },
    { title: "Documents", to: { path: "/documents", query: { sort: "recent" } } },
    { title: "Resume" },
  ] satisfies BreadcrumbItem[],
});
</script>

<template>
  <section>
    <h2>Resume</h2>
    <p>A deep page with a 3-level breadcrumb, including a programmatic route in the middle entry.</p>
    <p><NuxtLink to="/">Back to top</NuxtLink></p>
  </section>
</template>
