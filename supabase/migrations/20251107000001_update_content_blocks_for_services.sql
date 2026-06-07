/*
  # Update Content Blocks to Support Service-Specific Content

  ## Overview
  This migration updates the content blocks tables to support different content
  for each service type (house-removals, office-removals, storage, packing) per city.

  ## Changes
    1. Add service_type column to city_content_blocks
    2. Add service_type column to location_content_blocks
    3. Update unique constraints to include service_type
    4. Add indexes for efficient service-specific queries

  ## Service Types
    - house-removals
    - office-removals
    - storage
    - packing
    - general (default for non-service-specific content)
*/

-- Drop existing unique constraint on city_content_blocks
ALTER TABLE city_content_blocks DROP CONSTRAINT IF EXISTS city_content_blocks_city_id_block_position_key;

-- Add service_type column to city_content_blocks
ALTER TABLE city_content_blocks ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'general' NOT NULL;

-- Update unique constraint to include service_type
ALTER TABLE city_content_blocks
  ADD CONSTRAINT city_content_blocks_city_service_position_key
  UNIQUE(city_id, service_type, block_position);

-- Add index for service-specific queries
CREATE INDEX IF NOT EXISTS idx_city_content_blocks_service_type ON city_content_blocks(service_type);
CREATE INDEX IF NOT EXISTS idx_city_content_blocks_city_service ON city_content_blocks(city_id, service_type);

-- Drop existing unique constraint on location_content_blocks
ALTER TABLE location_content_blocks DROP CONSTRAINT IF EXISTS location_content_blocks_location_id_block_position_key;

-- Add service_type column to location_content_blocks
ALTER TABLE location_content_blocks ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'general' NOT NULL;

-- Update unique constraint to include service_type
ALTER TABLE location_content_blocks
  ADD CONSTRAINT location_content_blocks_location_service_position_key
  UNIQUE(location_id, service_type, block_position);

-- Add index for service-specific queries
CREATE INDEX IF NOT EXISTS idx_location_content_blocks_service_type ON location_content_blocks(service_type);
CREATE INDEX IF NOT EXISTS idx_location_content_blocks_location_service ON location_content_blocks(location_id, service_type);

-- Add check constraint for valid service types
ALTER TABLE city_content_blocks
  ADD CONSTRAINT city_content_blocks_valid_service_type
  CHECK (service_type IN ('general', 'house-removals', 'office-removals', 'storage', 'packing', 'furniture-removal', 'international-moves', 'european-moves'));

ALTER TABLE location_content_blocks
  ADD CONSTRAINT location_content_blocks_valid_service_type
  CHECK (service_type IN ('general', 'house-removals', 'office-removals', 'storage', 'packing', 'furniture-removal', 'international-moves', 'european-moves'));
