/*
  # Create UK Locations System for Dynamic Pages

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `domain` (text)
      - `city` (text, indexed for fast lookups)
      - `city_slug` (text, unique, indexed - used for URL routing)
      - `nearest_1` (text)
      - `nearest_2` (text)
      - `nearest_3` (text)
      - `nearest_areas` (text)
      - `county` (text)
      - `postcode` (text)
      - `phone` (text)
      - `email` (text)
      - `address1` (text)
      - `address2` (text)
      - `reviews_platform` (text)
      - `reviews_score` (text)
      - `accredited` (text)
      - `nearby_areas` (text)
      - `area_links` (text)
      - `hero_image` (text)
      - `map_embed` (text)
      - `map_link` (text)
      - `opening_hours` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `locations` table
    - Add policy for public read access (locations are public information)
    - Add policy for authenticated admin users to manage locations

  3. Indexes
    - Index on city_slug for fast page lookups
    - Index on city for search functionality
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL DEFAULT 'https://nationalremovalsandstorage.co.uk/',
  city text NOT NULL,
  city_slug text UNIQUE NOT NULL,
  nearest_1 text,
  nearest_2 text,
  nearest_3 text,
  nearest_areas text,
  county text,
  postcode text,
  phone text DEFAULT '(0800) 0472607',
  email text DEFAULT 'sales@nationalremovalsandstorage.co.uk',
  address1 text,
  address2 text,
  reviews_platform text DEFAULT 'Google',
  reviews_score text,
  accredited text DEFAULT 'Yes',
  nearby_areas text,
  area_links text,
  hero_image text,
  map_embed text,
  map_link text,
  opening_hours text DEFAULT 'Mon–Sat 08:00–18:00; Sun Closed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_locations_city_slug ON locations(city_slug);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_county ON locations(county);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read locations (public information)
CREATE POLICY "Public can view all locations"
  ON locations
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated admin users can insert locations
CREATE POLICY "Admins can insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Policy: Authenticated admin users can update locations
CREATE POLICY "Admins can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Policy: Authenticated admin users can delete locations
CREATE POLICY "Admins can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_locations_updated_at();