import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Location {
  slug: string;
  city: string;
  city_slug: string;
  updated_at: string;
}

interface SEOPage {
  page_path: string;
  canonical_url: string | null;
  priority: number | null;
  changefreq: string | null;
  updated_at: string;
  sitemap_include: boolean;
}

interface Article {
  slug: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const baseUrl = 'https://nationalremovalsandstorage.co.uk';
    const today = new Date().toISOString().split('T')[0];

    // Fetch SEO pages from database
    const { data: seoPages } = await supabase
      .from('page_seo_metadata')
      .select('page_path, canonical_url, priority, changefreq, updated_at, sitemap_include')
      .eq('sitemap_include', true)
      .eq('is_active', true);

    // Fetch published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const services = [
      'house-removals',
      'office-removals',
      'packing-services',
      'storage',
      'european-moves',
      'international-moves',
    ];

    const { data: locations, error } = await supabase
      .from('locations')
      .select('slug, city, city_slug, updated_at')
      .eq('status', 'published')
      .order('city');

    if (error) {
      console.error('Error fetching locations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch locations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n';

    // Add SEO pages from database
    if (seoPages && seoPages.length > 0) {
      xml += '  <!-- Pages from Database -->\n';
      seoPages.forEach((page: SEOPage) => {
        const url = page.canonical_url || `${baseUrl}${page.page_path}`;
        const lastmod = page.updated_at ? page.updated_at.split('T')[0] : today;
        const priority = page.priority !== null ? page.priority.toString() : '0.5';
        const changefreq = page.changefreq || 'weekly';

        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    // Add articles
    if (articles && articles.length > 0) {
      xml += '  <!-- Articles -->\n';
      xml += `  <!-- Total Articles: ${articles.length} -->\n\n`;
      articles.forEach((article: Article) => {
        const lastmod = article.updated_at ? article.updated_at.split('T')[0] : today;
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n\n';
      });
    }

    if (locations && locations.length > 0) {
      xml += '  <!-- Dynamic Location Pages -->\n';
      xml += `  <!-- Total Locations: ${locations.length} -->\n`;
      xml += `  <!-- Total Location URLs: ${locations.length * (services.length + 2)} -->\n\n`;

      locations.forEach((location: Location) => {
        const lastmod = location.updated_at ? location.updated_at.split('T')[0] : today;
        const citySlug = location.city_slug || location.slug;

        // Main location page (e.g., /locations/london)
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/locations/${location.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n\n';

        // Main removals page for city (e.g., /removals-london)
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/removals-${citySlug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += '  </url>\n\n';

        // Service-specific location pages (e.g., /locations/london/house-removals)
        services.forEach(service => {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/locations/${location.slug}/${service}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += '  </url>\n\n';
        });

        // Service-specific dynamic pages (e.g., /house-removals-london, /office-removals-london)
        services.forEach(service => {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/${service}-${citySlug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += '  </url>\n\n';
        });
      });
    }

    xml += '</urlset>';

    const totalUrls = (xml.match(/<url>/g) || []).length;

    console.log(`Sitemap generated successfully:`);
    console.log(`- Total URLs: ${totalUrls}`);
    console.log(`- SEO pages: ${seoPages?.length || 0}`);
    console.log(`- Articles: ${articles?.length || 0}`);
    console.log(`- Location pages: ${locations?.length || 0}`);
    console.log(`- Dynamic city removals pages: ${locations?.length || 0}`);
    console.log(`- Service-specific location pages: ${(locations?.length || 0) * services.length * 2}`);
    console.log(`- File size: ${(xml.length / 1024).toFixed(2)} KB`);

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});