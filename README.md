# Bug: `setPageLayout` type rejects arrays of objects despite being JSON-serializable

## Summary

`setPageLayout(name, props)` (introduced in #33805) is the natural way to pass
per-page display data to a shared layout. A very common use case is passing
a breadcrumbs array — `{ title: string; to?: RouteLocationRaw }[]` — to a
default layout that renders a breadcrumbs strip.

This use case is **rejected by the type system** even though:

- The value is fully JSON-serializable.
- The runtime delivers the value to the layout correctly.
- A single-object equivalent (`{ item: { title: "x" } }`) is accepted.

The bug is **not** specific to breadcrumbs or to complex types like
`RouteLocationRaw`. Even a trivial `{ label: string; count: number }[]`
is rejected. See `app/pages/simple.vue` for the minimal case.

## Environment

- Nuxt: **4.4.2** (confirmed to contain `MakeSerializableObject` from #33805 — see `node_modules/nuxt/dist/pages/runtime/utils.d.ts`)
- Vue: 3.5.33
- TypeScript: 6.0.3
- vue-tsc: 3.2.7
- Node: 20.x or newer
- Reproducible on StackBlitz: _(link once uploaded)_

## Steps to reproduce

1. `pnpm install`
2. `pnpm type-check`
3. Observe TypeScript errors on all four pages:
   - `app/pages/index.vue`
   - `app/pages/documents/index.vue`
   - `app/pages/documents/resume.vue`
   - `app/pages/simple.vue` — **the minimal case: no generics, no imported types, just `{ label: string; count: number }[]`**

   Each produces:

   ```
   Type '{ …; }[]' is not assignable to type 'undefined'.
   ```

4. Optionally run `pnpm dev` and navigate through the pages. The breadcrumbs strip renders correctly. **The bug is strictly in the type definition.**

## Expected

`setPageLayout("default", { breadcrumbs: [{ title: "Top" }] })` should type-check. The breadcrumbs array is:

- Intended to be serialized into the SSR payload for hydration (matching the stated contract of `setPageLayout` props).
- A direct, idiomatic Vue/Nuxt value: every `BreadcrumbItem` has a `to` compatible with `<NuxtLink>`.

Given that the type contract is "JSON-serializable", arrays of plain JSON-serializable objects should pass.

## Actual

TypeScript rejects any array whose elements are not primitives. Wrapping the same object in an array turns its type into `never`.

Note the inconsistency — a single object with the same shape is accepted:

```ts
setPageLayout("default", { item: { title: "Top" } })              // ✅ OK
setPageLayout("default", { breadcrumbs: [{ title: "Top" }] })     // ❌ never
```

Exact output from `pnpm type-check` (Nuxt 4.4.2):

```
app/pages/documents/index.vue(6,3): error TS2322: Type '({ title: string; to: string; } | { title: string; })[]' is not assignable to type 'undefined'.
app/pages/documents/resume.vue(6,3): error TS2322: Type '({ title: string; to: string; } | { title: string; to: { path: string; query: { sort: string; }; }; } | { title: string; })[]' is not assignable to type 'undefined'.
app/pages/index.vue(9,3): error TS2322: Type '{ title: string; }[]' is not assignable to type 'undefined'.
app/pages/simple.vue(14,3): error TS2353: Object literal may only specify known properties, and 'items' does not exist in type '{ readonly breadcrumbs?: undefined; key?: undefined; ref?: undefined; ref_for?: boolean | undefined; ref_key?: string | undefined; onVnodeBeforeMount?: undefined; onVnodeMounted?: undefined; ... 5 more ...; style?: undefined; }'.
```

Note the `simple.vue` error has a different TS code (`TS2353`) but the same root cause: the `items` prop name isn't declared on `default.vue`, and its value type (`{ label: string; count: number }[]`) is collapsed to `undefined` by `MakeSerializableObject`, so no prop with any name could accept it. The error surfaces as "unknown property" rather than "not assignable", but the underlying type-level failure is identical — arrays of plain objects become `never`/`undefined`.

## Root cause

The `MakeSerializableObject` helper at `packages/nuxt/src/pages/runtime/utils.ts`:

```ts
export type MakeSerializableObject<T> = T extends Function | symbol
  ? never
  : {
      [K in keyof T]: T[K] extends SerializablePrimitive
        ? T[K]
        : T[K] extends (infer U)[]
          ? U extends SerializablePrimitive
            ? T[K]
            : never   // ← rejects every array of non-primitives
          : T[K] extends Record<string, unknown>
            ? T[K]
            : never;
    };
```

The array branch (`T[K] extends (infer U)[] ? U extends SerializablePrimitive ? T[K] : never`) admits only arrays of primitives, which is strictly narrower than the stated "JSON-serializable" contract.

## Suggested fix

Model the constraint with a recursive JSON-value type, matching the actual serialization contract:

```ts
type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | { [k: string]: JSONValue };
```

At minimum, accept arrays of `Record<string, unknown>` (matching the sibling branch that already does so for single objects).

## Use case that motivated this report

A default layout that accepts a breadcrumbs array as a prop, with each page declaring its own breadcrumbs via `setPageLayout("default", { breadcrumbs })`. See the pages in this repo for the typical shapes:

- `app/pages/index.vue` — 1 item, no `to`
- `app/pages/documents/index.vue` — 2 items, string `to`
- `app/pages/documents/resume.vue` — 3 items, includes an object-form `to` with query params
- `app/pages/simple.vue` — **minimal case**: plain `{ label: string; count: number }[]`, no generics, no imported types

All four are ergonomic, idiomatic shapes. All four hit the same type error.

## Related

- PR [#33805](https://github.com/nuxt/nuxt/pull/33805) — feat(nuxt): allow updating props with `setPageLayout`
- Source: `packages/nuxt/src/pages/runtime/utils.ts` → `MakeSerializableObject`
- Docs: https://nuxt.com/docs/4.x/api/utils/set-page-layout
