/*
  # MovingCircle CMS Database Schema

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL identifier
      - `title` (text) - Page title
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `hero_title` (text) - Hero section title
      - `hero_subtitle` (text) - Hero section subtitle
      - `hero_image_url` (text) - Hero background image
      - `content` (jsonb) - Page content sections
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `services`
      - `id` (uuid, primary key)
      - `name` (text) - Service name
      - `slug` (text, unique) - URL identifier
      - `description` (text) - Short description
      - `icon` (text) - Icon identifier
      - `image_url` (text) - Service image
      - `features` (jsonb) - Service features array
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cities`
      - `id` (uuid, primary key)
      - `name` (text) - City name
      - `slug` (text, unique) - URL identifier
      - `description` (text) - City-specific description
      - `meta_title` (text) - SEO meta title
      - `meta_description` (text) - SEO meta description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `quotes`
      - `id` (uuid, primary key)
      - `name` (text) - Customer name
      - `email` (text) - Customer email
      - `phone` (text) - Customer phone
      - `service_type` (text) - Removals/Storage
      - `location` (text) - Customer location
      - `message` (text) - Additional details
      - `status` (text) - New/Contacted/Completed
      - `created_at` (timestamptz)

    - `testimonials`
      - `id` (uuid, primary key)
      - `name` (text) - Customer name
      - `rating` (integer) - Rating 1-5
      - `comment` (text) - Testimonial text
      - `location` (text) - Customer location
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for pages, services, cities, testimonials
    - Authenticated write access for admin
    - Quote submissions allowed for all
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

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text NOT NULL,
  location text,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quotes"
  ON quotes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update quotes"
  ON quotes FOR UPDATE
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

-- Insert sample data
INSERT INTO services (name, slug, description, icon, features) VALUES
('House Removals', 'house-removals', 'Professional house moving services across the UK', 'Home', '["Full packing service", "Secure transportation", "Insurance included", "Furniture assembly"]'),
('Office Removals', 'office-removals', 'Expert commercial moving solutions', 'Building2', '["Minimal downtime", "IT equipment handling", "Weekend moves available", "Secure document handling"]'),
('Storage Solutions', 'storage', 'Safe and secure storage facilities', 'Warehouse', '["24/7 security", "Climate controlled", "Flexible terms", "Easy access"]'),
('Packing Services', 'packing', 'Professional packing and materials', 'Package', '["Quality materials", "Expert packing", "Fragile item care", "Unpacking service"]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (name, slug, description, meta_title, meta_description) VALUES
('London', 'london', 'Professional moving and storage services in London', 'Removals London | National Removals and Storage', 'Expert house and office removals in London. Professional moving services with secure storage solutions.'),
('Birmingham', 'birmingham', 'Reliable removals in Birmingham', 'Removals Birmingham | National Removals and Storage', 'Trusted moving services in Birmingham. House and office removals with secure storage.'),
('Manchester', 'manchester', 'Top-rated moving services in Manchester', 'Removals Manchester | National Removals and Storage', 'Professional removals and storage in Manchester. Expert moving services.'),
('Leeds', 'leeds', 'Professional removals in Leeds', 'Removals Leeds | National Removals and Storage', 'Reliable moving and storage services in Leeds.'),
('Liverpool', 'liverpool', 'Expert moving services in Liverpool', 'Removals Liverpool | National Removals and Storage', 'Professional removals in Liverpool with secure storage solutions.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO testimonials (name, rating, comment, location) VALUES
('Sarah Johnson', 5, 'Excellent service from start to finish. The team was professional, careful with our belongings, and completed the move efficiently.', 'London'),
('Michael Brown', 5, 'Very impressed with the storage facilities. Clean, secure, and easy to access. Highly recommended!', 'Manchester'),
('Emma Wilson', 4, 'Great communication and helpful staff. Made our office move seamless with minimal disruption.', 'Birmingham')
ON CONFLICT DO NOTHING;