/**
 * Slug utilities for Varasa.
 * Generates URL-safe slugs from titles and validates slug format.
 */

/**
 * Generates a URL-safe slug from a string.
 *
 * Rules:
 * - Lowercase
 * - Spaces and underscores → hyphens
 * - Remove characters that are not alphanumeric or hyphens
 * - Collapse multiple hyphens into one
 * - Strip leading and trailing hyphens
 *
 * @example
 * generateSlug('Strategi Bisnis UMKM di Era Digital')
 * // → 'strategi-bisnis-umkm-di-era-digital'
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')          // spaces and underscores → hyphens
    .replace(/[^a-z0-9-]/g, '')       // remove non-alphanumeric (except hyphens)
    .replace(/-{2,}/g, '-')           // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')          // strip leading/trailing hyphens
}

/**
 * Validates that a slug matches the expected format.
 * Format: lowercase alphanumeric, hyphens allowed between words.
 * No leading/trailing hyphens, no consecutive hyphens.
 *
 * @example
 * isValidSlug('strategi-bisnis')  // true
 * isValidSlug('Strategi Bisnis')  // false
 * isValidSlug('-invalid-')        // false
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Makes a slug unique by appending a numeric suffix if needed.
 * Pass an async checker function that returns true if the slug is already taken.
 *
 * @example
 * const slug = await ensureUniqueSlug('my-article', async (s) => {
 *   const { data } = await supabase
 *     .from('articles')
 *     .select('id')
 *     .eq('slug', s)
 *     .single()
 *   return !!data
 * })
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await isTaken(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
