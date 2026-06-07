/*
  # Add Map Embed URL to Cities Table

  1. Changes
    - Add `map_embed_url` column to `cities` table
    - This will store the full Google Maps embed URL or iframe code
    
  2. Notes
    - Uses TEXT type to accommodate full iframe embed codes
    - Nullable as maps are optional
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'map_embed_url'
  ) THEN
    ALTER TABLE cities ADD COLUMN map_embed_url TEXT;
  END IF;
END $$;