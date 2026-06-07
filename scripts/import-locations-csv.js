import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importLocations() {
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = readFileSync('./public/national_removals_uk_locations_10k_with_nearest copy.csv', 'utf-8');

    console.log('🔍 Parsing CSV data...');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`✅ Found ${records.length} location records to import`);

    // Transform CSV records to match database schema
    const locations = records.map(record => ({
      domain: record.DOMAIN || 'https://nationalremovalsandstorage.co.uk/',
      city: record.CITY,
      city_slug: record.CITY_SLUG,
      nearest_1: record.Nearest_1 || null,
      nearest_2: record.Nearest_2 || null,
      nearest_3: record.Nearest_3 || null,
      nearest_areas: record.Nearest_Areas || null,
      county: record.COUNTY || null,
      postcode: record.POSTCODE || null,
      phone: record.PHONE || '(0800) 0472607',
      email: record.EMAIL || 'sales@nationalremovalsandstorage.co.uk',
      address1: record.ADDRESS1 || null,
      address2: record.ADDRESS2 || null,
      reviews_platform: record.REVIEWS_PLATFORM || 'Google',
      reviews_score: record.REVIEWS_SCORE || null,
      accredited: record.ACCREDITED || 'Yes',
      nearby_areas: record.NEARBY_AREAS || null,
      area_links: record.AREA_LINKS || null,
      hero_image: record.HERO_IMAGE || null,
      map_embed: record.MAP_EMBED || null,
      map_link: record.MAP_LINK || null,
      opening_hours: record.OPENING_HOURS || 'Mon–Sat 08:00–18:00; Sun Closed'
    }));

    // Check for existing locations to avoid duplicates
    console.log('🔍 Checking for existing locations...');
    const { data: existingLocations, error: checkError } = await supabase
      .from('locations')
      .select('city_slug')
      .in('city_slug', locations.map(l => l.city_slug));

    if (checkError) {
      console.error('Error checking existing locations:', checkError);
      throw checkError;
    }

    const existingSlugs = new Set(existingLocations?.map(l => l.city_slug) || []);
    const newLocations = locations.filter(l => !existingSlugs.has(l.city_slug));

    console.log(`📊 Statistics:`);
    console.log(`   Total in CSV: ${locations.length}`);
    console.log(`   Already exists: ${existingSlugs.size}`);
    console.log(`   New to import: ${newLocations.length}`);

    if (newLocations.length === 0) {
      console.log('✅ All locations already imported. Nothing to do.');
      return;
    }

    // Import in batches of 100 to avoid timeout
    const batchSize = 100;
    let imported = 0;
    let failed = 0;

    console.log(`\n🚀 Starting import in batches of ${batchSize}...`);

    for (let i = 0; i < newLocations.length; i += batchSize) {
      const batch = newLocations.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(newLocations.length / batchSize);

      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

      const { data, error } = await supabase
        .from('locations')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error in batch ${batchNumber}:`, error.message);
        failed += batch.length;

        // Try inserting records one by one to identify problematic records
        console.log('   🔄 Retrying failed batch record by record...');
        for (const location of batch) {
          const { error: singleError } = await supabase
            .from('locations')
            .insert([location])
            .select();

          if (singleError) {
            console.error(`   ❌ Failed: ${location.city} (${location.city_slug}):`, singleError.message);
          } else {
            console.log(`   ✅ Recovered: ${location.city}`);
            imported++;
            failed--;
          }
        }
      } else {
        imported += batch.length;
        console.log(`   ✅ Successfully imported ${batch.length} locations`);
        if (data && data.length > 0) {
          console.log(`   📍 Sample: ${data[0].city}, ${data[1]?.city || ''}, ${data[2]?.city || ''}`);
        }
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`   ✅ Successfully imported: ${imported} locations`);
    console.log(`   ❌ Failed: ${failed} locations`);
    console.log(`   📊 Total in database: ${imported + existingSlugs.size} locations`);

  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
console.log('🚀 National Removals UK Locations CSV Import Tool\n');
importLocations()
  .then(() => {
    console.log('\n✨ Import process finished successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Import process failed:', error);
    process.exit(1);
  });
