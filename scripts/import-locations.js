import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function importLocations() {
  console.log('Starting locations import...');

  const csvPath = path.join(__dirname, '../public/national_removals_uk_locations_10k_with_nearest.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const headers = parseCSVLine(lines[0]);
  console.log(`Found ${lines.length - 1} location records to import`);

  const locations = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: column count mismatch`);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    locations.push({
      domain: row.DOMAIN || 'https://nationalremovalsandstorage.co.uk/',
      city: row.CITY,
      city_slug: row.CITY_SLUG,
      nearest_1: row.Nearest_1,
      nearest_2: row.Nearest_2,
      nearest_3: row.Nearest_3,
      nearest_areas: row.Nearest_Areas,
      county: row.COUNTY,
      postcode: row.POSTCODE,
      phone: row.PHONE || '(0800) 0472607',
      email: row.EMAIL || 'sales@nationalremovalsandstorage.co.uk',
      address1: row.ADDRESS1,
      address2: row.ADDRESS2,
      reviews_platform: row.REVIEWS_PLATFORM || 'Google',
      reviews_score: row.REVIEWS_SCORE,
      accredited: row.ACCREDITED || 'Yes',
      nearby_areas: row.NEARBY_AREAS,
      area_links: row.AREA_LINKS,
      hero_image: row.HERO_IMAGE,
      map_embed: row.MAP_EMBED,
      map_link: row.MAP_LINK,
      opening_hours: row.OPENING_HOURS || 'Mon–Sat 08:00–18:00; Sun Closed'
    });
  }

  console.log(`Prepared ${locations.length} locations for import`);

  const batchSize = 100;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('locations')
      .upsert(batch, {
        onConflict: 'city_slug',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`Error importing batch ${i / batchSize + 1}:`, error);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`Imported batch ${i / batchSize + 1}: ${imported} / ${locations.length} locations`);
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Successfully imported: ${imported} locations`);
  console.log(`Errors: ${errors} locations`);
  console.log('=======================\n');
}

importLocations().catch(console.error);
