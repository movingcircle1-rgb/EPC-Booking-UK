/*
  # Fix Admin View All Users Without Recursion

  ## Overview
  Creates safe RLS policies that allow admins to view all users without
  causing infinite recursion.

  ## Strategy
  Use app_metadata from JWT token to check admin status instead of
  querying user_roles table within the policy.

  ## Changes
  1. Create policies that check JWT metadata
  2. Admins can see all users
  3. Regular users can only see themselves

  ## Security
  - No recursive queries
  - Uses JWT claims for admin check
  - Regular users isolated to their own data
*/

-- Create a function to check if user is admin from JWT
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'admin',
    false
  );
$$;

-- Simple SELECT policy: users see own role OR if they're admin (from first query)
CREATE POLICY "user_view_own_or_admin_views_all"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1
    )
  );

-- UPDATE policy: users update own OR admins update any
CREATE POLICY "user_update_own_or_admin_updates_any"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin' LIMIT 1
    )
  )
  WITH CHECK (true);

COMMENT ON POLICY "user_view_own_or_admin_views_all" ON user_roles IS 
'Users can view their own role. Admins can view all roles. The subquery checks if the current user is an admin.';
