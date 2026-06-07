import { branding } from '../config/branding';

/**
 * Normalise paths for SEO canonical URLs.
 * - Adds trailing slash to content routes
 * - Keeps "/" as "/"
 * - Avoid trailing slash for SPA/admin/auth/portal routes
 */
function normalisePathForSeo(path: string): string {
  if (!path) return '/';

  // Strip query/hash if someone accidentally passes a full URL part
  const clean = path.split('?')[0].split('#')[0];

  // Ensure leading slash
  const withLeading = clean.startsWith('/') ? clean : `/${clean}`;

  // Root stays root
  if (withLeading === '/') return '/';

  // Routes that should NOT have trailing slash
  const noSlash = new Set([
    '/admin',
    '/admin2',
    '/temp-admin',
    '/client-portal',
    '/staff-portal',
    '/partner-portal',
    '/trade-portal',
    '/portal/login',
    '/signup',
  ]);

  if (noSlash.has(withLeading)) return withLeading;

  // Add trailing slash for SEO/content pages
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Get the current site URL based on environment
 * - Production: Uses branding.seo.siteUrl
 * - Development/Netlify Preview: Uses window.location.origin
 */
export function getCurrentSiteUrl(): string {
  if (typeof window === 'undefined') {
    return branding.seo.siteUrl;
  }

  const hostname = window.location.hostname;

  // Production domain
  if (
    hostname === 'nationalremovalsandstorage.co.uk' ||
    hostname === 'www.nationalremovalsandstorage.co.uk'
  ) {
    return branding.seo.siteUrl;
  }

  // Netlify preview or development
  return window.location.origin;
}

/**
 * Get the canonical URL for a given path.
 * Always uses production URL for canonical tags (SEO).
 * Ensures trailing slash consistency for content pages.
 */
export function getCanonicalUrl(path: string): string {
  const seoPath = normalisePathForSeo(path);
  return `${branding.seo.siteUrl}${seoPath}`;
}

/**
 * Get the full URL for a given path on the current site origin
 * (works for dev, preview, and production).
 */
export function getFullUrl(path: string): string {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${getCurrentSiteUrl()}${safePath}`;
}
