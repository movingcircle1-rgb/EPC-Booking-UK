import { supabase } from './supabase';

interface GenerateLocationParams {
  city: string;
  county?: string;
  region?: string;
}

interface GenerationResult {
  success: boolean;
  locationId?: string;
  citySlug?: string;
  url?: string;
  error?: string;
  errors?: string[];
}

export const generateLocationSlug = (cityName: string): string => {
  let slug = cityName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
};

export const generateLocationSEO = (
  city: string,
  county?: string,
  region?: string
) => {
  const locationContext = county ? `${city}, ${county}` : city;

  return {
    metaTitle: `Removals Company ${city} | Professional Moving Services`,
    metaDescription: `Professional removal services in ${locationContext}. Affordable house removals, office moves, man and van services. Fully insured. Get your free quote today!`,
    heroTitle: `Removals Company ${city}`,
    heroSubtitle: `Professional removal services in ${locationContext}`,
    mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(city + ' United Kingdom')}&output=embed`,
    mapLink: `https://www.google.com/maps?q=${encodeURIComponent(city + ' United Kingdom')}`,
  };
};

export const validateLocationData = async (
  cityName: string,
  citySlug: string
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  if (!cityName || cityName.trim().length === 0) {
    errors.push('City name is required');
  }

  if (cityName && cityName.trim().length < 2) {
    errors.push('City name must be at least 2 characters');
  }

  // Check for duplicate by city_slug (case-insensitive)
  const { data: existingBySlug } = await supabase
    .from('locations')
    .select('id, city, city_slug')
    .ilike('city_slug', citySlug)
    .maybeSingle();

  if (existingBySlug) {
    errors.push(`A location with city slug "${citySlug}" already exists (${existingBySlug.city}). Please delete it first or use a different name.`);
  }

  // Double-check by exact city name (case-insensitive)
  const { data: existingByName } = await supabase
    .from('locations')
    .select('id, city, city_slug')
    .ilike('city', cityName.trim())
    .maybeSingle();

  if (existingByName && !existingBySlug) {
    errors.push(`A location with city name "${existingByName.city}" already exists. Please delete it first or use a different name.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const generateLocation = async ({
  city,
  county,
  region,
}: GenerateLocationParams): Promise<GenerationResult> => {
  try {
    const citySlug = generateLocationSlug(city);

    const validation = await validateLocationData(city, citySlug);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const seoData = generateLocationSEO(city, county, region);

    const { data: newLocation, error: insertError } = await supabase
      .from('locations')
      .insert({
        domain: 'https://nationalremovalsandstorage.co.uk/',
        city: city.trim(),
        city_slug: citySlug,
        county: county?.trim() || null,
        phone: '(0800) 0472607',
        email: 'sales@nationalremovalsandstorage.co.uk',
        reviews_platform: 'Google',
        accredited: 'Yes',
        opening_hours: 'Mon–Sat 08:00–18:00; Sun Closed',
        map_embed: seoData.mapEmbed,
        map_link: seoData.mapLink,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return {
        success: false,
        error: insertError.message || 'Failed to create location',
      };
    }

    const nearbyAreas = `${city} City Centre, ${city} North, ${city} South, ${city} East, ${city} West`;

    const { error: citiesError } = await supabase
      .from('cities')
      .upsert(
        {
          name: city.trim(),
          slug: citySlug,
          description: `Professional removal and storage services in ${city}`,
          meta_title: seoData.metaTitle,
          meta_description: seoData.metaDescription,
          county: county?.trim() || null,
          region: region?.trim() || null,
          areas_covered: nearbyAreas.split(', '),
          is_featured: false,
        },
        { onConflict: 'slug' }
      );

    if (citiesError) {
      console.warn('Cities table sync warning:', citiesError);
    }

    return {
      success: true,
      locationId: newLocation.id,
      citySlug,
      url: `/removals-${citySlug}`,
    };
  } catch (error) {
    console.error('Generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const bulkGenerateLocations = async (
  cities: GenerateLocationParams[]
): Promise<GenerationResult[]> => {
  const results: GenerationResult[] = [];

  for (const cityData of cities) {
    const result = await generateLocation(cityData);
    results.push(result);
  }

  return results;
};
