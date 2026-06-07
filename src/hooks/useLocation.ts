import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Location {
  id: string;
  domain: string;
  city: string;
  city_slug: string;
  nearest_1: string | null;
  nearest_2: string | null;
  nearest_3: string | null;
  nearest_areas: string | null;
  county: string | null;
  postcode: string | null;
  phone: string;
  email: string;
  address1: string | null;
  address2: string | null;
  reviews_platform: string;
  reviews_score: string | null;
  accredited: string;
  nearby_areas: string | null;
  area_links: string | null;
  hero_image: string | null;
  map_embed: string | null;
  map_link: string | null;
  opening_hours: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  service_type: string | null;
  service_content: string | null;
  created_at: string;
  updated_at: string;
}

export function useLocation(citySlug: string) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocation() {
      try {
        setLoading(true);
        setError(null);

        console.log('[useLocation] Fetching location for slug:', citySlug);

        // Try to fetch from cities table first (new structure with SEO fields)
        let { data, error: fetchError } = await supabase
          .from('cities')
          .select('id, name, slug, region, latitude, longitude, population, meta_title, meta_description, meta_keywords, is_featured, map_embed, service_type, service_content')
          .eq('slug', citySlug)
          .maybeSingle();

        // If found in cities table, map to Location interface
        if (data && !fetchError) {
          console.log('[useLocation] Found in cities table:', data);
          // Map cities table structure to Location interface
          const mappedData: Location = {
            id: data.id,
            city: data.name,
            city_slug: data.slug,
            county: data.region,
            domain: 'https://nationalremovalsandstorage.co.uk/',
            phone: '0800 047 2607',
            email: 'sales@nationalremovalsandstorage.co.uk',
            address1: data.name,
            address2: data.region,
            postcode: '',
            reviews_platform: 'Google',
            reviews_score: '5.0',
            accredited: 'Yes',
            nearby_areas: '',
            area_links: '',
            nearest_1: null,
            nearest_2: null,
            nearest_3: null,
            nearest_areas: null,
            hero_image: '/House Removals.webp',
            map_embed: data.map_embed || null,
            map_link: null,
            opening_hours: 'Monday - Saturday: 8:00 AM - 6:00 PM',
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            meta_keywords: data.meta_keywords,
            service_type: data.service_type || null,
            service_content: data.service_content || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setLocation(mappedData);
          setLoading(false);
          return;
        }

        // Fallback to locations table (old structure)
        const locationResult = await supabase
          .from('locations')
          .select('*')
          .eq('city_slug', citySlug)
          .maybeSingle();

        data = locationResult.data;
        fetchError = locationResult.error;

        if (fetchError) {
          console.error('[useLocation] Supabase error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.warn('[useLocation] No location found for slug:', citySlug);
          setError('Location not found');
          setLocation(null);
        } else {
          console.log('[useLocation] Location data retrieved:', data.city);

          // Try to get SEO data from cities table
          const { data: cityData } = await supabase
            .from('cities')
            .select('meta_title, meta_description, meta_keywords, map_embed, service_type, service_content')
            .eq('slug', citySlug)
            .maybeSingle();

          // Merge SEO data from cities table with location data
          if (cityData) {
            console.log('[useLocation] Merging SEO data from cities table');
            data.meta_title = cityData.meta_title;
            data.meta_description = cityData.meta_description;
            data.meta_keywords = cityData.meta_keywords;
            data.service_type = cityData.service_type;
            data.service_content = cityData.service_content;
            // Update map_embed if it exists in cities table
            if (cityData.map_embed) {
              data.map_embed = cityData.map_embed;
            }
          }

          setLocation(data);
        }
      } catch (err) {
        console.error('[useLocation] Error fetching location:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch location');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    }

    if (citySlug) {
      fetchLocation();
    } else {
      console.warn('[useLocation] No citySlug provided');
      setLoading(false);
      setError('No city slug provided');
    }
  }, [citySlug]);

  return { location, loading, error };
}

export function parseAreaLinks(areaLinks: string | null): Array<{ name: string; slug: string }> {
  if (!areaLinks) return [];

  const links = areaLinks.split(',').map(link => link.trim());
  return links.map(link => {
    const slug = link.replace(/^\//, '');
    const name = slug
      .replace('removals-', '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { name, slug: link };
  });
}

export function parseNearbyAreas(nearbyAreas: string | null): string[] {
  if (!nearbyAreas) return [];
  return nearbyAreas.split(',').map(area => area.trim());
}
