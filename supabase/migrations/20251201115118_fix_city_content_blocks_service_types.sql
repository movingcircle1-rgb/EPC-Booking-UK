/*
  # Fix city_content_blocks service type constraint
  
  1. Changes
    - Drop old constraint that only allowed 'packing' and 'storage'
    - Add new constraint that allows 'packing-services' and 'storage-solutions'
    - Keeps all 4 main service types consistent with rest of system
  
  2. Security
    - No changes to RLS policies needed
*/

-- Drop the old constraint
ALTER TABLE city_content_blocks 
DROP CONSTRAINT IF EXISTS city_content_blocks_valid_service_type;

-- Add new constraint with correct service type names
ALTER TABLE city_content_blocks
ADD CONSTRAINT city_content_blocks_valid_service_type 
CHECK (service_type = ANY (ARRAY[
  'general'::text,
  'house-removals'::text,
  'office-removals'::text,
  'packing-services'::text,
  'storage-solutions'::text,
  'furniture-removal'::text,
  'international-moves'::text,
  'european-moves'::text
]));