import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// You'll need to temporarily set the service role key or run this as admin
const supabaseUrl = 'https://mrpmrvppxbqjjopgksct.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values.map(v => v.replace(/^"|"$/g, ''));
}

async function importLocations() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = readFileSync('./public/national_removals_uk_locations_10k_with_nearest copy.csv', 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`✅ Found ${lines.length} lines (including header)`);

    // Parse header
    const headers = await parseCSVLine(lines[0]);
    console.log('📋 Headers:', headers.slice(0, 5).join(', '), '...');

    // Parse data rows
    const locations = [];
    for (let i = 1; i < lines.length; i++) {
      const values = await parseCSVLine(lines[i]);

      if (values.length >= 22) {
        locations.push({
          domain: values[0] || 'https://nationalremovalsandstorage.co.uk/',
          city: values[1],
          nearest_1: values[2] || null,
          nearest_2: values[3] || null,
          nearest_3: values[4] || null,
          nearest_areas: values[5] || null,
          city_slug: values[6],
          county: values[7] || null,
          postcode: values[8] || null,
          phone: values[9] || '(0800) 0472607',
          email: values[10] || 'sales@nationalremovalsandstorage.co.uk',
          address1: values[11] || null,
          address2: values[12] || null,
          reviews_platform: values[13] || 'Google',
          reviews_score: values[14] || null,
          accredited: values[15] || 'Yes',
          nearby_areas: values[16] || null,
          area_links: values[17] || null,
          hero_image: values[18] || null,
          map_embed: values[19] || null,
          map_link: values[20] || null,
          opening_hours: values[21] || 'Mon–Sat 08:00–18:00; Sun Closed'
        });
      }
    }

    console.log(`✅ Parsed ${locations.length} location records`);
    console.log(`📍 Sample locations:`, locations.slice(0, 3).map(l => l.city).join(', '));

    // Check existing
    console.log('\n🔍 Checking existing locations...');
    const { count: existingCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Existing locations in database: ${existingCount || 0}`);

    // Import in batches
    const batchSize = 50;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(locations.length / batchSize);

      console.log(`\n📦 Batch ${batchNum}/${totalBatches}: Processing ${batch.length} locations...`);

      const { data, error } = await supabase
        .from('locations')
        .upsert(batch, { onConflict: 'city_slug', ignoreDuplicates: false })
        .select();

      if (error) {
        console.error(`   ❌ Error:`, error.message);

        // Try one by one
        for (const loc of batch) {
          const { error: singleError } = await supabase
            .from('locations')
            .upsert([loc], { onConflict: 'city_slug' })
            .select();

          if (singleError) {
            console.error(`   ❌ ${loc.city}: ${singleError.message}`);
            skipped++;
          } else {
            console.log(`   ✅ ${loc.city}`);
            imported++;
          }
        }
      } else {
        imported += batch.length;
        console.log(`   ✅ Successfully imported ${batch.length} locations`);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);

    // Final count
    const { count: finalCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true });

    console.log(`   📊 Total locations in database: ${finalCount}`);

  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  }
}

console.log('🚀 National Removals Locations Import\n');
importLocations()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Failed:', err);
    process.exit(1);
  });
