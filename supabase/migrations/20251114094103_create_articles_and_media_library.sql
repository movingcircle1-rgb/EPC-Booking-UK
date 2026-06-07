/*
  # Create Articles and Media Library System

  1. New Tables
    - `articles` - Blog posts and content pages
    - `media_library` - Media file management
    - `page_seo_metadata` - SEO settings for all pages

  2. Security
    - Enable RLS on all tables
    - Admin-2 and admin roles can manage all content
    - Public can read published articles
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text,
  category text DEFAULT 'general',
  tags text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_title text,
  meta_description text,
  author_id uuid,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  file_type text DEFAULT 'image' CHECK (file_type IN ('image', 'video', 'document', 'other')),
  mime_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  alt_text text DEFAULT '',
  category text DEFAULT 'general',
  tags text[] DEFAULT ARRAY[]::text[],
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create page SEO metadata table
CREATE TABLE IF NOT EXISTS page_seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text UNIQUE NOT NULL,
  page_title text NOT NULL,
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  meta_keywords text DEFAULT '',
  canonical_url text,
  og_image text,
  og_type text DEFAULT 'website',
  robots text DEFAULT 'index, follow',
  schema_markup jsonb DEFAULT '{}'::jsonb,
  priority numeric DEFAULT 0.8 CHECK (priority >= 0.0 AND priority <= 1.0),
  changefreq text DEFAULT 'weekly' CHECK (changefreq IN ('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never')),
  last_crawled timestamptz,
  crawl_status text DEFAULT 'pending' CHECK (crawl_status IN ('ok', 'error', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);

CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_page_seo_metadata_path ON page_seo_metadata(page_path);
CREATE INDEX IF NOT EXISTS idx_page_seo_metadata_crawl_status ON page_seo_metadata(crawl_status);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles table

-- Public can read published articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Admin-2 and admin users can view all articles
CREATE POLICY "Admin-2 and admin users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Admin-2 and admin users can insert articles
CREATE POLICY "Admin-2 and admin users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Admin-2 and admin users can update articles
CREATE POLICY "Admin-2 and admin users can update articles"
  ON articles FOR UPDATE
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

-- Admin-2 and admin users can delete articles
CREATE POLICY "Admin-2 and admin users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- RLS Policies for media_library table

-- Authenticated users can view media library
CREATE POLICY "Authenticated users can view media library"
  ON media_library FOR SELECT
  TO authenticated
  USING (true);

-- Admin-2 and admin users can insert media
CREATE POLICY "Admin-2 and admin users can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Admin-2 and admin users can update media
CREATE POLICY "Admin-2 and admin users can update media"
  ON media_library FOR UPDATE
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

-- Admin-2 and admin users can delete media
CREATE POLICY "Admin-2 and admin users can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- RLS Policies for page_seo_metadata table

-- Public can read SEO metadata
CREATE POLICY "Anyone can view SEO metadata"
  ON page_seo_metadata FOR SELECT
  USING (true);

-- Admin-2 and admin users can insert SEO metadata
CREATE POLICY "Admin-2 and admin users can insert SEO metadata"
  ON page_seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Admin-2 and admin users can update SEO metadata
CREATE POLICY "Admin-2 and admin users can update SEO metadata"
  ON page_seo_metadata FOR UPDATE
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

-- Admin-2 and admin users can delete SEO metadata
CREATE POLICY "Admin-2 and admin users can delete SEO metadata"
  ON page_seo_metadata FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_seo_metadata_updated_at ON page_seo_metadata;
CREATE TRIGGER update_page_seo_metadata_updated_at
  BEFORE UPDATE ON page_seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
