<script setup lang="ts">
// Simplest possible reproduction — no generics, no imported types,
// no RouteLocationRaw, no union types. Just a plain array of objects
// whose fields are JSON primitives.
//
// ❌ Same TS error (TS2322):
//    Type '{ label: string; count: number; }[]' is not assignable to type 'undefined'.
//
// This demonstrates the bug is not specific to BreadcrumbItem or any
// complex type — `MakeSerializableObject` rejects every array whose
// elements are not primitives, even when the objects are trivial and
// fully JSON-serializable.
setPageLayout("default", {
  items: [
    { label: "first", count: 1 },
    { label: "second", count: 2 },
  ],
});
</script>

<template>
  <section>
    <h2>Simple</h2>
    <p>
      Minimal reproduction: an array of plain <code>{ label: string; count: number }</code>
      objects. No generics, no imported types, no <code>RouteLocationRaw</code>.
      Still rejected by the type system.
    </p>
    <p><NuxtLink to="/">Back to top</NuxtLink></p>
  </section>
</template>
