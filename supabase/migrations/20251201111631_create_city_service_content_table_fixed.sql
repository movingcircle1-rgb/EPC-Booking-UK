/*
  # Create City Service Content Table

  1. New Table: city_service_content
    - Stores unique content for each city + service type combination
    - One city can have multiple rows (one per service type)
    - Each service type can have its own unique content
  
  2. Columns:
    - id (uuid, primary key)
    - city_id (uuid, references cities table)
    - service_type (text: house-removals, office-removals, packing-services, storage-solutions)
    - content (text: custom content for this service)
    - meta_title (text, optional)
    - meta_description (text, optional)
    - created_at (timestamp)
    - updated_at (timestamp)
  
  3. Security:
    - Enable RLS
    - Public can read published content
    - Admin2 can manage all content
*/

-- Create city_service_content table
CREATE TABLE IF NOT EXISTS city_service_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('house-removals', 'office-removals', 'packing-services', 'storage-solutions')),
  content text NOT NULL DEFAULT '',
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint: one entry per city + service type
CREATE UNIQUE INDEX IF NOT EXISTS city_service_content_city_service_unique 
ON city_service_content(city_id, service_type);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS city_service_content_city_id_idx ON city_service_content(city_id);
CREATE INDEX IF NOT EXISTS city_service_content_service_type_idx ON city_service_content(service_type);

-- Enable RLS
ALTER TABLE city_service_content ENABLE ROW LEVEL SECURITY;

-- Public can read all content
CREATE POLICY "Anyone can view city service content"
  ON city_service_content
  FOR SELECT
  TO public
  USING (true);

-- Admin2 can insert content
CREATE POLICY "Admin2 can insert city service content"
  ON city_service_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Admin2 can update content
CREATE POLICY "Admin2 can update city service content"
  ON city_service_content
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

-- Admin2 can delete content
CREATE POLICY "Admin2 can delete city service content"
  ON city_service_content
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );