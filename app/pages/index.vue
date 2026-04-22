<script setup lang="ts">
import type { BreadcrumbItem } from "~/types";

// ❌ TypeScript error (TS2322):
//    Type '{ title: string; }[]' is not assignable to type 'undefined'.
// But the value is fully JSON-serializable and the runtime works correctly —
// the breadcrumbs strip in the layout renders as expected.
setPageLayout("default", {
  breadcrumbs: [{ title: "Top" }] satisfies BreadcrumbItem[],
});
</script>

<template>
  <section>
    <h2>Top</h2>
    <p>See the breadcrumbs strip above — rendered correctly at runtime.</p>
    <p>
      Then run <code>pnpm type-check</code> to see the TS error on this file's
      <code>setPageLayout</code> call.
    </p>
    <ul>
      <li><NuxtLink to="/documents">Go to /documents</NuxtLink></li>
      <li><NuxtLink to="/documents/resume">Go to /documents/resume</NuxtLink></li>
      <li><NuxtLink to="/simple">Go to /simple (minimal case, no generics)</NuxtLink></li>
    </ul>
  </section>
</template>
