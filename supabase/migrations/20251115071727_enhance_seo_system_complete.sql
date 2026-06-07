/*
  # Enhance SEO System - Complete Implementation

  1. Tables
    - Enhance page_seo_metadata with better fields
    - Add default SEO settings table
    - Add sitemap configuration

  2. Features
    - Global SEO settings
    - Page-specific SEO overrides
    - Automatic sitemap generation support
    - Image optimization settings

  3. Security
    - Public read access for SEO data
    - Admin-only write access
*/

-- Create global SEO settings table
CREATE TABLE IF NOT EXISTS global_seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'National Removals',
  site_description text NOT NULL DEFAULT 'Professional removal services across the UK',
  default_og_image text,
  twitter_handle text,
  facebook_app_id text,
  google_site_verification text,
  bing_site_verification text,
  default_robots text DEFAULT 'index, follow',
  sitemap_enabled boolean DEFAULT true,
  sitemap_priority numeric DEFAULT 0.5,
  sitemap_changefreq text DEFAULT 'weekly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_seo_settings ENABLE ROW LEVEL SECURITY;

-- Public can read global SEO settings
CREATE POLICY "Anyone can view global SEO settings"
  ON global_seo_settings FOR SELECT
  TO public
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update global SEO settings"
  ON global_seo_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

-- Insert default global settings if not exists
INSERT INTO global_seo_settings (id, site_name, site_description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'National Removals',
  'Professional removal and storage services across the UK. House removals, office moves, packing services, and secure storage solutions.'
)
ON CONFLICT (id) DO NOTHING;

-- Add columns to page_seo_metadata if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_seo_metadata' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE page_seo_metadata ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_seo_metadata' AND column_name = 'sitemap_include'
  ) THEN
    ALTER TABLE page_seo_metadata ADD COLUMN sitemap_include boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_seo_metadata' AND column_name = 'page_type'
  ) THEN
    ALTER TABLE page_seo_metadata ADD COLUMN page_type text DEFAULT 'page';
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_seo_path ON page_seo_metadata(page_path);
CREATE INDEX IF NOT EXISTS idx_page_seo_active ON page_seo_metadata(is_active);

-- Insert default SEO settings for main pages
INSERT INTO page_seo_metadata (page_path, page_title, meta_title, meta_description, canonical_url, priority, changefreq, sitemap_include, page_type, robots)
VALUES
  ('/', 'Home', 'National Removals - Professional Moving & Storage Services UK', 'Professional removal services across the UK. House removals, office moves, European relocations, packing services, and secure storage. Free quotes available.', 'https://nationalremovals.co.uk/', 1.0, 'daily', true, 'page', 'index, follow'),
  ('/services', 'Services', 'Our Removal Services - National Removals', 'Comprehensive removal and storage services including house moves, office relocations, packing, storage, and European moves. Professional service nationwide.', 'https://nationalremovals.co.uk/services', 0.9, 'weekly', true, 'page', 'index, follow'),
  ('/about', 'About Us', 'About National Removals - UK Moving Experts', 'Learn about National Removals, your trusted partner for professional moving services across the UK. Over 20 years of experience in house and office removals.', 'https://nationalremovals.co.uk/about', 0.7, 'monthly', true, 'page', 'index, follow'),
  ('/contact', 'Contact', 'Contact National Removals - Get Your Free Quote', 'Get in touch with National Removals for a free, no-obligation quote. Call us or fill out our contact form for professional removal services.', 'https://nationalremovals.co.uk/contact', 0.8, 'monthly', true, 'page', 'index, follow'),
  ('/house-removals', 'House Removals', 'House Removals UK - Professional Home Moving Services', 'Professional house removal services across the UK. Experienced team, careful handling, and competitive prices. Get your free quote today.', 'https://nationalremovals.co.uk/house-removals', 0.9, 'weekly', true, 'service', 'index, follow'),
  ('/office-removals', 'Office Removals', 'Office Removals & Business Relocation Services', 'Professional office moving services with minimal disruption to your business. Secure handling of IT equipment, furniture, and documents.', 'https://nationalremovals.co.uk/office-removals', 0.9, 'weekly', true, 'service', 'index, follow'),
  ('/packing-services', 'Packing Services', 'Professional Packing Services - National Removals', 'Expert packing services to protect your belongings. High-quality materials and experienced packers ensure safe transportation.', 'https://nationalremovals.co.uk/packing-services', 0.8, 'weekly', true, 'service', 'index, follow'),
  ('/storage', 'Storage', 'Secure Storage Solutions - Short & Long Term', 'Secure, climate-controlled storage facilities across the UK. Flexible short-term and long-term storage options for household and business items.', 'https://nationalremovals.co.uk/storage', 0.8, 'weekly', true, 'service', 'index, follow'),
  ('/european-moves', 'European Moves', 'European Removals - Moving Across Europe', 'Professional removal services to and from Europe. Experienced in international relocations with full customs and shipping support.', 'https://nationalremovals.co.uk/european-moves', 0.8, 'weekly', true, 'service', 'index, follow'),
  ('/international-moves', 'International Moves', 'International Removals - Worldwide Moving Services', 'Global removal services for international relocations. Professional packing, shipping, and customs clearance for moves worldwide.', 'https://nationalremovals.co.uk/international-moves', 0.8, 'weekly', true, 'service', 'index, follow'),
  ('/furniture-removal', 'Furniture Removal', 'Furniture Removal & Donation Services', 'Responsible furniture removal services. We donate usable items to charities and recycle materials to reduce environmental impact.', 'https://nationalremovals.co.uk/furniture-removal', 0.7, 'monthly', true, 'service', 'index, follow'),
  ('/free-storage', 'Free Storage', 'Free Storage Offer - National Removals', 'Enjoy free storage for the first month with qualifying moves. Secure, climate-controlled facilities perfect for home and office items.', 'https://nationalremovals.co.uk/free-storage', 0.7, 'monthly', true, 'offer', 'index, follow'),
  ('/mid-week-discount', 'Mid-Week Discount', 'Mid-Week Moving Discount - Save on Your Move', 'Save money on your move with our mid-week discount. Book Monday to Thursday and enjoy reduced rates on all our services.', 'https://nationalremovals.co.uk/mid-week-discount', 0.7, 'monthly', true, 'offer', 'index, follow'),
  ('/blue-light-card', 'Blue Light Card', 'Blue Light Card Discount - NHS & Emergency Services', 'Special discounts for NHS staff, emergency services, and armed forces personnel. Show your Blue Light Card for exclusive savings.', 'https://nationalremovals.co.uk/blue-light-card', 0.7, 'monthly', true, 'offer', 'index, follow')
ON CONFLICT (page_path) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  canonical_url = EXCLUDED.canonical_url,
  priority = EXCLUDED.priority,
  changefreq = EXCLUDED.changefreq,
  sitemap_include = EXCLUDED.sitemap_include,
  page_type = EXCLUDED.page_type,
  robots = EXCLUDED.robots,
  updated_at = now();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for page_seo_metadata
DROP TRIGGER IF EXISTS update_page_seo_metadata_updated_at ON page_seo_metadata;
CREATE TRIGGER update_page_seo_metadata_updated_at
  BEFORE UPDATE ON page_seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_updated_at();

-- Create trigger for global_seo_settings
DROP TRIGGER IF EXISTS update_global_seo_settings_updated_at ON global_seo_settings;
CREATE TRIGGER update_global_seo_settings_updated_at
  BEFORE UPDATE ON global_seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_updated_at();