/*
  # Enhance Existing Partner Tables

  ## Overview
  Adds missing columns to existing tables and creates new tables for partner portal

  ## Changes
  1. Add missing columns to marketing_materials
  2. Create account_managers table
  3. Create commission_statements table
  4. Create material_downloads table
  5. Add account_manager_id to partners

  ## Security
  - RLS policies for all new tables
*/

-- Add missing columns to marketing_materials
ALTER TABLE marketing_materials
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS file_size text,
ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0;

-- Create account_managers table
CREATE TABLE IF NOT EXISTS account_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text DEFAULT 'Partner Relations',
  bio text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create commission_statements table
CREATE TABLE IF NOT EXISTS commission_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  statement_period text NOT NULL,
  statement_month integer NOT NULL,
  statement_year integer NOT NULL,
  total_referrals integer DEFAULT 0,
  completed_referrals integer DEFAULT 0,
  total_commission decimal(10,2) DEFAULT 0,
  paid_amount decimal(10,2) DEFAULT 0,
  outstanding_amount decimal(10,2) DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_date timestamptz,
  payment_reference text,
  statement_file_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, statement_month, statement_year)
);

-- Create material downloads tracking table
CREATE TABLE IF NOT EXISTS material_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES marketing_materials(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now()
);

-- Add account_manager_id to partners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partners' AND column_name = 'account_manager_id'
  ) THEN
    ALTER TABLE partners ADD COLUMN account_manager_id uuid REFERENCES account_managers(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_commission_statements_partner ON commission_statements(partner_id);
CREATE INDEX IF NOT EXISTS idx_commission_statements_period ON commission_statements(statement_year, statement_month);
CREATE INDEX IF NOT EXISTS idx_material_downloads_partner ON material_downloads(partner_id);
CREATE INDEX IF NOT EXISTS idx_material_downloads_material ON material_downloads(material_id);

-- Enable RLS on new tables
ALTER TABLE account_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_managers
CREATE POLICY "account_managers_select_active"
  ON account_managers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "account_managers_admin_all"
  ON account_managers
  FOR ALL
  TO authenticated
  USING (public.check_is_admin(auth.uid()))
  WITH CHECK (public.check_is_admin(auth.uid()));

-- RLS Policies for commission_statements
CREATE POLICY "statements_select_own_or_admin"
  ON commission_statements
  FOR SELECT
  TO authenticated
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    OR
    public.check_is_admin(auth.uid())
  );

CREATE POLICY "statements_admin_manage"
  ON commission_statements
  FOR ALL
  TO authenticated
  USING (public.check_is_admin(auth.uid()))
  WITH CHECK (public.check_is_admin(auth.uid()));

-- RLS Policies for material_downloads
CREATE POLICY "downloads_insert_own"
  ON material_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "downloads_select_own_or_admin"
  ON material_downloads
  FOR SELECT
  TO authenticated
  USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    OR
    public.check_is_admin(auth.uid())
  );

-- Update existing marketing materials with file info
UPDATE marketing_materials
SET file_type = 'PDF', file_size = '1.5 MB'
WHERE file_type IS NULL;

-- Insert sample marketing materials if none exist
INSERT INTO marketing_materials (title, description, category, file_url, file_type, file_size, is_downloadable, is_active, display_order)
SELECT * FROM (VALUES
  ('Partner Brochure 2024', 'Complete overview of our services and partnership benefits', 'Brochures', '/materials/partner-brochure-2024.pdf', 'PDF', '2.5 MB', true, true, 1),
  ('Service Price List', 'Current pricing structure for all removal services', 'Price Lists', '/materials/price-list.pdf', 'PDF', '850 KB', true, true, 2),
  ('Referral Form Template', 'Printable referral form for offline submissions', 'Forms', '/materials/referral-form.pdf', 'PDF', '420 KB', true, true, 3),
  ('Logo Pack', 'High-resolution logos in various formats', 'Branding', '/materials/logo-pack.zip', 'ZIP', '5.2 MB', true, true, 4),
  ('Social Media Graphics', 'Ready-to-use graphics for social media promotion', 'Marketing', '/materials/social-graphics.zip', 'ZIP', '12 MB', true, true, 5),
  ('Email Signature Template', 'Professional email signature with partnership badge', 'Templates', 'HTML', '/materials/email-signature.html', '15 KB', true, true, 6)
) AS v(title, description, category, file_url, file_type, file_size, is_downloadable, is_active, display_order)
WHERE NOT EXISTS (SELECT 1 FROM marketing_materials LIMIT 1);

-- Insert sample account managers
INSERT INTO account_managers (full_name, email, phone, department, bio, is_active)
SELECT * FROM (VALUES
  ('Sarah Johnson', 'sarah.johnson@nationalremovals.co.uk', '020 1234 5678', 'Partner Relations', 'Experienced partner relations manager with over 10 years in the removals industry. Dedicated to helping our partners succeed.', true),
  ('Michael Davies', 'michael.davies@nationalremovals.co.uk', '020 1234 5679', 'Partner Relations', 'Specializes in building strong partnerships and providing exceptional support to our valued partners.', true)
) AS v(full_name, email, phone, department, bio, is_active)
WHERE NOT EXISTS (SELECT 1 FROM account_managers LIMIT 1);
