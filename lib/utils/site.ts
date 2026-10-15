const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://varasa.biz.id'

export const SITE_URL = new URL(configuredSiteUrl).origin

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
