/*
  # Fix Admin-2 Role Naming Mismatch in Articles RLS Policies

  ## Issue
  - Frontend uses 'admin-2' (with hyphen) as the role name
  - Database RLS policies check for 'admin2' (without hyphen)
  - This causes RLS policy failures when admin-2 users try to create articles

  ## Changes
  - Update all articles table RLS policies to accept both 'admin2' and 'admin-2'
  - This ensures compatibility with existing data and frontend code
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin-2 and admin users can view all articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can insert articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can update articles" ON articles;
DROP POLICY IF EXISTS "Admin-2 and admin users can delete articles" ON articles;

-- Recreate policies with corrected role names (support both 'admin2' and 'admin-2')

-- Admin and admin-2 users can view all articles
CREATE POLICY "Admin-2 and admin users can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

-- Admin and admin-2 users can insert articles
CREATE POLICY "Admin-2 and admin users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );

-- Admin and admin-2 users can update articles
CREATE POLICY "Admin-2 and admin users can update articles"
  ON articles FOR UPDATE
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

-- Admin and admin-2 users can delete articles
CREATE POLICY "Admin-2 and admin users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'admin2', 'admin-2')
    )
  );
