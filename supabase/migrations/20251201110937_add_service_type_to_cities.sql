/*
  # Add Service Type and Content to Cities Table

  1. Changes
    - Add `service_type` column to cities table for service categorization
    - Add `service_content` column to cities table for custom service-specific content
    - Service types: house-removals, office-removals, packing-services, storage-solutions
  
  2. Purpose
    - Allow admins to create different content for each service type per location
    - Content will be displayed on the frontend based on selected service type
*/

-- Add service type and content columns to cities table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cities' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE cities ADD COLUMN service_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cities' AND column_name = 'service_content'
  ) THEN
    ALTER TABLE cities ADD COLUMN service_content text;
  END IF;
END $$;

-- Add check constraint for service_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cities_service_type_check'
  ) THEN
    ALTER TABLE cities 
    ADD CONSTRAINT cities_service_type_check 
    CHECK (service_type IN ('house-removals', 'office-removals', 'packing-services', 'storage-solutions') OR service_type IS NULL);
  END IF;
END $$;