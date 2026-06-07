/*
  # City Content Blocks for SEO

  ## Overview
  This migration creates tables to store unique SEO content for city pages.
  Each city can have up to 3 content blocks with headings, text, and images.
  Supports both the 'cities' and 'locations' tables.

  ## 1. New Tables
    - `city_content_blocks` (for cities table)
      - `id` (uuid, primary key)
      - `city_id` (uuid, foreign key to cities table)
      - `block_position` (integer, 1-3)
      - `heading` (text, H2 heading for the block)
      - `content` (text, main paragraph content)
      - `image_url` (text, URL to the image)
      - `image_alt` (text, alt text for accessibility)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `location_content_blocks` (for locations table)
      - Same structure as city_content_blocks but references locations table

  ## 2. Security
    - Enable RLS on both tables
    - Public read access for published content
    - Authenticated admin write access

  ## 3. Indexes
    - Index on city_id/location_id for fast lookups
    - Unique constraint on (city_id/location_id, block_position) to prevent duplicates
*/

-- Create city_content_blocks table (for cities table)
CREATE TABLE IF NOT EXISTS city_content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  block_position integer NOT NULL CHECK (block_position BETWEEN 1 AND 3),
  heading text NOT NULL,
  content text NOT NULL,
  image_url text,
  image_alt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(city_id, block_position)
);

-- Create location_content_blocks table (for locations table)
CREATE TABLE IF NOT EXISTS location_content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  block_position integer NOT NULL CHECK (block_position BETWEEN 1 AND 3),
  heading text NOT NULL,
  content text NOT NULL,
  image_url text,
  image_alt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, block_position)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_city_content_blocks_city_id ON city_content_blocks(city_id);
CREATE INDEX IF NOT EXISTS idx_location_content_blocks_location_id ON location_content_blocks(location_id);
CREATE INDEX IF NOT EXISTS idx_city_content_blocks_position ON city_content_blocks(block_position);
CREATE INDEX IF NOT EXISTS idx_location_content_blocks_position ON location_content_blocks(block_position);

-- Enable Row Level Security
ALTER TABLE city_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_content_blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read content blocks (public information)
CREATE POLICY "Public can view all content blocks"
  ON city_content_blocks
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated admin users can insert content blocks
CREATE POLICY "Admins can insert content blocks"
  ON city_content_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

-- Policy: Authenticated admin users can update content blocks
CREATE POLICY "Admins can update content blocks"
  ON city_content_blocks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

-- Policy: Authenticated admin users can delete content blocks
CREATE POLICY "Admins can delete content blocks"
  ON city_content_blocks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_city_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_city_content_blocks_updated_at ON city_content_blocks;
CREATE TRIGGER trigger_update_city_content_blocks_updated_at
  BEFORE UPDATE ON city_content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_city_content_blocks_updated_at();

-- RLS Policies for location_content_blocks table
CREATE POLICY "Public can view all location content blocks"
  ON location_content_blocks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert location content blocks"
  ON location_content_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

CREATE POLICY "Admins can update location content blocks"
  ON location_content_blocks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

CREATE POLICY "Admins can delete location content blocks"
  ON location_content_blocks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin-2')
    )
  );

-- Create function to update updated_at timestamp for location_content_blocks
CREATE OR REPLACE FUNCTION update_location_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for location_content_blocks
DROP TRIGGER IF EXISTS trigger_update_location_content_blocks_updated_at ON location_content_blocks;
CREATE TRIGGER trigger_update_location_content_blocks_updated_at
  BEFORE UPDATE ON location_content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_location_content_blocks_updated_at();
