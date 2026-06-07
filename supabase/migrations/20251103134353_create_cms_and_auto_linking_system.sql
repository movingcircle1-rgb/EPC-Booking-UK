/*
  # CMS and Auto Linking System

  ## Overview
  This migration creates the complete CMS infrastructure including pages, services, cities,
  testimonials, and the auto-linking and location page generation system.

  ## 1. CMS Tables
    
    ### pages
    - Core CMS pages table for custom content
    
    ### services  
    - Services catalog with features and descriptions
    
    ### cities
    - Location database for dynamic page generation
    
    ### testimonials
    - Customer reviews and ratings

  ## 2. Auto-Linking System
    
    ### keywords
    - Keyword-to-URL mappings for contextual linking
    
    ### page_links
    - Track generated links across pages

  ## 3. Location System
    
    ### location_content_templates
    - Reusable templates for generating location pages
    
    ### location_services
    - Which services are available in each location
    
    ### content_sections
    - Reusable content blocks

  ## 4. Security
    - Enable RLS on all tables
    - Public read access for published content
    - Authenticated write access for admin
*/

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  content jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  featured_image text,
  gallery jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages are viewable by everyone"
  ON pages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage pages"
  ON pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  image_url text,
  features jsonb DEFAULT '[]'::jsonb,
  price_range text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  meta_title text,
  meta_description text,
  county text,
  region text,
  population integer,
  coordinates jsonb DEFAULT '{}'::jsonb,
  postal_codes jsonb DEFAULT '[]'::jsonb,
  areas_covered jsonb DEFAULT '[]'::jsonb,
  local_info text,
  featured_image text,
  is_featured boolean DEFAULT false,
  page_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage cities"
  ON cities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  location text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
  ON testimonials FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Keywords Management Table
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_text text NOT NULL,
  target_url text NOT NULL,
  link_text text,
  priority integer DEFAULT 100,
  is_active boolean DEFAULT true,
  link_frequency text DEFAULT 'first' CHECK (link_frequency IN ('first', 'all', 'limited')),
  max_links_per_page integer DEFAULT 1,
  category text DEFAULT 'general',
  case_sensitive boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_keywords_text ON keywords(keyword_text);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON keywords(is_active);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority DESC);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active keywords"
  ON keywords FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage keywords"
  ON keywords FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Page Links Tracking Table
CREATE TABLE IF NOT EXISTS page_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_page_url text NOT NULL,
  target_page_url text NOT NULL,
  keyword_id uuid REFERENCES keywords(id) ON DELETE CASCADE,
  anchor_text text NOT NULL,
  link_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_links_source ON page_links(source_page_url);
CREATE INDEX IF NOT EXISTS idx_page_links_keyword ON page_links(keyword_id);

ALTER TABLE page_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view page links"
  ON page_links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage page links"
  ON page_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Location Content Templates
CREATE TABLE IF NOT EXISTS location_content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  service_type text NOT NULL,
  hero_title_template text DEFAULT '{{service}} in {{location}}',
  hero_subtitle_template text DEFAULT 'Professional {{service}} services in {{location}} and surrounding areas',
  description_template text,
  meta_title_template text DEFAULT '{{service}} {{location}} | National Removals and Storage',
  meta_description_template text DEFAULT 'Professional {{service}} services in {{location}}. Trusted local removal company with expert team, competitive pricing, and comprehensive insurance.',
  sections jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE location_content_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active templates"
  ON location_content_templates FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage templates"
  ON location_content_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Location Services Junction Table
CREATE TABLE IF NOT EXISTS location_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
  service_slug text NOT NULL,
  is_available boolean DEFAULT true,
  custom_content jsonb DEFAULT '{}'::jsonb,
  pricing_adjustment decimal(5,2) DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(city_id, service_slug)
);

CREATE INDEX IF NOT EXISTS idx_location_services_city ON location_services(city_id);
CREATE INDEX IF NOT EXISTS idx_location_services_service ON location_services(service_slug);
CREATE INDEX IF NOT EXISTS idx_location_services_featured ON location_services(featured);

ALTER TABLE location_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available location services"
  ON location_services FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Authenticated users can manage location services"
  ON location_services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Content Sections for Reusable Blocks
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL CHECK (section_type IN ('hero', 'features', 'benefits', 'cta', 'areas', 'faq', 'testimonials')),
  section_name text NOT NULL,
  content_template text NOT NULL,
  display_order integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active content sections"
  ON content_sections FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage content sections"
  ON content_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample services data
INSERT INTO services (name, slug, description, icon, features, featured) VALUES
('House Removals', 'house-removals', 'Professional house moving services across the UK', 'Home', '["Full packing service", "Secure transportation", "Insurance included", "Furniture assembly"]'::jsonb, true),
('Office Removals', 'office-removals', 'Expert commercial moving solutions', 'Building2', '["Minimal downtime", "IT equipment handling", "Weekend moves available", "Secure document handling"]'::jsonb, true),
('Storage Solutions', 'storage', 'Safe and secure storage facilities', 'Warehouse', '["24/7 security", "Climate controlled", "Flexible terms", "Easy access"]'::jsonb, true),
('Packing Services', 'packing', 'Professional packing and materials', 'Package', '["Quality materials", "Expert packing", "Fragile item care", "Unpacking service"]'::jsonb, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert major UK cities
INSERT INTO cities (name, slug, description, meta_title, meta_description, region, areas_covered, is_featured) VALUES
('London', 'london', 'Professional moving and storage services in London', 'Removals London | National Removals and Storage', 'Expert house and office removals in London. Professional moving services with secure storage solutions.', 'Greater London', '["Central London", "North London", "South London", "East London", "West London", "Greater London"]'::jsonb, true),
('Birmingham', 'birmingham', 'Reliable removals in Birmingham', 'Removals Birmingham | National Removals and Storage', 'Trusted moving services in Birmingham. House and office removals with secure storage.', 'West Midlands', '["City Centre", "Edgbaston", "Moseley", "Harborne", "Selly Oak", "Sutton Coldfield", "Solihull", "West Bromwich"]'::jsonb, true),
('Manchester', 'manchester', 'Top-rated moving services in Manchester', 'Removals Manchester | National Removals and Storage', 'Professional removals and storage in Manchester. Expert moving services.', 'North West', '["City Centre", "Salford", "Trafford", "Stockport", "Oldham", "Rochdale", "Bolton", "Wigan"]'::jsonb, true),
('Leeds', 'leeds', 'Professional removals in Leeds', 'Removals Leeds | National Removals and Storage', 'Reliable moving and storage services in Leeds.', 'Yorkshire', '["City Centre", "Headingley", "Roundhay", "Chapel Allerton", "Horsforth", "Wetherby", "Harrogate", "Bradford"]'::jsonb, true),
('Liverpool', 'liverpool', 'Expert moving services in Liverpool', 'Removals Liverpool | National Removals and Storage', 'Professional removals in Liverpool with secure storage solutions.', 'Merseyside', '["City Centre", "Anfield", "Allerton", "Woolton", "Birkenhead", "Wallasey", "Southport", "St Helens"]'::jsonb, true),
('Bristol', 'bristol', 'Quality removal services in Bristol', 'Removals Bristol | National Removals and Storage', 'Trusted removals company in Bristol offering comprehensive moving services.', 'South West', '["City Centre", "Clifton", "Redland", "Southville", "Bedminster", "Fishponds", "Kingswood", "Filton"]'::jsonb, false),
('Newcastle', 'newcastle', 'Professional movers in Newcastle', 'Removals Newcastle | National Removals and Storage', 'Expert removal and storage services in Newcastle upon Tyne.', 'North East', '["City Centre", "Jesmond", "Gosforth", "Heaton", "Wallsend", "Gateshead", "Whitley Bay", "North Shields"]'::jsonb, false),
('Sheffield', 'sheffield', 'Reliable removals in Sheffield', 'Removals Sheffield | National Removals and Storage', 'Professional moving services covering Sheffield and South Yorkshire.', 'Yorkshire', '["City Centre", "Ecclesall", "Crookes", "Hillsborough", "Dore", "Chapeltown", "Rotherham", "Doncaster"]'::jsonb, false),
('Edinburgh', 'edinburgh', 'Premium removals in Edinburgh', 'Removals Edinburgh | National Removals and Storage', 'Expert house and office removals in Edinburgh and the Lothians.', 'Scotland', '["City Centre", "Leith", "Morningside", "Stockbridge", "Portobello", "Corstorphine", "Musselburgh", "Dalkeith"]'::jsonb, false),
('Glasgow', 'glasgow', 'Top moving services in Glasgow', 'Removals Glasgow | National Removals and Storage', 'Professional removal company serving Glasgow and surrounding areas.', 'Scotland', '["City Centre", "West End", "Southside", "East End", "Partick", "Shawlands", "Paisley", "East Kilbride"]'::jsonb, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert default content templates for services
INSERT INTO location_content_templates (template_name, service_type, hero_title_template, hero_subtitle_template, description_template, meta_title_template, meta_description_template, sections) VALUES
(
  'House Removals Template',
  'house-removals',
  'House Removals in {{location}}',
  'Your trusted local removal company serving {{location}} and surrounding areas',
  'Professional house removal services in {{location}}. We provide comprehensive moving solutions including packing, transportation, and unpacking services.',
  'House Removals {{location}} | National Removals and Storage',
  'Professional house removals in {{location}}. Expert moving services with secure transportation, full insurance, and experienced team. Get your free quote today.',
  '[
    {"type": "services", "title": "Our Services in {{location}}", "content": "We offer comprehensive house removal services tailored to {{location}} residents"},
    {"type": "benefits", "title": "Why Choose Us in {{location}}?", "items": ["Local Expertise", "Experienced Team", "Competitive Pricing", "Fully Insured"]},
    {"type": "areas", "title": "Areas We Cover Near {{location}}", "content": "We provide removal services throughout {{location}} and surrounding areas"}
  ]'::jsonb
),
(
  'Office Removals Template',
  'office-removals',
  'Office Removals in {{location}}',
  'Professional commercial moving solutions in {{location}}',
  'Expert office relocation services in {{location}}. Minimal business disruption with out-of-hours moves available.',
  'Office Removals {{location}} | National Removals and Storage',
  'Professional office removals in {{location}}. Commercial moving with minimal downtime, IT equipment handling, and dedicated project management.',
  '[
    {"type": "services", "title": "Commercial Services in {{location}}", "content": "Specialized office moving services for businesses in {{location}}"},
    {"type": "benefits", "title": "Why Businesses Choose Us", "items": ["Minimal Downtime", "IT Equipment Specialists", "Weekend Moves Available", "Project Management"]}
  ]'::jsonb
),
(
  'Storage Solutions Template',
  'storage',
  'Storage Solutions in {{location}}',
  'Safe, secure storage facilities in {{location}}',
  'Professional storage solutions in {{location}}. Climate-controlled facilities with 24/7 security and flexible terms.',
  'Storage {{location}} | National Removals and Storage',
  'Secure storage in {{location}}. Climate-controlled facilities, 24/7 CCTV, flexible rental terms, and easy access.',
  '[
    {"type": "features", "title": "Storage Features", "items": ["24/7 Security", "Climate Controlled", "Flexible Terms", "Easy Access"]},
    {"type": "cta", "title": "Need Storage in {{location}}?", "content": "Contact us today for a free quote"}
  ]'::jsonb
),
(
  'Packing Services Template',
  'packing',
  'Packing Services in {{location}}',
  'Expert packing services using premium materials in {{location}}',
  'Professional packing services in {{location}}. High-quality materials and expert packing team.',
  'Packing Services {{location}} | National Removals and Storage',
  'Professional packing services in {{location}}. Expert packing team, premium materials, and specialist fragile item care.',
  '[
    {"type": "features", "title": "Packing Services", "items": ["Premium Materials", "Expert Team", "Fragile Item Care", "Unpacking Available"]}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Insert default keywords for auto-linking
INSERT INTO keywords (keyword_text, target_url, priority, category, link_frequency, max_links_per_page) VALUES
('house removals', '/house-removals', 100, 'services', 'first', 1),
('office removals', '/office-removals', 100, 'services', 'first', 1),
('packing services', '/packing-services', 90, 'services', 'first', 1),
('storage solutions', '/storage', 90, 'services', 'first', 1),
('international moves', '/international-moves', 80, 'services', 'first', 1),
('european moves', '/european-moves', 80, 'services', 'first', 1),
('furniture removal', '/furniture-removal', 70, 'services', 'first', 1),
('removal company', '/about', 60, 'company', 'first', 1),
('free quote', '/contact', 50, 'cta', 'all', 3),
('get a quote', '/contact', 50, 'cta', 'all', 3)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (name, rating, comment, location) VALUES
('Sarah Johnson', 5, 'Excellent service from start to finish. The team was professional, careful with our belongings, and completed the move efficiently.', 'London'),
('Michael Brown', 5, 'Very impressed with the storage facilities. Clean, secure, and easy to access. Highly recommended!', 'Manchester'),
('Emma Wilson', 4, 'Great communication and helpful staff. Made our office move seamless with minimal disruption.', 'Birmingham'),
('David Smith', 5, 'Professional and reliable. Our house move to Leeds was stress-free thanks to their excellent service.', 'Leeds'),
('Rachel Green', 5, 'Outstanding packing service. They took care of everything and nothing was damaged. Would definitely use again!', 'Bristol')
ON CONFLICT DO NOTHING;

-- Create function to auto-generate location services when new city is added
CREATE OR REPLACE FUNCTION auto_create_location_services()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO location_services (city_id, service_slug, is_available)
  VALUES
    (NEW.id, 'house-removals', true),
    (NEW.id, 'office-removals', true),
    (NEW.id, 'packing', true),
    (NEW.id, 'storage', true)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_location_services ON cities;
CREATE TRIGGER trigger_auto_create_location_services
  AFTER INSERT ON cities
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_location_services();
