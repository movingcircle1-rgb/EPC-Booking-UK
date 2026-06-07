/*
  # Create Automatic Location Page Generation System

  1. New Features
    - Auto-generation status tracking for locations
    - Automatic slug generation function
    - Automatic SEO metadata generation
    - Trigger to sync locations to cities table
    - Queue system for bulk generation
    - Validation functions

  2. Tables Enhanced
    - `locations` - Add generation tracking fields
    - `location_generation_queue` - New table for tracking generation jobs
    - `location_generation_log` - New table for audit trail

  3. Functions
    - `generate_location_slug()` - Auto-generate URL-friendly slugs
    - `generate_location_seo()` - Auto-generate SEO metadata
    - `auto_sync_location_to_cities()` - Sync locations to cities table
    - `validate_location_data()` - Validate location before generation
    - `bulk_generate_locations()` - Process bulk generation requests

  4. Security
    - RLS policies for new tables
    - Admin-only access for generation queue management
*/

-- Add generation tracking fields to locations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'generation_status'
  ) THEN
    ALTER TABLE locations ADD COLUMN generation_status text DEFAULT 'published'
      CHECK (generation_status IN ('draft', 'generating', 'published', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'auto_generated'
  ) THEN
    ALTER TABLE locations ADD COLUMN auto_generated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'generation_error'
  ) THEN
    ALTER TABLE locations ADD COLUMN generation_error text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'last_generated_at'
  ) THEN
    ALTER TABLE locations ADD COLUMN last_generated_at timestamptz;
  END IF;
END $$;

-- Create location generation queue table
CREATE TABLE IF NOT EXISTS location_generation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  county text,
  region text,
  additional_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_generation_queue_status ON location_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_generation_queue_created_at ON location_generation_queue(created_at);

ALTER TABLE location_generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view generation queue"
  ON location_generation_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'temp_admin')
    )
  );

CREATE POLICY "Admins can manage generation queue"
  ON location_generation_queue FOR ALL
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

-- Create generation log table
CREATE TABLE IF NOT EXISTS location_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generation_log_location_id ON location_generation_log(location_id);
CREATE INDEX IF NOT EXISTS idx_generation_log_created_at ON location_generation_log(created_at);

ALTER TABLE location_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view generation log"
  ON location_generation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'temp_admin')
    )
  );

-- Function: Generate URL-friendly slug from city name
CREATE OR REPLACE FUNCTION generate_location_slug(city_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(trim(city_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM locations WHERE city_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate SEO metadata automatically
CREATE OR REPLACE FUNCTION generate_location_seo(
  city_name text,
  county text DEFAULT NULL,
  region text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  location_context text;
  seo_data jsonb;
BEGIN
  location_context := city_name;
  IF county IS NOT NULL AND county != '' THEN
    location_context := location_context || ', ' || county;
  END IF;

  seo_data := jsonb_build_object(
    'meta_title', 'Removals Company ' || city_name || ' | Professional Moving Services',
    'meta_description', 'Professional removal services in ' || location_context || '. Affordable house removals, office moves, man and van services. Fully insured. Get your free quote today!',
    'hero_title', 'Removals Company ' || city_name,
    'hero_subtitle', 'Professional removal services in ' || location_context,
    'map_embed', 'https://www.google.com/maps?q=' || regexp_replace(city_name || '+United+Kingdom', '\s+', '+', 'g') || '&output=embed',
    'map_link', 'https://www.google.com/maps?q=' || regexp_replace(city_name || '+United+Kingdom', '\s+', '+', 'g')
  );

  RETURN seo_data;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate location data before generation
CREATE OR REPLACE FUNCTION validate_location_data(
  city_name text,
  city_slug text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  validation_result jsonb;
  is_valid boolean := true;
  errors text[] := ARRAY[]::text[];
BEGIN
  IF city_name IS NULL OR trim(city_name) = '' THEN
    is_valid := false;
    errors := array_append(errors, 'City name is required');
  END IF;

  IF city_slug IS NOT NULL AND EXISTS (SELECT 1 FROM locations WHERE locations.city_slug = city_slug) THEN
    is_valid := false;
    errors := array_append(errors, 'City slug already exists');
  END IF;

  IF length(trim(city_name)) < 2 THEN
    is_valid := false;
    errors := array_append(errors, 'City name must be at least 2 characters');
  END IF;

  validation_result := jsonb_build_object(
    'is_valid', is_valid,
    'errors', errors
  );

  RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-sync location to cities table
CREATE OR REPLACE FUNCTION auto_sync_location_to_cities()
RETURNS TRIGGER AS $$
DECLARE
  seo_data jsonb;
  areas_array text[];
BEGIN
  seo_data := generate_location_seo(NEW.city, NEW.county, NULL);

  IF NEW.nearby_areas IS NOT NULL AND NEW.nearby_areas != '' THEN
    areas_array := string_to_array(NEW.nearby_areas, ',');
    areas_array := array(SELECT trim(unnest(areas_array)));
  ELSE
    areas_array := ARRAY[
      NEW.city || ' City Centre',
      NEW.city || ' North',
      NEW.city || ' South',
      NEW.city || ' East',
      NEW.city || ' West'
    ];
  END IF;

  INSERT INTO cities (
    name,
    slug,
    description,
    meta_title,
    meta_description,
    county,
    region,
    areas_covered,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    NEW.city,
    NEW.city_slug,
    'Professional removal and storage services in ' || NEW.city,
    seo_data->>'meta_title',
    seo_data->>'meta_description',
    NEW.county,
    NULL,
    to_jsonb(areas_array),
    false,
    now(),
    now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    county = EXCLUDED.county,
    areas_covered = EXCLUDED.areas_covered,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync locations to cities
DROP TRIGGER IF EXISTS trigger_auto_sync_location_to_cities ON locations;
CREATE TRIGGER trigger_auto_sync_location_to_cities
  AFTER INSERT OR UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION auto_sync_location_to_cities();

-- Function: Process location generation from queue
CREATE OR REPLACE FUNCTION process_location_generation(queue_id uuid)
RETURNS jsonb AS $$
DECLARE
  queue_record location_generation_queue%ROWTYPE;
  new_location_id uuid;
  generated_slug text;
  seo_data jsonb;
  validation_result jsonb;
  result jsonb;
BEGIN
  SELECT * INTO queue_record FROM location_generation_queue WHERE id = queue_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Queue record not found');
  END IF;

  UPDATE location_generation_queue SET status = 'processing', processed_at = now() WHERE id = queue_id;

  generated_slug := generate_location_slug(queue_record.city_name);

  validation_result := validate_location_data(queue_record.city_name, generated_slug);

  IF NOT (validation_result->>'is_valid')::boolean THEN
    UPDATE location_generation_queue
    SET status = 'failed',
        error_message = validation_result->>'errors',
        completed_at = now()
    WHERE id = queue_id;

    RETURN jsonb_build_object('success', false, 'errors', validation_result->'errors');
  END IF;

  seo_data := generate_location_seo(
    queue_record.city_name,
    queue_record.county,
    queue_record.region
  );

  INSERT INTO locations (
    domain,
    city,
    city_slug,
    county,
    phone,
    email,
    reviews_platform,
    accredited,
    opening_hours,
    map_embed,
    map_link,
    generation_status,
    auto_generated,
    last_generated_at,
    created_at,
    updated_at
  ) VALUES (
    'https://nationalremovalsandstorage.co.uk/',
    queue_record.city_name,
    generated_slug,
    queue_record.county,
    '(0800) 0472607',
    'sales@nationalremovalsandstorage.co.uk',
    'Google',
    'Yes',
    'Mon–Sat 08:00–18:00; Sun Closed',
    seo_data->>'map_embed',
    seo_data->>'map_link',
    'published',
    true,
    now(),
    now(),
    now()
  ) RETURNING id INTO new_location_id;

  UPDATE location_generation_queue
  SET status = 'completed',
      location_id = new_location_id,
      completed_at = now()
  WHERE id = queue_id;

  INSERT INTO location_generation_log (location_id, action, details, performed_by)
  VALUES (
    new_location_id,
    'auto_generated',
    jsonb_build_object('queue_id', queue_id, 'city_name', queue_record.city_name),
    queue_record.created_by
  );

  result := jsonb_build_object(
    'success', true,
    'location_id', new_location_id,
    'city_slug', generated_slug,
    'url', '/removals-' || generated_slug
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk generate locations from array of city names
CREATE OR REPLACE FUNCTION bulk_generate_locations(
  cities_data jsonb,
  created_by_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  city_record jsonb;
  queue_ids uuid[] := ARRAY[]::uuid[];
  new_queue_id uuid;
  total_count integer := 0;
BEGIN
  FOR city_record IN SELECT * FROM jsonb_array_elements(cities_data)
  LOOP
    INSERT INTO location_generation_queue (
      city_name,
      county,
      region,
      additional_data,
      created_by,
      status
    ) VALUES (
      city_record->>'city',
      city_record->>'county',
      city_record->>'region',
      COALESCE(city_record->'additional_data', '{}'::jsonb),
      created_by_id,
      'pending'
    ) RETURNING id INTO new_queue_id;

    queue_ids := array_append(queue_ids, new_queue_id);
    total_count := total_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'queued_count', total_count,
    'queue_ids', queue_ids
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_location_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_location_seo(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_location_data(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION process_location_generation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_generate_locations(jsonb, uuid) TO authenticated;
