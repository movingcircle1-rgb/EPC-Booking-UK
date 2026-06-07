#!/usr/bin/env node

/**
 * Sitemap Generator for National Removals & Storage
 * Generates a comprehensive sitemap.xml for SEO and crawlers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://nationalremovalsandstorage.co.uk';
const TODAY = new Date().toISOString().split('T')[0];

// Define all static routes with their SEO properties
const staticRoutes = [
  // Core Pages
  { path: '/', priority: 1.0, changefreq: 'daily', lastmod: TODAY },
  { path: '/about', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/contact', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/how-it-works', priority: 0.7, changefreq: 'monthly', lastmod: TODAY },

  // Services
  { path: '/services', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/removals', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/house-removals', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/office-removals', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/packing-services', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/european-moves', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/international-moves', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/storage', priority: 0.9, changefreq: 'monthly', lastmod: TODAY },
  { path: '/furniture-removal', priority: 0.7, changefreq: 'monthly', lastmod: TODAY },

  // Legacy service routes
  { path: '/local', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/national', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/international', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },

  // Special Offers
  { path: '/blue-light-card', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/mid-week-move', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },
  { path: '/free-storage', priority: 0.8, changefreq: 'monthly', lastmod: TODAY },

  // Sustainability
  { path: '/we-donate', priority: 0.6, changefreq: 'monthly', lastmod: TODAY },
  { path: '/we-recycle', priority: 0.6, changefreq: 'monthly', lastmod: TODAY },
  { path: '/low-emission-promise', priority: 0.6, changefreq: 'monthly', lastmod: TODAY },
  { path: '/we-recommend', priority: 0.5, changefreq: 'monthly', lastmod: TODAY },

  // Blog/Articles
  { path: '/articles', priority: 0.7, changefreq: 'weekly', lastmod: TODAY },
  { path: '/blog', priority: 0.7, changefreq: 'weekly', lastmod: TODAY },
];

// Generate XML
function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- National Removals & Storage - Comprehensive Sitemap -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Total URLs: ${staticRoutes.length} static pages -->

`;

  // Add all static routes
  staticRoutes.forEach(route => {
    xml += `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>

`;
  });

  // Add note about dynamic location pages
  xml += `  <!-- Dynamic Location Pages -->
  <!-- Dynamic location pages are generated via /removals-{city} pattern -->
  <!-- Example: /removals-london, /removals-manchester, etc. -->
  <!-- For a complete list with database locations, use the generate-sitemap edge function -->
  <!-- URL: ${DOMAIN}/functions/v1/generate-sitemap -->

`;

  xml += `</urlset>
`;

  return xml;
}

// Write sitemap to public folder
function writeSitemap() {
  const sitemap = generateSitemap();
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  fs.writeFileSync(outputPath, sitemap, 'utf8');

  console.log('✓ Sitemap generated successfully!');
  console.log(`  Location: ${outputPath}`);
  console.log(`  URLs: ${staticRoutes.length} static pages`);
  console.log(`  Domain: ${DOMAIN}`);
  console.log(`  Date: ${TODAY}`);
}

// Run generator
writeSitemap();

export { generateSitemap, staticRoutes };
