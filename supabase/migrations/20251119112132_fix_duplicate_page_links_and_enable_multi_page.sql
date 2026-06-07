/*
  # Fix Duplicate Page Links and Enable Multi-Page Keyword Linking

  ## Overview
  This migration cleans up duplicate page_links entries and enables keywords to work
  across multiple pages by properly structuring the tracking system.

  ## Steps
  
  1. Remove duplicate page_links entries (keep the most recent one)
  2. Add composite unique constraint to prevent future duplicates
  3. Create views and functions for multi-page keyword analytics
  4. Update documentation

  ## Key Changes
  
  - Clean up existing duplicate data
  - Prevent future duplicates with unique constraint
  - Enable same keyword to work on multiple different pages
  - Frequency settings apply per-page, not globally
*/

-- Step 1: Remove duplicate page_links entries, keeping only the most recent one
DELETE FROM page_links a
USING page_links b
WHERE a.id < b.id
  AND a.source_page_url = b.source_page_url
  AND a.keyword_id = b.keyword_id;

-- Step 2: Drop any existing problematic unique constraints
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'page_links_keyword_id_key'
  ) THEN
    ALTER TABLE page_links DROP CONSTRAINT page_links_keyword_id_key;
  END IF;
END $$;

-- Step 3: Add composite unique constraint
-- This ensures each keyword can be tracked once per page, but allows same keyword on multiple pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'page_links_source_keyword_unique'
  ) THEN
    ALTER TABLE page_links 
      ADD CONSTRAINT page_links_source_keyword_unique 
      UNIQUE (source_page_url, keyword_id);
  END IF;
END $$;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_links_keyword_source 
  ON page_links(keyword_id, source_page_url);

CREATE INDEX IF NOT EXISTS idx_page_links_created 
  ON page_links(created_at DESC);

-- Step 5: Create view for keyword usage statistics across all pages
CREATE OR REPLACE VIEW keyword_usage_stats AS
SELECT 
  k.id AS keyword_id,
  k.keyword_text,
  k.target_url,
  k.category,
  k.priority,
  k.is_active,
  k.link_frequency,
  k.max_links_per_page,
  COUNT(DISTINCT pl.source_page_url) AS pages_count,
  COALESCE(SUM(pl.link_count), 0) AS total_links,
  ARRAY_AGG(DISTINCT pl.source_page_url ORDER BY pl.source_page_url) 
    FILTER (WHERE pl.source_page_url IS NOT NULL) AS pages_with_links,
  MAX(pl.created_at) AS last_used_at
FROM keywords k
LEFT JOIN page_links pl ON k.id = pl.keyword_id
GROUP BY k.id, k.keyword_text, k.target_url, k.category, k.priority, k.is_active, k.link_frequency, k.max_links_per_page;

-- Grant access to the view
GRANT SELECT ON keyword_usage_stats TO authenticated, anon;

-- Step 6: Function to get all pages where a specific keyword is used
CREATE OR REPLACE FUNCTION get_keyword_pages(keyword_id_param uuid)
RETURNS TABLE (
  page_url text,
  link_count integer,
  anchor_text text,
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pl.source_page_url,
    pl.link_count,
    pl.anchor_text,
    pl.created_at
  FROM page_links pl
  WHERE pl.keyword_id = keyword_id_param
  ORDER BY pl.created_at DESC;
END;
$$;

-- Step 7: Function to clear page links for a specific page
CREATE OR REPLACE FUNCTION clear_page_links(page_url_param text)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM page_links
  WHERE source_page_url = page_url_param;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Step 8: Function to clear all links for a specific keyword across all pages
CREATE OR REPLACE FUNCTION clear_keyword_links(keyword_id_param uuid)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM page_links
  WHERE keyword_id = keyword_id_param;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Step 9: Update keywords updated_at trigger
CREATE OR REPLACE FUNCTION update_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_keywords_updated_at ON keywords;
CREATE TRIGGER trigger_update_keywords_updated_at
  BEFORE UPDATE ON keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_keywords_updated_at();
