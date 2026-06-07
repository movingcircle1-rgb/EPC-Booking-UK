/*
  # Fix Admin-2 Role Naming in Media Library and SEO Metadata RLS Policies

  ## Issue
  - Frontend uses 'admin-2' (with hyphen) but RLS policies check for 'admin2'
  - Need to update media_library and page_seo_metadata policies for consistency

  ## Changes
  - Update all media_library RLS policies to accept 'admin', 'admin2', and 'admin-2'
  - Update all page_seo_metadata RLS policies to accept 'admin', 'admin2', and 'admin-2'
*/

-- Fix media_library policies
DROP POLICY IF EXISTS "Admin-2 and admin users can insert media" ON media_library;
DROP POLICY IF EXISTS "Admin-2 and admin users can update media" ON media_library;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete media" ON media_library;

CREATE POLICY "Admin-2 and admin users can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

CREATE POLICY "Admin-2 and admin users can update media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

CREATE POLICY "Admin-2 and admin users can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

-- Fix page_seo_metadata policies
DROP POLICY IF EXISTS "Admin-2 and admin users can insert SEO metadata" ON page_seo_metadata;
DROP POLICY IF EXISTS "Admin-2 and admin users can update SEO metadata" ON page_seo_metadata;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete SEO metadata" ON page_seo_metadata;

CREATE POLICY "Admin-2 and admin users can insert SEO metadata"
  ON page_seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

CREATE POLICY "Admin-2 and admin users can update SEO metadata"
  ON page_seo_metadata FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

CREATE POLICY "Admin-2 and admin users can delete SEO metadata"
  ON page_seo_metadata FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );
