/*
  # Add Maps and Mobile Images to Locations

  1. Changes to existing tables
    - Add `map_embed_code` (text) to cities table - HTML iframe embed code
    - Add `map_latitude` (numeric) to cities table
    - Add `map_longitude` (numeric) to cities table
    - Add `mobile_image_url` (text) to cities table - Mobile-optimized image
    - Add `tablet_image_url` (text) to cities table - Tablet-optimized image
    - Add `desktop_image_url` (text) to cities table - Desktop image

  2. Notes
    - Allows admins to add embedded maps for each location
    - Supports responsive images for different devices
    - No security changes needed as existing RLS policies apply
*/

-- Add map fields to cities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'map_embed_code'
  ) THEN
    ALTER TABLE cities ADD COLUMN map_embed_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'map_latitude'
  ) THEN
    ALTER TABLE cities ADD COLUMN map_latitude numeric(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'map_longitude'
  ) THEN
    ALTER TABLE cities ADD COLUMN map_longitude numeric(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'mobile_image_url'
  ) THEN
    ALTER TABLE cities ADD COLUMN mobile_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'tablet_image_url'
  ) THEN
    ALTER TABLE cities ADD COLUMN tablet_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cities' AND column_name = 'desktop_image_url'
  ) THEN
    ALTER TABLE cities ADD COLUMN desktop_image_url text;
  END IF;
END $$;

-- Try adding to locations table if it exists (fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locations') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'map_embed_code'
    ) THEN
      ALTER TABLE locations ADD COLUMN map_embed_code text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'map_latitude'
    ) THEN
      ALTER TABLE locations ADD COLUMN map_latitude numeric(10, 8);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'map_longitude'
    ) THEN
      ALTER TABLE locations ADD COLUMN map_longitude numeric(11, 8);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'mobile_image_url'
    ) THEN
      ALTER TABLE locations ADD COLUMN mobile_image_url text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'tablet_image_url'
    ) THEN
      ALTER TABLE locations ADD COLUMN tablet_image_url text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'locations' AND column_name = 'desktop_image_url'
    ) THEN
      ALTER TABLE locations ADD COLUMN desktop_image_url text;
    END IF;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN cities.map_embed_code IS 'HTML iframe embed code for Google Maps or other map services';
COMMENT ON COLUMN cities.map_latitude IS 'Latitude coordinate for map pinpoint';
COMMENT ON COLUMN cities.map_longitude IS 'Longitude coordinate for map pinpoint';
COMMENT ON COLUMN cities.mobile_image_url IS 'Optimized image URL for mobile devices (< 768px)';
COMMENT ON COLUMN cities.tablet_image_url IS 'Optimized image URL for tablet devices (768px - 1024px)';
COMMENT ON COLUMN cities.desktop_image_url IS 'Optimized image URL for desktop devices (> 1024px)';
