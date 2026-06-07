import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CityContentBlock {
  id: string;
  city_id: string;
  block_position: number;
  heading: string;
  content: string;
  image_url: string | null;
  image_alt: string | null;
  created_at: string;
  updated_at: string;
}

export function useCityContent(cityId: string | undefined) {
  const [contentBlocks, setContentBlocks] = useState<CityContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContentBlocks() {
      if (!cityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('city_content_blocks')
          .select('*')
          .eq('city_id', cityId)
          .order('block_position');

        if (fetchError) {
          console.error('[useCityContent] Supabase error:', fetchError);
          throw fetchError;
        }

        setContentBlocks(data || []);
      } catch (err) {
        console.error('[useCityContent] Error fetching content blocks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
        setContentBlocks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchContentBlocks();
  }, [cityId]);

  return { contentBlocks, loading, error };
}
