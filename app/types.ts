import type { RouteLocationRaw } from "vue-router";

export interface BreadcrumbItem {
  title: string;
  to?: RouteLocationRaw;
}
