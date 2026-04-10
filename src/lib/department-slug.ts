/**
 * Turn a department name into a URL-safe slug.
 *
 * "Customer Success" → "customer-success"
 * "R&D"              → "r-d"
 * "HR"               → "hr"
 *
 * Used on every link that routes to /departments/[slug] so names with
 * spaces or symbols don't break the router.
 */
export function deptToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * True if the given department name matches a URL slug.
 * Normalizes both sides through `deptToSlug` so "Customer Success",
 * "customer success", and "customer-success" all resolve identically.
 */
export function matchesDeptSlug(name: string, slug: string): boolean {
  return deptToSlug(name) === deptToSlug(slug);
}
