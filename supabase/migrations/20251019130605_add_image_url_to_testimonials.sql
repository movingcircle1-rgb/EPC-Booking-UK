/*
  # Add image_url column to testimonials table

  1. Changes
    - Add `image_url` column to `testimonials` table to store customer profile pictures
    - Column is nullable to allow existing testimonials without images
    - Default value is an empty string for backward compatibility
  
  2. Notes
    - This field will store URLs to profile images
    - Images can be hosted on external services like Pexels or uploaded to storage
    - Existing testimonials will have NULL values which can be updated later
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN image_url text;
  END IF;
END $$;